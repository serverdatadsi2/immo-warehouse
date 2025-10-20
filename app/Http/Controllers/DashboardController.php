<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\WarehouseInbound;
use App\Models\WarehouseOutbound;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
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

        return inertia('dashboard/index',[
            'pagination' => $pagination,
            'chartData' => $chartData,
            'summary' => $summary
        ]);
    }

    private function chartData ()
    {
        // $startOfWeek = Carbon::now()->startOfWeek();
        // $endOfWeek = Carbon::now()->endOfWeek();

        $inbound = WarehouseInbound::select(
                DB::raw("DATE(created_at) as date"),
                DB::raw("'Inbound' as type"),
                DB::raw("SUM(grand_total) as count")
            )
            // ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->groupBy(DB::raw("DATE(created_at)"));

        $outbound = WarehouseOutbound::select(
                DB::raw("DATE(created_at) as date"),
                DB::raw("'Outbound' as type"),
                DB::raw("SUM(quantity_item) as count")
            )
            // ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->groupBy(DB::raw("DATE(created_at)"));

        $query = $inbound->unionAll($outbound);

        $results = DB::query()
            ->fromSub($query, 't')
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
}
