<?php

namespace App\Http\Controllers;

use App\Models\StoreOrder;
use App\Models\StoreOrderDetail;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Log;

class ReceivingOrderController extends Controller
{

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'dateRange']);
        $search = $filters['search'] ?? null;
        $dates = $request->query('dateRange');

        $user = auth()->user();
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $query = StoreOrder::query()
            ->join('stores as s', 's.id', '=', 'store_orders.store_id')
            ->join('users as u', 'u.id', '=', 'store_orders.approved_by')
            ->select('store_orders.*', 's.name as store_name', 'u.name as approved_name')
            ->where('status',$filters['status'] ?? 'approved')
            ->where(function ($q) use ($userWarehouseIds) {
                $q->whereNull('store_orders.warehouse_id')
                ->orWhereIn('store_orders.warehouse_id', $userWarehouseIds);
            })
            ->groupBy('store_orders.id', 's.name', 'u.name');

        if (!empty($search)) {

            $query->where(function ($q) use ($search) {
                $q->where('s.name', 'ILIKE', "%{$search}%")
                  ->orWhere('store_orders.order_number', 'ILIKE', "%{$search}%");
            });
        }
        if (!empty($dates) && count($dates) === 2) {
            $from = trim($dates[0]);
            $to = trim($dates[1]);

            $query->where('store_orders.approved_at', '>=', Carbon::parse($from)->startOfDay());
            $query->where('store_orders.approved_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $pagination = $query->paginate(10);

        return Inertia::render('receiving-order/index', ['pagination' => $pagination, 'params' => $filters]);
    }

    public function detail(Request $request)
    {
        $headerId = $request->input('header_id');
        $header = null;
        $detailsPagination = null;
        $availableStocks = null;

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
                ->paginate(10);


        if($header->status !== 'approved'&& $header->status !== 'requested'&& $header->status !== 'draft'){

            $productIds = $detailsPagination->pluck('product_id')->toArray();

            $user = auth()->user();
            $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

            $selectColumns = [
                'p.id as product_id', 'p.name as product_name', 'p.code as product_code',
                'w.id as warehouse_id', 'w.name as warehouse_name',
                'lr.name as layer_name', 'lr.code as layer_code',
                'rk.name as rack_name', 'rk.code as rack_code',
                'rm.name as room_name', 'rm.code as room_code',
                'i.expired_date', 'wi.received_date as inbound_at',
            ];

            $groupingColumns = [
                'p.id', 'p.name', 'p.code',
                'w.id', 'w.name',
                'ic.name',
                'lr.name', 'lr.code',
                'rk.name', 'rk.code',
                'rm.name', 'rm.code',
                'i.expired_date', 'wi.received_date',
            ];

            $query = WarehouseStock::query()
                ->join('items as i', function ($join) {
                        $join->on('i.id', '=', 'warehouse_items.item_id')
                            ->where('i.status', '=', 'warehouse_stock');
                    })
                ->join('warehouse_inbound_details as wid', 'wid.id', '=', 'i.warehouse_inbound_detail_id')
                ->join('warehouse_inbounds as wi', 'wi.id', '=', 'wid.warehouse_inbound_id')
                ->join('products as p', 'p.id', '=', 'i.product_id')
                ->leftJoin('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')
                ->join('warehouses as w', 'w.id', '=', 'warehouse_items.warehouse_id')
                ->leftJoin('locations as lr', 'lr.id', '=', 'i.current_location_id')
                ->leftJoin('locations as rk', 'rk.id', '=', 'lr.location_parent_id')
                ->leftJoin('locations as rm', 'rm.id', '=', 'rk.location_parent_id')
                ->where('w.id',$userWarehouseId)
                ->whereIn('p.id',$productIds)
                ->where('ic.name','Good')
                ->orderBy('i.expired_date','asc')
                ->orderBy('wi.received_date','asc')

                ->select(array_merge($selectColumns, [
                    \DB::raw('COUNT(warehouse_items.id) AS quantity')
                ]));
            $query->groupBy($groupingColumns);
            $availableStocks = $query->get();

            }
        }

        return Inertia::render('receiving-order/detail', [
            'detailsPagination' => $detailsPagination,
            'header' => $header,
            'availableStocks' => $availableStocks,
        ]);
    }

    public function updateHeader($id)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $selectColumns = [
            'p.id as product_id', 'p.name as product_name', 'p.code as product_code',
            'w.id as warehouse_id', 'w.name as warehouse_name',
        ];

        $groupingColumns = [
            'p.id', 'p.name', 'p.code',
            'w.id', 'w.name',
            'ic.name',
        ];

        $query = WarehouseStock::query()
            ->join('items as i', function ($join) {
                    $join->on('i.id', '=', 'warehouse_items.item_id')
                        ->where('i.status', '=', 'warehouse_stock');
                })
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->leftJoin('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')
            ->join('warehouses as w', 'w.id', '=', 'warehouse_items.warehouse_id')
            ->where('w.id',$userWarehouseId)
            ->where('ic.name','Good')

            ->select(array_merge($selectColumns, [
                \DB::raw('COUNT(warehouse_items.id) AS quantity')
            ]));

        $query->groupBy($groupingColumns);
        $availableStocks = $query->get();

        $availableStocksMap = $availableStocks->keyBy('product_id')->map(function ($stock) {
            return (int) $stock->quantity;
        });

        $orderDetails = StoreOrderDetail::with('product')->where('store_order_id',$id)->get();

        $stockErrors = [];
        foreach ($orderDetails as $detail) {
            $approvedQuantity = (int) $detail->approved_qty;
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

        $order = StoreOrder::findOrFail($id);

        if (!$userWarehouseId) {
            return back()->withErrors(['error' => 'Maaf and Tidak boleh melakukan proses ini']);
        }

        $order->warehouse_id = $userWarehouseId;
        $order->status = 'processing';
        $order->save();

        // return to_route('outbound-dc.index');
        return to_route('receiving-order.detail', ['header_id' => $id]);
    }
}
