<?php

namespace App\Http\Controllers;

use App\Models\LocationSuggestion;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LocationSuggestionController extends Controller
{
    public function index(Request $request)
    {
        $pagination = LocationSuggestion::query()
            ->leftJoin('products as p', 'p.id', '=', 'warehouse_item_location_suggestions.product_id')
            ->leftJoin('locations as l', 'l.id', '=', 'warehouse_item_location_suggestions.location_id')
            ->leftJoin('locations as lr', 'lr.id', '=', 'l.location_parent_id')
            ->leftJoin('locations as lrr', 'lrr.id', '=', 'lr.location_parent_id')
            ->select(
                'warehouse_item_location_suggestions.*',
                'p.name as product_name',
                'p.code as product_code',
                'l.name as layer_name',
                'l.code as layer_code',
                'lr.id as rack_id',
                'lr.name as rack_name',
                'lr.code as rack_code',
                'lrr.id as room_id',
                'lrr.name as room_name',
                'lrr.code as room_code'
            )
            ->groupBy(
                'warehouse_item_location_suggestions.id',
                'p.name', 'p.code',
                'l.name', 'l.code',
                'lr.id', 'lr.name', 'lr.code',
                'lrr.id', 'lrr.name', 'lrr.code'
            )
            ->simplePaginate(10);

        return Inertia::render('location-suggestions/index', ['pagination' => $pagination]);
    }

    public function save(Request $request)
    {
        $rules = [
            'product_id' => ['string', 'required', 'exists:products,id'],
            'location_id' => ['string', 'required', 'exists:locations,id'],
        ];

        $validated = $request->validate($rules);

        DB::transaction(function () use ($validated, $request) {
            if ($request->id) {
                LocationSuggestion::updateOrCreate(
                    ['id' => $request->id],
                    $validated
                );
            } else {
                LocationSuggestion::create($validated);
            }
        });

        return to_route('location-suggestions.index');
    }

    public function delete(string $id)
    {
        DB::transaction(function () use ($id) {
            $suggestion = LocationSuggestion::findOrFail($id);
            $suggestion->delete();
        });

        return to_route('location-suggestions.index');
    }

    public function getLocationByUser(Request $request)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $type = $request->input('type');
        $parentId = $request->input('parent_id');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;

        $data = Location::query()
            ->join('warehouse_locations as wl', 'wl.location_id', '=', 'locations.id')
            ->when($type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($parentId, function ($query, $parentId) {
                return $query->where('location_parent_id', $parentId);
            })
            ->where('wl.warehouse_id', $userWarehouseId)

            ->offset($offset)
            ->limit(30)
            ->get();

        return response()->json($data);
    }
}
