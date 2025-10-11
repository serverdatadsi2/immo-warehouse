<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StagingController extends Controller
{
    public function index(Request $request)
    {
        // $filters = $request->only(['search', 'dateRange']);
        // $search = $filters['search'] ?? '';
        // $dates = $filters['dateRange'] ?? '';

        // $query = StoreOrder::query()
        //     ->when($search, function ($query, $search) {
        //         $query->whereHas('store', function ($subQuery) use ($search) {
        //             $subQuery->where('name', 'ILIKE', '%' . $search . '%');
        //         });
        //     })
        //     ->with([
        //         'details' => function ($query) {
        //             $query->select('id', 'store_order_id', 'product_id', 'approved_qty');
        //         },
        //         'details.product' => function ($query) {
        //             $query->select('id', 'name', 'code');
        //         },
        //         'store' => function ($query) {
        //             $query->select('id', 'name');
        //         },
        //     ])
        //     ->where('status', 'received')
        //     ->orWhere('status', 'processing')
        //     ->orderBy('approved_at', 'asc');

        // if (!empty($dates) && count($dates) === 2) {
        //     $query->whereBetween('store_orders.approved_at', $dates);
        // }

        // $storeOrders = $query->paginate(10);

        // return inertia('packing/index', [
        //     'pagination' => $storeOrders,
        //     'params' => $filters,
        // ]);
        return inertia('staging/index');
    }
}
