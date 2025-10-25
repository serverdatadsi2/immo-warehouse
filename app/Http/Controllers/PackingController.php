<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
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
        $status = $filters['status'] ?? 'processing';
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

        return inertia('packing/store/index', [
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
                ->route('packing.store.index')
                ->with('success', "Status Store Order {$storeOrder->order_number} berhasil diperbarui.");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Gagal memperbarui status Store Order. Error: ' . $e->getMessage());
        }
    }

    public function packingEcommerce(Request $request)
    {
        $filters = $request->only(['search', 'dateRange', 'status']);
        $status = $filters['status'] ?? 'paid';
        $search = $filters['search'] ?? '';
        $dates = $filters['dateRange'] ?? '';

        $query = EcommerceOrder::query()
            ->when($search, function ($query, $search) {
                $query->whereHas('customer', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'ILIKE', '%' . $search . '%');
                });
            })
            ->with([
                'details:id,ecommerce_order_id,product_id,quantity,note' ,
                'details.product:id,name,code',
                'customer:id,name',
                'payment:id,completed_at,status',
            ])
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->unless($status, function ($query) {
                $query->where(function ($subQuery) {
                    $subQuery->orWhere('status', 'received')
                            ->orWhere('status', 'processed')
                            ->orWhere('status', 'packing');
                });
            })
            ->orderBy('created_at', 'asc');

            if (!empty($dates) && count($dates) === 2) {
                $query->whereHas('payment', function ($subQuery) use ($dates) {
                    $subQuery->whereBetween('completed_at', $dates);
                });
            }

        $orders = $query->paginate(10);

        return inertia('packing/ecommerce/index', [
            'pagination' => $orders,
            'params' => $filters,
        ]);
    }

    public function updateStatusOrderEcommerce(Request $request, $id)
    {
        try {
            $order = EcommerceOrder::findOrFail($id);

            $order->status = 'packing';
            $order->save();

            return redirect()
                ->route('packing.ecommerce.index')
                ->with('success', "Status Ecommerce Order {$order->order_number} berhasil diperbarui.");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Gagal memperbarui status Ecommerce Order. Error: ' . $e->getMessage());
        }
    }
}
