<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\StoreOrder;
use App\Models\WarehouseOutbound;
use App\Models\WarehouseOutboundDetail;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class OutboundController extends Controller
{

    public function index(Request $request)
    {
        // Gate::authorize('formula.read');

        $pagination = WarehouseOutbound::query()
            ->leftJoin('warehouses as w', 'warehouse_outbounds.warehouse_id', '=', 'w.id')
            ->leftJoin('users as u', 'warehouse_outbounds.user_id', '=', 'u.id')
            ->leftJoin('couriers as c', 'warehouse_outbounds.courier_id', '=', 'c.id')
            ->select('warehouse_outbounds.*', 'w.name as warehouse_name', 'u.name as user_fullname', 'c.name as courier_name')
            ->groupBy('warehouse_outbounds.id', 'w.name', 'u.name', 'c.name')
            ->paginate(10);

        return Inertia::render('outbound/index', ['pagination' => $pagination]);
    }

    public function detail(Request $request)
    {
        $headerId = $request->input('header_id');
        $header = null;
        $detailsPagination = null;

        if ($headerId) {
            $header = WarehouseOutbound::findOrFail($headerId);
            $detailsPagination = WarehouseOutboundDetail::query()
                ->leftJoin('items as i', 'i.id', '=', 'warehouse_outbound_details.item_id')
                ->leftJoin('products as p', 'p.id', '=', 'i.product_id')
                ->where('warehouse_inbound_id', $header->id)
                ->select('warehouse_outbound_details.*', 'p.name as product_name','i.expired_date')
                ->paginate(5);
        }

        return Inertia::render('outbound/detail', [
            'detailsPagination' => $detailsPagination,
            'header' => $header
        ]);
    }

    public function saveHeader(Request $request)
    {
        $rules = [
            'supplier_id' => ['string', 'required', 'exists:suppliers,id'],
            'received_by' => ['string', 'required', 'exists:users,id'],
            'warehouse_id' => ['string', 'required', 'exists:warehouses,id'],
            'invoice_number' => ['string', 'nullable'],
            'delivery_order_number' => ['string', 'nullable'],
            'received_date' => ['date', 'required'],
        ];

        $validated = $request->validate($rules);

        $header = WarehouseOutbound::newModelInstance();
        DB::transaction(function () use ($validated, $request, &$header) {
            if ($request->id) {
                $header = WarehouseOutbound::updateOrCreate(
                    ['id' => $request->id],
                    $validated
                );
            } else {
                $header = WarehouseOutbound::create($validated);
            }

            $result = WarehouseOutboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->grand_total,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('outbound.detail', ['header_id' => $header->id]);
    }

    public function saveDetail(Request $request)
    {
        $rules = [
            'warehouse_inbound_id' => ['string', 'required', 'exists:warehouse_outbounds,id'],
            'product_id' => ['string', 'required', 'exists:products,id'],
            'expired_date' => ['date', 'nullable'],
            'quantity' => ['numeric', 'required'],
            'note' => ['string', 'nullable']
        ];

        $validated = $request->validate($rules);

        DB::transaction(function () use ($validated, $request) {
            if ($request->id) {
                $detail = WarehouseOutboundDetail::updateOrCreate(
                    ['id' => $request->id],
                    $validated
                );
            } else {
                $detail = WarehouseOutboundDetail::create($validated);
            }

            $header = WarehouseOutbound::findOrFail($detail->warehouse_inbound_id);

            $result = WarehouseOutboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->grand_total,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('outbound.detail', ['header_id' => $validated['warehouse_inbound_id']]);
    }

    public function deleteDetail(string $detailId)
    {
        $headerId = null;
        $item = Item::where('warehouse_inbound_detail_id', $detailId)->first();
        if ($item) {
            return redirect()->back()->withErrors(['error'=> 'Detail tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
        }
        DB::transaction(function () use (&$headerId, $detailId) {
            $detail = WarehouseOutboundDetail::findOrFail($detailId);
            $headerId = $detail->warehouse_inbound_id;
            $detail->delete();
            $header = WarehouseOutbound::findOrFail($detail->warehouse_inbound_id);

            $result = WarehouseOutboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->grand_total,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('outbound.detail', ['header_id' => $headerId]);
    }

    public function deleteHeader(string $headerId)
    {
        $item = WarehouseOutbound::join('warehouse_outbound_details', 'warehouse_outbound_details.warehouse_inbound_id', '=', 'warehouse_outbounds.id')
            ->join('items', 'items.warehouse_inbound_detail_id', '=', 'warehouse_outbound_details.id')
            ->where('warehouse_outbounds.id', $headerId)
            ->first();

        if ($item) {
            return redirect()->back()->withErrors(['error' => 'outbound tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
        }

        DB::transaction(function () use ($headerId) {
            $header = WarehouseOutbound::findOrFail($headerId);
            WarehouseOutboundDetail::where('warehouse_inbound_id', $header->id)->delete();
            $header->delete();
        });

        return to_route('outbound.index');
    }

    public function getAllOrderPacking(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;


        $data = StoreOrder::where('status','packing')
            ->when($search, function ($query, $search) {
                return $query->where('order_number', 'ILIKE', "{$search}%");
            })
            ->offset($offset)
            ->limit(30)->get();

        return Response::json($data);
    }

}
