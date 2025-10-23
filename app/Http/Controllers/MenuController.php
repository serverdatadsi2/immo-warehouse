<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\StoreOrder;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function counts(Request $request)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $ecommerceCount = function (string $status) use ($userWarehouseId) {
            return EcommerceOrder::query()
                ->join('customers as c', 'c.id', '=', 'ecommerce_orders.customer_id')
                ->join('ecommerce_payments as ep', 'ep.ecommerce_order_id', '=', 'ecommerce_orders.id')
                ->join('payments as p', 'p.id', '=', 'ep.payment_id')
                ->whereNotNull('p.completed_at')
                ->where('ecommerce_orders.status', $status)
                ->where('ecommerce_orders.handled_by_warehouse_id', $userWarehouseId)
                ->distinct('ecommerce_orders.id')
                ->count('ecommerce_orders.id');
        };

        return response()->json([
            'store_order'      => StoreOrder::where('status', 'approved')->where('warehouse_id', $userWarehouseId)->count(),
            'store_packing'    => StoreOrder::where('status', 'processing')->where('warehouse_id', $userWarehouseId)->count(),
            'ecommerce_order'  => $ecommerceCount('paid'),
            'ecommerce_packing'=> $ecommerceCount('processed'),
        ]);
    }
}
