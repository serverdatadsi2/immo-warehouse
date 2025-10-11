<?php

namespace App\Http\Controllers;

use App\Models\StoreOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PackingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'dateRange', 'status']);
        $status = $filters['status'] ?? '';
        $search = $filters['search'] ?? '';
        $dates = $filters['dateRange'] ?? '';

        $query = StoreOrder::query()
            ->when($search, function ($query, $search) {
                $query->whereHas('store', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'ILIKE', '%' . $search . '%');
                });
            })
            ->with([
                'details' => function ($query) {
                    $query->select('id', 'store_order_id', 'product_id', 'approved_qty');
                },
                'details.product' => function ($query) {
                    $query->select('id', 'name', 'code');
                },
                'store' => function ($query) {
                    $query->select('id', 'name');
                },
            ])
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->unless($status, function ($query) {
                $query->where(function ($subQuery) {
                    $subQuery->orWhere('status', 'received')
                            ->orWhere('status', 'processing')
                            ->orWhere('status', 'packing');
                });
            })
            ->orderBy('approved_at', 'asc');

        if (!empty($dates) && count($dates) === 2) {
            $query->whereBetween('store_orders.approved_at', $dates);
        }

        $storeOrders = $query->paginate(10);

        return inertia('packing/index', [
            'pagination' => $storeOrders,
            'params' => $filters,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $storeOrder = StoreOrder::findOrFail($id);

            $storeOrder->status = 'packing';
            $storeOrder->updated_at = now();
            $storeOrder->save();

            return redirect()
                ->route('packing.index')
                ->with('success', "Status Store Order {$storeOrder->no_store_order} berhasil diperbarui.");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Gagal memperbarui status Store Order. Error: ' . $e->getMessage());
        }
    }
}
