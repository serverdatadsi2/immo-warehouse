<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\StoreOrder;
use App\Models\StoreOrderDetail;
use App\Models\WarehouseInbound;
use App\Models\WarehouseInboundDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Log;

class ReceivingOrderController extends Controller
{

    public function index(Request $request)
    {
        $user = auth()->user();
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');;

        $pagination = StoreOrder::query()
            ->leftJoin('stores as s', 's.id', '=', 'store_orders.store_id')
            ->leftJoin('users as u', 'u.id', '=', 'store_orders.approved_by')
            ->select('s.*', 's.name as store_name', 'u.name as approved_name')
            ->where('status','approved')
            ->where(function ($q) use ($userWarehouseIds) {
                $q->whereNull('store_orders.warehouse_id')
                ->orWhereIn('store_orders.warehouse_id', $userWarehouseIds);
            })
            ->groupBy('s.id', 's.name', 'u.name')
            ->paginate(10);

        return Inertia::render('receiving-order/index', ['pagination' => $pagination]);
    }

    public function detail(Request $request)
    {
        $headerId = $request->input('header_id');
        $header = null;
        $detailsPagination = null;

        if ($headerId) {
            $header = StoreOrder::findOrFail($headerId);
            $detailsPagination = StoreOrderDetail::query()
                ->leftJoin('products as p', 'p.id', '=', 'warehouse_inbound_details.product_id')
                ->where('warehouse_inbound_id', $header->id)
                ->select('store_order_details.*', 'p.name as product_name')
                ->paginate(5);
        }

        return Inertia::render('receiving-order/detail', [
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
}
