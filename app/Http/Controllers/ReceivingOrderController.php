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
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $pagination = StoreOrder::query()
            ->leftJoin('stores as s', 's.id', '=', 'store_orders.store_id')
            ->leftJoin('users as u', 'u.id', '=', 'store_orders.approved_by')
            ->select('store_orders.*', 's.name as store_name', 'u.name as approved_name')
            ->where('status','approved')
            ->where(function ($q) use ($userWarehouseIds) {
                $q->whereNull('store_orders.warehouse_id')
                ->orWhereIn('store_orders.warehouse_id', $userWarehouseIds);
            })
            ->groupBy('store_orders.id', 's.name', 'u.name')
            ->paginate(10);

        return Inertia::render('receiving-order/index', ['pagination' => $pagination]);
    }

    public function detail(Request $request)
    {
        $headerId = $request->input('header_id');
        $header = null;
        $detailsPagination = null;

        if ($headerId) {
            $header = StoreOrder::query()
            ->where('store_orders.id', $headerId)
            ->leftJoin('stores as s', 's.id', '=', 'store_orders.store_id')
            ->leftJoin('users as u', 'u.id', '=', 'store_orders.approved_by')
            ->select(
                'store_orders.*',
                's.name as store_name',
                'u.name as approved_name'
            )
            ->first();

            $detailsPagination = StoreOrderDetail::query()
                ->leftJoin('products as p', 'p.id', '=', 'store_order_details.product_id')
                ->where('store_order_id', $header->id)
                ->select('store_order_details.*', 'p.name as product_name')
                ->paginate(5);
        }

        return Inertia::render('receiving-order/detail', [
            'detailsPagination' => $detailsPagination,
            'header' => $header
        ]);
    }

    public function updateHeader($id)
    {
        $user = auth()->user();

        $order = StoreOrder::findOrFail($id);

        // ambil warehouse pertama milik user
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        if (!$userWarehouseId) {
            return back()->withErrors(['error' => 'Maaf and Tidak boleh melakukan proses ini']);
        }

        $order->warehouse_id = $userWarehouseId;
        $order->save();

        return to_route('receiving-order.index');
    }
}
