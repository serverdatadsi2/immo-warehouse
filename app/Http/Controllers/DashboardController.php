<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search')??'';
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $selectColumns = [
            'p.id as product_id', 'p.name as product_name', 'p.code as product_code',
            'w.id as warehouse_id', 'w.name as warehouse_name',
            'lr.name as layer_name', 'lr.code as layer_code',
            'rk.name as rack_name', 'rk.code as rack_code',
            'rm.name as room_name', 'rm.code as room_code',
             \DB::raw('MAX(warehouse_items.updated_at) as last_seen'),
        ];

        $groupingColumns = [
            'p.id', 'p.name', 'p.code',
            'w.id', 'w.name',
            'lr.name', 'lr.code',
            'rk.name', 'rk.code',
            'rm.name', 'rm.code',
        ];

        $query = WarehouseStock::query()
            ->join('items as i', function ($join) {
                    $join->on('i.id', '=', 'warehouse_items.item_id')
                        ->where('i.status', '=', 'warehouse_stock');
                })
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->leftJoin('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')

            ->leftJoin('locations as lr', 'lr.id', '=', 'i.current_location_id')
            ->leftJoin('locations as rk', 'rk.id', '=', 'lr.location_parent_id')
            ->leftJoin('locations as rm', 'rm.id', '=', 'rk.location_parent_id')
            ->join('warehouses as w', 'w.id', '=', 'warehouse_items.warehouse_id')
            ->where('w.id',$userWarehouseId)
            ->select($selectColumns);

        $query->groupBy($groupingColumns);

        $pagination = $query->simplePaginate(10);

        $chartData = $this->chartData();
        $summary = $this->summary($userWarehouseId);
        $stockBarier = $this->stockBarier($userWarehouseId);
        $slowMoving = $this->slowMoving($userWarehouseId);
        $deadStock = $this->deadStock($userWarehouseId);

        return inertia('dashboard/index',[
            'pagination' => $pagination,
            'chartData' => $chartData,
            'summary' => $summary,
            'stockBarier' =>$stockBarier,
            'slowMoving' =>$slowMoving,
            'deadStock' =>$deadStock,
        ]);
    }

    private function chartData ()
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $results = DB::table(function ($query) use ($startOfWeek, $endOfWeek, $userWarehouseId) {
                $query->select(
                        DB::raw("DATE(created_at) as date"),
                        DB::raw("'Inbound' as type"),
                        DB::raw("SUM(grand_total) as count")
                    )
                    ->from('warehouse_inbounds')
                    ->where('warehouse_id', $userWarehouseId)
                    ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->groupBy(DB::raw("DATE(created_at)"))
                ->unionAll(
                    DB::table('warehouse_outbounds')
                        ->select(
                            DB::raw("DATE(created_at) as date"),
                            DB::raw("'Outbound' as type"),
                            DB::raw("SUM(quantity_item) as count")
                        )
                        ->where('warehouse_id', $userWarehouseId)
                        ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                        ->groupBy(DB::raw("DATE(created_at)"))
                );
            }, 't')
            ->select(
                'date',
                DB::raw("SUM(CASE WHEN type = 'Inbound' THEN count ELSE 0 END) AS inbound"),
                DB::raw("SUM(CASE WHEN type = 'Outbound' THEN count ELSE 0 END) AS outbound")
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $results;
    }
    private function summary (string $warehouseId)
    {
        $totalItem = DB::table('warehouse_items')
                ->where('warehouse_id', $warehouseId)
                ->count();

        $availableStock = DB::table('warehouse_items as wi')
                ->join('items as i', 'i.id', '=', 'wi.item_id')
                ->where('i.status', 'warehouse_stock')
                ->where('wi.warehouse_id', $warehouseId)
                ->count('wi.item_id');

        $location = DB::table('warehouse_locations as wl')
                ->join('locations as l', 'l.id', '=', 'wl.location_id')
                ->where('wl.warehouse_id', $warehouseId)
                ->count('wl.location_id');

        $rfidActive = Item::join('warehouse_inbound_details as wid', 'wid.id', '=', 'items.warehouse_inbound_detail_id')
                ->join('warehouse_inbounds as wi', 'wi.id', '=', 'wid.warehouse_inbound_id')
                ->where('wi.warehouse_id', $warehouseId)
                ->count('items.rfid_tag_id');


        $results = [
            'item' => $totalItem,
            'available_stock' => $availableStock,
            'location' => $location,
            'active_rfid' => $rfidActive,
        ];

        return $results;
    }
    private function stockBarier(string $warehouseId)
    {
        $selectColumns = [
            'p.id as product_id',
            'p.name as product_name',
            'p.code as product_code',
            'ic.name as condition_status',
            'u.name as unit_name',
            'pc.name as product_category',
            'wsb.stock_barrier',
            'wsb.tolerance_percentage',
            \DB::raw('COUNT(wi.id) AS stock')
        ];

        $groupingColumns = [
            'p.id', 'p.name', 'p.code', 'u.name',
            'pc.name', 'ic.name', 'wsb.stock_barrier', 'wsb.tolerance_percentage',
        ];

        $results = \DB::table('warehouse_items as wi')
            ->join('items as i', function ($join) {
                $join->on('i.id', '=', 'wi.item_id')
                    ->where('i.status', '=', 'warehouse_stock');
            })
            ->join('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->join('units as u', 'u.id', '=', 'p.unit_id')
            ->join('product_categories as pc', 'pc.id', '=', 'p.category_id')
            ->leftJoin('warehouse_stock_barriers as wsb', function ($join) {
                $join->on('wsb.product_id', '=', 'p.id')
                    ->on('wsb.warehouse_id', '=', 'wi.warehouse_id');
            })
            ->where('wi.warehouse_id', $warehouseId)
            ->where('ic.name', 'Good')
            ->select($selectColumns)
            ->groupBy($groupingColumns)
            ->get();


        $filtered = $results->map(function ($item) {
            $item->status_level = 'normal';

            if ($item->stock_barrier) {
                $tolerance = $item->stock_barrier + ($item->stock_barrier * ($item->tolerance_percentage / 100));

                if ($item->stock <= $item->stock_barrier) {
                    $item->status_level = 'CRITICAL';
                } elseif ($item->stock <= $tolerance) {
                    $item->status_level = 'WARNING';
                }
            }

            return $item;
        })->filter(function ($item) {
            return in_array($item->status_level, ['WARNING', 'CRITICAL']);
        })->values();

        return $filtered;
    }

    private function slowMoving (string $userWarehouseId)
    {
        $sixMonthsAgo = now()->subMonths(6);
        $threeMonthsAgo   = now()->subMonths(3);

        $selectColumns = [
            'p.id as product_id', 'p.name as product_name', 'p.code as product_code',
            DB::raw("(CASE WHEN ic.name = 'Good' THEN 'Good' ELSE 'Bad' END) as status"),
            'lr.name as layer_name', 'rk.name as rack_name', 'rm.name as room_name',
        ];

        $groupingColumns = [
            'p.id', 'p.name', 'p.code',
            DB::raw("(CASE WHEN ic.name = 'Good' THEN 'Good' ELSE 'Bad' END)"),
            'lr.name', 'rk.name', 'rm.name',
        ];

        $query = DB::table('warehouse_items as wi')
            ->join('items as i', function ($join) {
                $join->on('i.id', '=', 'wi.item_id')
                    ->whereIn('i.status', ['warehouse_stock', 'warehouse_processing']);
            })
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->leftJoin('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')
            ->leftJoin('locations as lr', 'lr.id', '=', 'i.current_location_id')
            ->leftJoin('locations as rk', 'rk.id', '=', 'lr.location_parent_id')
            ->leftJoin('locations as rm', 'rm.id', '=', 'rk.location_parent_id')
            ->leftJoin('warehouse_inbound_details as ind', 'ind.id', '=', 'i.warehouse_inbound_detail_id')
            ->leftJoin('warehouse_inbounds as inh', 'inh.id', '=', 'ind.warehouse_inbound_id')
            ->where('wi.warehouse_id', $userWarehouseId)

            # FILTER SLOW-MOVING
            ->where(function ($q) use ($threeMonthsAgo, $sixMonthsAgo) {

                // Normal item → berdasarkan tanggal inbound
                $q->whereNull('i.old_item_id')
                ->whereBetween('inh.received_date', [$sixMonthsAgo, $threeMonthsAgo])

                // Recycle item → berdasarkan created_at
                ->orWhere(function ($q) use ($threeMonthsAgo, $sixMonthsAgo) {
                    $q->whereNotNull('i.old_item_id')
                    ->whereBetween('i.created_at', [$sixMonthsAgo, $threeMonthsAgo]);
                });
            })

            ->select(array_merge($selectColumns, [
                DB::raw('COUNT(wi.id) AS quantity')
            ]));

        $query->groupBy($groupingColumns);

        $result = $query->get();
        return $result;
    }

    private function deadStock (string $userWarehouseId)
    {
        $sixMonthsAgo = now()->subMonths(6);

        $selectColumns = [
            'p.id as product_id', 'p.name as product_name', 'p.code as product_code',
            'lr.name as layer_name', 'rk.name as rack_name', 'rm.name as room_name',
            DB::raw("(CASE WHEN ic.name = 'Good' THEN 'Good' ELSE 'Bad' END) as status")
        ];

        $groupingColumns = [
            'p.id', 'p.name', 'p.code',
            DB::raw("(CASE WHEN ic.name = 'Good' THEN 'Good' ELSE 'Bad' END)"),
            'lr.name', 'rk.name', 'rm.name',
        ];

        $query = DB::table('warehouse_items as wi')
            ->join('items as i', function ($join) {
                $join->on('i.id', '=', 'wi.item_id')
                    ->whereIn('i.status', ['warehouse_stock', 'warehouse_processing']);
            })
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->leftJoin('item_conditions as ic', 'ic.id', '=', 'i.current_condition_id')
            ->leftJoin('locations as lr', 'lr.id', '=', 'i.current_location_id')
            ->leftJoin('locations as rk', 'rk.id', '=', 'lr.location_parent_id')
            ->leftJoin('locations as rm', 'rm.id', '=', 'rk.location_parent_id')
            ->leftJoin('warehouse_inbound_details as ind', 'ind.id', '=', 'i.warehouse_inbound_detail_id')
            ->leftJoin('warehouse_inbounds as inh', 'inh.id', '=', 'ind.warehouse_inbound_id')
            ->where('wi.warehouse_id', $userWarehouseId)

            # FILTER DEAD STOCK
            ->where(function ($q) use ($sixMonthsAgo) {

                // Normal item → berdasarkan tanggal inbound
                $q->whereNull('i.old_item_id')
                ->whereDate('inh.received_date', '<=', $sixMonthsAgo)

                // Recycle item → berdasarkan created_at
                ->orWhere(function ($q) use ($sixMonthsAgo) {
                    $q->whereNotNull('i.old_item_id')
                    ->whereDate('i.created_at', '<=', $sixMonthsAgo);
                });
            })

            ->select(array_merge($selectColumns, [
                DB::raw('COUNT(wi.id) AS quantity')
            ]));

        $query->groupBy($groupingColumns);

        $result = $query->get();
        return $result;
    }
}
