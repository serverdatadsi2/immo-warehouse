<?php

namespace App\Http\Controllers;

use App\Models\WarehouseInbound;
use App\Models\WarehouseInboundDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InboundController extends Controller
{

    public function index(Request $request)
    {
        // Gate::authorize('formula.read');

        $pagination = WarehouseInbound::query()
            ->leftJoin('suppliers as s', 'warehouse_inbounds.supplier_id', '=', 's.id')
            ->leftJoin('warehouses as w', 'warehouse_inbounds.warehouse_id', '=', 'w.id')
            ->leftJoin('users as u', 'warehouse_inbounds.received_by', '=', 'u.id')
            ->select('warehouse_inbounds.*', 's.name as supplier_name', 'w.name as warehouse_name', 'u.name as received_name')
            ->groupBy('warehouse_inbounds.id', 's.name', 'w.name', 'u.name')
            ->paginate(10);

        return Inertia::render('inbound/index', ['pagination' => $pagination]);
    }

    public function detail(Request $request)
    {
        $headerId = $request->input('header_id');
        $header = null;
        $detailsPagination = null;

        if ($headerId) {
            $header = WarehouseInbound::findOrFail($headerId);
            $detailsPagination = WarehouseInboundDetail::query()
                ->leftJoin('products as p', 'p.id', '=', 'warehouse_inbound_details.product_id')
                ->where('warehouse_inbound_id', $header->id)
                ->select('warehouse_inbound_details.*', 'p.name as product_name')
                ->paginate(5);
        }

        return Inertia::render('inbound/detail', [
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

        return to_route('inbound.detail', ['header_id' => $header->id]);
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

        DB::transaction(function () use ($validated, $request) {
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

        return to_route('inbound.detail', ['header_id' => $validated['warehouse_inbound_id']]);
    }

    public function deleteDetail(string $detailId)
    {
        $headerId = null;
        DB::transaction(function () use (&$headerId, $detailId) {
            $detail = WarehouseInboundDetail::findOrFail($detailId);
            $headerId = $detail->warehouse_inbound_id;
            $detail->delete();
            $header = WarehouseInbound::findOrFail($detail->warehouse_inbound_id);

            $result = WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->grand_total,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('inbound.detail', ['header_id' => $headerId]);
    }

    public function deleteHeader(string $headerId)
    {

        DB::transaction(function () use ($headerId) {
            $header = WarehouseInbound::findOrFail($headerId);
            WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)->delete();
            $header->delete();
        });

        return to_route('inbound.index');
    }

}
