<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WarehouseStorageController extends Controller
{
    public function index(Request $request)
    {

        $filters = $request->only(['search', 'location', 'status']);
        $search = $filters['search'] ?? '';
        $status = $filters['status'] ?? '';
        $location = $filters['location'] ?? '';
        $pageSize = 20;

        $user = auth()->user();

        // Pastikan user memiliki warehouse yang terdaftar
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $selectColumns = [
            'p.id as product_id', 'p.name as product_name', 'p.code as product_code',
            'w.id as warehouse_id', 'w.name as warehouse_name',
            \DB::raw("(CASE
                WHEN ic.name IS NULL THEN NULL
                WHEN ic.name = 'Good' THEN 'Good'
                ELSE 'Bad'
            END) AS status"),
            'lr.name as layer_name', 'lr.code as layer_code',
            'rk.name as rack_name', 'rk.code as rack_code',
            'rm.name as room_name', 'rm.code as room_code',
            'i.expired_date'
        ];

        $groupingColumns = [
            'p.id', 'p.name', 'p.code',
            'w.id', 'w.name',
            \DB::raw("(CASE
                WHEN ic.name IS NULL THEN NULL
                WHEN ic.name = 'Good' THEN 'Good'
                ELSE 'Bad'
            END)"),
            'i.expired_date',
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
            // ->join('warehouse_locations as wl', 'wl.warehouse_id', '=', 'w.id')
            // ->join('locations as lr', function($q){
                //         $q->on('lr.id', '=', 'i.current_location_id')
                //         ->where('wl.location_id', '=', "lr.id");
                // })
            ->leftJoin('locations as lr', 'lr.id', '=', 'i.current_location_id')
            ->leftJoin('locations as rk', 'rk.id', '=', 'lr.location_parent_id')
            ->leftJoin('locations as rm', 'rm.id', '=', 'rk.location_parent_id')
            ->join('warehouses as w', 'w.id', '=', 'warehouse_items.warehouse_id')
            ->whereIn('w.id',$userWarehouseIds)

            // 1. Tambahkan kolom COUNT dan semua kolom lainnya
            ->select(array_merge($selectColumns, [
                \DB::raw('COUNT(warehouse_items.id) AS quantity')
            ]));

        // --- FILTERING ---
        if ($search) { $query->where('p.name', 'ILIKE', '%' . $search . '%'); }
        if ($location) { $query->where('lr.id', '=', $location); }
        if ($status && $status !== 'All') {
             $oprator = $status === 'Good' ? '=' : '!=';
             $query->where('ic.name', $oprator,'Good');
        }

        $query->groupBy($groupingColumns);

        $paginatedResults = $query->simplePaginate($pageSize);

        return Inertia::render('storage/index',[
            'params'=>$filters,
            'pagination'=>$paginatedResults
        ]);
    }

    public function listProductUnsignLocation(Request $request)
    {
        $user = auth()->user();
        // Pastikan user memiliki warehouse yang terdaftar
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $result = Item::query()
                ->join('warehouse_qc as wq', 'wq.item_id', '=','items.id')
                ->join('warehouse_inbound_details as wid', 'wid.id', '=','items.warehouse_inbound_detail_id')
                ->join('warehouse_inbounds as wi', 'wi.id', '=', 'wid.warehouse_inbound_id')
                ->join('products as p', 'p.id', '=', 'items.product_id')
                ->whereNull('items.status')
                ->whereIn('wq.warehouse_id',$userWarehouseIds)
                ->groupBy('p.id', 'p.code', 'p.name', 'wi.received_date')
                ->select(
                    'p.id as product_id',
                    'wi.received_date as inbound_date',
                    'p.name as product_name',
                    'p.code as product_code',
                    \DB::raw('COUNT(items.id) AS quantity')
                )
                ->get();

        return Inertia::render('storage/assignment',['data' => $result]);
    }

    public function store(Request $request)
    {
        $rules = [
            'rfid' => ['string', 'required', 'exists:rfid_tags,value'],
            'location' => ['string', 'required',
                    Rule::exists('locations', 'id')->where(function ($query) {
                        return $query->where('type', 'layer');
                    }),],
        ];

        $user = auth()->user();

        // Pastikan user memiliki warehouse yang terdaftar
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');
        if ($userWarehouseIds->isEmpty()) {
            throw ValidationException::withMessages([
                'warehouse' => 'User tidak terasosiasi dengan Warehouse mana pun.'
            ]);
        }
        $warehouseId = $userWarehouseIds[0];

        $validated = $request->validate($rules);

        try {
            \DB::beginTransaction();

            $item = Item::whereHas('rfidTag', function ($query) use ($validated) {
                $query->where('value', $validated['rfid']);
            })->first();

            // Cek jika Item tidak ditemukan
            if (!$item) {
                \DB::rollback();
                // Throw exception agar frontend menerima error yang jelas
                throw ValidationException::withMessages([
                    'rfid' => 'RFID ini tidak terdaftar atau sudah tidak aktif.'
                ]);
            }

            $item->update([
                'status' => 'warehouse_stock',
                'current_location_id' => $validated['location']
            ]);

            WarehouseStock::firstOrCreate(
                ['warehouse_id' => $warehouseId, 'item_id' => $item->id]
            );

            \DB::commit();

            return to_route('storage-warehouse.listProductUnsignLocation');

        } catch (\Exception $e) {
            if (\DB::transactionLevel() > 0) {
                \DB::rollback();
            }
            // Throw ulang exception
            throw $e;
        }
    }
}
