<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\StoreOrder;
use App\Models\StoreReturn;
use App\Models\WarehouseInbound;
use App\Models\WarehouseInboundDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Log;

class ReturnInboundController extends Controller
{
    public function history(Request $request)
    {
        // Gate::authorize('formula.read');
        $user = auth()->user();
        // ambil warehouse pertama milik user
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $pagination = WarehouseInbound::query()
            ->with(['inboundDetail', 'inboundDetail.product:id,name'])
            ->join('store_returns as sr', 'sr.id', '=', 'warehouse_inbounds.store_return_id')
            ->join('stores as s', 's.id', '=', 'sr.store_id')
            ->leftJoin('warehouses as w', 'warehouse_inbounds.warehouse_id', '=', 'w.id')
            ->leftJoin('users as u', 'warehouse_inbounds.received_by', '=', 'u.id')
            ->whereIn('w.id', $userWarehouseIds)
            // ->whereNotNull('warehouse_inbounds.store_return_id')
            ->where('warehouse_inbounds.inbound_type', 'store_return')
            ->select('warehouse_inbounds.*', 'w.name as warehouse_name', 'u.name as received_name', 's.name as store_name')
            ->groupBy('warehouse_inbounds.id', 'w.name', 'u.name', 's.name')
            ->simplePaginate(10);

        return Inertia::render('inbounds/return-inbound/history', ['pagination' => $pagination]);
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $pagination = StoreReturn::query()
            ->with(['details', 'store:id,name','approved:id,name'])
            ->where('warehouse_id',$userWarehouseId)
            ->whereNotNull('approved_at')
            ->whereNotNull('approved_by')
            ->whereNotNull('shipped_at')
            ->simplePaginate(10);

        return Inertia::render('inbounds/return-inbound/index', ['pagination' => $pagination]);
   }

    public function detail(Request $request)
    {
        $storeReturnId = $request->input('storeReturnId');
        $headerId = $request->input('headerId');
        $header = null;
        $storeReturn = null;
        $detailsPagination = null;

        if ($storeReturnId) {
            $storeReturn = StoreReturn::query()
            ->with(['details', 'store:id,name','approved:id,name'])
            // ->where('warehouse_id',$userWarehouseId)
            ->whereNotNull('approved_at')
            ->whereNotNull('approved_by')
            ->findOrFail($storeReturnId);
        }

        if ($storeReturnId) {
            $header = WarehouseInbound::where('store_return_id', $storeReturnId)->first();
            $detailsPagination = WarehouseInboundDetail::query()
                ->leftJoin('products as p', 'p.id', '=', 'warehouse_inbound_details.product_id')
                ->where('warehouse_inbound_id', $header->id)
                ->select('warehouse_inbound_details.*', 'p.name as product_name')
                ->simplePaginate(5);
        }

        return Inertia::render('inbounds/return-inbound/detail', [
            'detailsPagination' => $detailsPagination,
            'header' => $header,
            'storeReturn' => $storeReturn,
            'storeReturnId' => $storeReturnId
        ]);
    }

    public function saveHeader(Request $request)
    {
        $rules = [
            'store_return_id' => ['string', 'required', 'exists:store_returns,id'],
            'received_by' => ['string', 'required', 'exists:users,id'],
            'warehouse_id' => ['string', 'required', 'exists:warehouses,id'],
            'invoice_number' => ['string', 'nullable'],
            'delivery_order_number' => ['string', 'nullable'],
            'received_date' => ['date', 'required'],
        ];

        $validated = array_merge($request->validate($rules), [
                        'inbound_type' => 'store_return',
                    ]) ;

        $header = WarehouseInbound::newModelInstance();
        DB::transaction(function () use ($validated, $request, &$header) {
            if ($request->id) {
                $header = WarehouseInbound::updateOrCreate(
                    ['id' => $request->id],
                    $validated
                );
            } else {
                $header = WarehouseInbound::create($validated);
            }

            $result = WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->grand_total,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('inbounds.return-store.detail', ['headerId' => $header->id]);
    }

    public function saveDetail(Request $request)
    {
        $rules = [
            'warehouse_inbound_id' => ['string', 'required', 'exists:warehouse_inbounds,id'],
            'product_id' => ['string', 'required', 'exists:products,id'],
            'expired_date' => ['date', 'nullable'],
            'quantity' => ['numeric', 'required'],
            'note' => ['string', 'nullable']
        ];

        $validated = $request->validate($rules);
        $header = null;

        DB::transaction(function () use (&$header, $validated, $request) {
            if ($request->id) {
                $detail = WarehouseInboundDetail::updateOrCreate(
                    ['id' => $request->id],
                    $validated
                );
            } else {
                $detail = WarehouseInboundDetail::create($validated);
            }

            $header = WarehouseInbound::findOrFail($detail->warehouse_inbound_id);

            $result = WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->grand_total,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('inbounds.return-store.detail', ['storeReturnId' => $header->store_return_id]);
    }

    public function deleteDetail(string $detailId)
    {
        $header = null;
        $item = Item::where('warehouse_inbound_detail_id', $detailId)->first();
        if ($item) {
            return redirect()->back()->withErrors(['error'=> 'Detail tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
        }
        DB::transaction(function () use (&$header, $detailId) {
            $detail = WarehouseInboundDetail::findOrFail($detailId);
            $header = WarehouseInbound::findOrFail($detail->warehouse_inbound_id);
            $detail->delete();

            $result = WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->grand_total,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('inbounds.return-store.detail', ['storeReturnId' => $header->store_return_id]);
    }

    public function deleteHeader(string $headerId)
    {
        $item = WarehouseInbound::join('warehouse_inbound_details', 'warehouse_inbound_details.warehouse_inbound_id', '=', 'warehouse_inbounds.id')
            ->join('items', 'items.warehouse_inbound_detail_id', '=', 'warehouse_inbound_details.id')
            ->where('warehouse_inbounds.id', $headerId)
            ->first();

        if ($item) {
            return redirect()->back()->withErrors(['error' => 'Inbound tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
        }

        DB::transaction(function () use ($headerId) {
            $header = WarehouseInbound::findOrFail($headerId);
            WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)->delete();
            $header->delete();
        });

        return to_route('inbounds.return-store.index');
    }
}
