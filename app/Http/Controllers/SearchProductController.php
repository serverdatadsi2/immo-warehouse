<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchProductController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('search-product/index');
    }

    public function searchLocationProduct(Request $request, $rfid)
    {
        $productId = Item::where('rfid_tag_id', $rfid)->value('product_id');

        $stocks = WarehouseStock::query()
            ->join('warehouses as w', 'w.id', '=', 'warehouse_items.warehouse_id')
            ->join('items as i', 'i.id', '=', 'warehouse_items.item_id')
            ->leftJoin('locations as la', 'la.id', '=', 'i.current_location_id')
            ->leftJoin('locations as ra', 'ra.id', '=', 'la.location_parent_id')
            ->leftJoin('locations as ru', 'ru.id', '=', 'ra.location_parent_id')
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->join('units as u', 'u.id', '=', 'p.unit_id')
            // ->where('i.rfid_tag_id', $rfid)
            ->where('p.id', $productId)
            ->selectRaw(
                '
            p.id as product_id,
            p.name as product_name,
            p.code as product_code,
            u.name as product_unit,
            ru.name as room_name,
            ru.code as room_code,
            ra.name as rack_name,
            ra.code as rack_code,
            la.name as layer_name,
            la.code as layer_code,
            w.name as warehouse_name,
            w.code as warehouse_code,
            COUNT(warehouse_items.id) as stock_qty
        ',
            )
            ->groupBy('p.id', 'p.name', 'p.code', 'u.name', 'ru.name', 'ru.code', 'ra.name', 'ra.code', 'la.name', 'la.code', 'w.name', 'w.code')
            ->get();


        $result = $stocks
            ->groupBy('product_id')
            ->map(function ($group) {
                $first = $group->first();

                return [
                    'product_name' => $first->product_name,
                    'product_code' => $first->product_code,
                    'product_unit' => $first->product_unit,
                    'grand_total' => $group->sum('stock_qty'),
                    'locations' => $group
                        ->map(function ($item) {
                            return [
                                'warehouse_name' => $item->warehouse_name,
                                'warehouse_code' => $item->warehouse_code,
                                'room_name' => $item->room_name,
                                'room_code' => $item->room_code,
                                'rack_name' => $item->rack_name,
                                'rack_code' => $item->rack_code,
                                'layer_name' => $item->layer_name,
                                'layer_code' => $item->layer_code,
                                'quantity' => $item->stock_qty,
                            ];
                        })
                        ->values(),
                ];
            })
            ->first();

        return response()->json($result);
    }
}
