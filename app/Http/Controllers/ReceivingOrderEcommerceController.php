<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\EcommerceOrderDetail;
use App\Models\StoreOrder;
use App\Models\StoreOrderDetail;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Log;

class ReceivingOrderEcommerceController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'dateRange']);
        $search = $filters['search'] ?? null;
        $dates = $request->query('dateRange');

        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $query = EcommerceOrder::query()
            ->join('customers as c', 'c.id', '=', 'ecommerce_orders.customer_id')
            ->join('ecommerce_payments as ep', 'ep.ecommerce_order_id', '=', 'ecommerce_orders.id')
            ->join('payments as p', 'p.id', '=', 'ep.payment_id')
            ->when(!empty($dates) && count($dates) === 2, function ($q) use ($dates) {
                $from = trim($dates[0]);
                $to = trim($dates[1]);
                $q->whereBetween('p.completed_at', [
                    Carbon::parse($from)->startOfDay(),
                    Carbon::parse($to)->endOfDay(),
                ]);
            }, function ($q) {
                $q->whereNotNull('p.completed_at');
            })
            ->select('ecommerce_orders.*', 'c.name as order_by', 'c.wa_number', 'p.completed_at as approve_at')
            ->where('ecommerce_orders.status', $filters['status'] ?? 'paid')
            ->where('ecommerce_orders.handled_by_warehouse_id', $userWarehouseId)
            ->groupBy('ecommerce_orders.id', 'c.name', 'c.wa_number', 'p.completed_at');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('c.name', 'ILIKE', "%{$search}%")->orWhere('ecommerce_orders.order_number', 'ILIKE', "%{$search}%");
            });
        }

        $pagination = $query->simplePaginate(10);

        return Inertia::render('receiving-order/ecommerce/index', ['pagination' => $pagination, 'params' => $filters]);
    }

    public function detail(Request $request)
    {
        $headerId = $request->input('headerId');
        $header = null;
        $detailsPagination = null;
        $availableStocks = null;

        if ($headerId) {
            $header = EcommerceOrder::query()
                ->join('customers as c', 'c.id', '=', 'ecommerce_orders.customer_id')
                ->join('ecommerce_payments as ep', 'ep.ecommerce_order_id', '=', 'ecommerce_orders.id')
                ->join('payments as p', 'p.id', '=', 'ep.payment_id')
                ->whereNotNull('p.completed_at')
                ->select('ecommerce_orders.*', 'c.name as customer_name', 'p.completed_at')
                ->where('ecommerce_orders.id', $headerId)
                ->first();

            $detailsPagination = EcommerceOrderDetail::query()
                ->leftJoin('products as p', 'p.id', '=', 'ecommerce_order_details.product_id')
                ->where('ecommerce_order_id', $header->id)
                ->select('ecommerce_order_details.*', 'p.name as product_name')
                ->paginate(10);

            if ($header->status !== 'paid' && $header->status !== 'cancelled' && $header->status !== 'pandding') {
                $productIds = $detailsPagination->pluck('product_id')->toArray();

                $user = auth()->user();
                $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

                $selectColumns = ['p.id as product_id', 'p.name as product_name', 'p.code as product_code', 'w.id as warehouse_id', 'w.name as warehouse_name', 'lr.name as layer_name', 'lr.code as layer_code', 'rk.name as rack_name', 'rk.code as rack_code', 'rm.name as room_name', 'rm.code as room_code', 'i.expired_date', 'wi.received_date as inbound_at'];

                $groupingColumns = ['p.id', 'p.name', 'p.code', 'w.id', 'w.name', 'ic.name', 'lr.name', 'lr.code', 'rk.name', 'rk.code', 'rm.name', 'rm.code', 'i.expired_date', 'wi.received_date'];

                $query = WarehouseStock::query()
                    ->join('items as i', function ($join) {
                        $join->on('i.id', '=', 'warehouse_items.item_id')->where('i.status', '=', 'warehouse_stock');
                    })
                    ->join('warehouse_inbound_details as wid', 'wid.id', '=', 'i.warehouse_inbound_detail_id')
                    ->join('warehouse_inbounds as wi', 'wi.id', '=', 'wid.warehouse_inbound_id')
                    ->join('products as p', 'p.id', '=', 'i.product_id')
                    ->leftJoin('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')
                    ->join('warehouses as w', 'w.id', '=', 'warehouse_items.warehouse_id')
                    ->leftJoin('locations as lr', 'lr.id', '=', 'i.current_location_id')
                    ->leftJoin('locations as rk', 'rk.id', '=', 'lr.location_parent_id')
                    ->leftJoin('locations as rm', 'rm.id', '=', 'rk.location_parent_id')
                    ->where('w.id', $userWarehouseId)
                    ->whereIn('p.id', $productIds)
                    ->where('ic.name', 'Good')
                    ->orderBy('i.expired_date', 'asc')
                    ->orderBy('wi.received_date', 'asc')

                    ->select(array_merge($selectColumns, [\DB::raw('COUNT(warehouse_items.id) AS quantity')]));
                $query->groupBy($groupingColumns);
                $availableStocks = $query->get();
            }
        }

        return Inertia::render('receiving-order/ecommerce/detail', [
            'detailsPagination' => $detailsPagination,
            'header' => $header,
            'availableStocks' => $availableStocks,
        ]);
    }

    public function updateHeader($id)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $selectColumns = ['p.id as product_id', 'p.name as product_name', 'p.code as product_code', 'w.id as warehouse_id', 'w.name as warehouse_name'];

        $groupingColumns = ['p.id', 'p.name', 'p.code', 'w.id', 'w.name', 'ic.name'];

        $query = WarehouseStock::query()
            ->join('items as i', function ($join) {
                $join->on('i.id', '=', 'warehouse_items.item_id')->where('i.status', '=', 'warehouse_stock');
            })
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->leftJoin('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')
            ->join('warehouses as w', 'w.id', '=', 'warehouse_items.warehouse_id')
            ->where('w.id', $userWarehouseId)
            ->where('ic.name', 'Good')

            ->select(array_merge($selectColumns, [\DB::raw('COUNT(warehouse_items.id) AS quantity')]));

        $query->groupBy($groupingColumns);
        $availableStocks = $query->get();

        $availableStocksMap = $availableStocks->keyBy('product_id')->map(function ($stock) {
            return (int) $stock->quantity;
        });

        $orderDetails = EcommerceOrderDetail::with('product')->where('ecommerce_order_id', $id)->get();

        $stockErrors = [];
        foreach ($orderDetails as $detail) {
            $approvedQuantity = (int) $detail->quantity;
            $productId = $detail->product_id;

            // Ambil stok yang tersedia dari map
            $availableQuantity = $availableStocksMap->get($productId, 0);

            // Bandingkan
            if ($approvedQuantity > $availableQuantity) {
                $stockErrors[] = ["Stok {$detail->product->name} tidak mencukupi."];
            }
        }

        if (!empty($stockErrors)) {
            return back()->withErrors(['message' => $stockErrors[0]]);
        }

        $order = EcommerceOrder::findOrFail($id);

        if (!$userWarehouseId) {
            return back()->withErrors(['error' => 'Maaf and Tidak boleh melakukan proses ini']);
        }

        $order->status = 'processed';
        $order->save();

        // return to_route('outbound-dc.index');
        return to_route('receiving-order.ecommerce-order.detail', ['headerId' => $id]);
    }
}
