<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemCondition;
use App\Models\ItemConditionHistory;
use App\Models\Location;
use App\Models\WarehouseStock;
use App\Models\WarehouseStockOpname;
use App\Models\WarehouseStockOpnameDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Log;

class StockOpnameController extends Controller
{

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'dateRange']);
        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? null;
        $dates = $filters['dateRange'] ?? null;

        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $pagination = WarehouseStockOpname::query()
            ->with(['location:id,name', 'user:id,name'])
            ->where('warehouse_id', $userWarehouseId)
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($search, fn($q) => $q->where('code', 'ILIKE', '%' . $search . '%'))
            ->when($dates, fn($q) => $q->whereBetween('created_at', $dates))
            ->orderBy('created_at','desc')
            ->simplePaginate(10);

        return Inertia::render('stock-opname/index', ['pagination' => $pagination, 'params' => $filters]);
    }

    public function monitoring(Request $request)
    {
        $headerId = $request->input('headerId');
        $header = null;
        $detailsPagination = null;

        if ($headerId) {
            $header = WarehouseStockOpname::query()
                ->with(['location:id,name', 'user:id,name'])
                ->find($headerId);

            $base = WarehouseStockOpnameDetail::query()
                ->from('warehouse_stock_opname_details as wsod')
                ->join('rfid_tags as rt', 'rt.id', '=', 'wsod.rfid_tag_id')
                ->join('items as i', 'i.rfid_tag_id', '=', 'rt.id')
                ->join('products as p', 'p.id', '=', 'i.product_id')
                ->where('wsod.warehouse_stock_opname_id', $header->id)
                ->groupBy('i.product_id', 'p.name', 'p.code')
                ->select([
                    'i.product_id',
                    'p.name as product_name',
                    'p.code as product_code',

                    // ✅ QTY berdasarkan status
                    DB::raw("COUNT(CASE WHEN wsod.status = 'pending' THEN 1 END) as pending_qty"),
                    DB::raw("COUNT(CASE WHEN wsod.status IN ('match','missing') THEN 1 END) as system_qty"),
                    DB::raw("COUNT(CASE WHEN wsod.status = 'match' THEN 1 END) as match_qty"),
                    DB::raw("COUNT(CASE WHEN wsod.status = 'missing' THEN 1 END) as missing_qty"),
                    DB::raw("COUNT(CASE WHEN wsod.status = 'extra' THEN 1 END) as extra_qty"),

                    // ✅ Varian = (match + extra) - system
                    DB::raw("(COUNT(CASE WHEN wsod.status = 'match' THEN 1 END)
                            + COUNT(CASE WHEN wsod.status = 'extra' THEN 1 END)
                            - COUNT(CASE WHEN wsod.status IN ('match','missing') THEN 1 END)) as varian"),

                    // ✅ Status summary
                    DB::raw("
                        CASE
                            WHEN (COUNT(CASE WHEN wsod.status = 'match' THEN 1 END)
                                + COUNT(CASE WHEN wsod.status = 'extra' THEN 1 END)
                                - COUNT(CASE WHEN wsod.status IN ('match','missing') THEN 1 END)) = 0 THEN 'Balanced'
                            WHEN (COUNT(CASE WHEN wsod.status = 'match' THEN 1 END)
                                + COUNT(CASE WHEN wsod.status = 'extra' THEN 1 END)
                                - COUNT(CASE WHEN wsod.status IN ('match','missing') THEN 1 END)) > 0 THEN 'Over'
                            ELSE 'Shortage'
                        END as status
                    ")
                ]);

            // ✅ Bungkus agar bisa dipaginate
            $detailsPagination = DB::table(DB::raw("({$base->toSql()}) as summary"))
                ->mergeBindings($base->getQuery())
                ->select('summary.*')
                ->orderBy('product_name')
                ->simplePaginate(10);

        }

        return Inertia::render('stock-opname/monitoring', [
            'detailsPagination' => $detailsPagination,
            'header' => $header,
        ]);
    }

    public function detail(Request $request)
    {
        $headerId = $request->input('headerId');
        $productId = $request->input('productId');

        $details = DB::table('warehouse_stock_opname_details as wsod')
                    ->join('rfid_tags as rt', 'rt.id', '=', 'wsod.rfid_tag_id')
                    ->join('items as i', 'i.rfid_tag_id', '=', 'rt.id')
                    ->select([
                        'rt.value as rfid',
                        'wsod.status',
                        'i.product_id',
                    ])
                    ->where('wsod.warehouse_stock_opname_id', $headerId)
                    ->where('i.product_id', $productId)
                    ->whereIn('wsod.status', ['missing', 'extra'])
                    ->orderBy('wsod.status')
                    ->get();

            // Pisahkan data berdasarkan status
        $missing = $details->where('status', 'missing')->pluck('rfid')->values()->toArray();
        $extra   = $details->where('status', 'extra')->pluck('rfid')->values()->toArray();

        // Hitung jumlah baris maksimum (biar bisa dipasangkan satu-satu)
        $maxRows = max(count($missing), count($extra));

        // Gabungkan ke format yang diinginkan frontend
        $result = [];
        for ($i = 0; $i < $maxRows; $i++) {
            $result[] = [
                'no' => $i + 1,
                'rfid_missing' => $missing[$i] ?? null,
                'rfid_extra' => $extra[$i] ?? null,
            ];
        }

        return response()->json( $result);
    }

    public function manualStockOpname(Request $request)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();
        $code = $this->generateCode();
        $locationId = Location::query()
            ->join('warehouse_locations as wl', 'wl.location_id', '=', 'locations.id')
            ->where('wl.warehouse_id', $userWarehouseId)
            ->where('locations.type', 'warehouse')
            ->value('locations.id');

        \DB::transaction(function () use ($user, $userWarehouseId, $code, $locationId) {
            // 1️⃣ Buat atau ambil header opname
            $header = WarehouseStockOpname::firstOrCreate(
                [
                    'warehouse_id' => $userWarehouseId,
                    'user_id' => $user->id,
                    'status' => 'draft',
                    'created_at' => now(),
                    'code' => $code,
                ],
                [
                    'location_id' => $locationId,
                ]
            );

            // 2️⃣ Ambil stok yang akan diopname
            $stock = WarehouseStock::query()
                ->join('items as i', 'i.id', '=', 'warehouse_items.item_id')
                ->where('i.status', 'warehouse_stock')
                ->where('warehouse_items.warehouse_id', $userWarehouseId)
                ->select('i.rfid_tag_id')
                ->get();

            // 3️⃣ Mapping data untuk insert detail opname
            $detailData = $stock->map(function ($item) use ($header) {
                return [
                    'warehouse_stock_opname_id' => $header->id,
                    'rfid_tag_id' => $item->rfid_tag_id,
                    'status' => 'pending',
                    'scanned_at' => now()
                ];
            })->toArray();

            // 4️⃣ Insert ke WarehouseStockOpnameDetail
            WarehouseStockOpnameDetail::insert($detailData);
        });

        return to_route('stock-opname.index');
    }

    public function updateStockOpnameStatus(Request $request, $opnameId)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        \DB::transaction(function () use ($opnameId, $userWarehouseId) {
            // 1️⃣ Ambil semua RFID yang ada di detail opname
            $detailRfids = WarehouseStockOpnameDetail::where('warehouse_stock_opname_id', $opnameId)
                ->pluck('rfid_tag_id')
                ->toArray();

            // 2️⃣ Ambil semua RFID yang ada di stok gudang
            $stockRfids = \DB::table('warehouse_items')
                ->join('items as i', 'i.id', '=', 'warehouse_items.item_id')
                ->where('i.status', 'warehouse_stock')
                ->where('warehouse_items.warehouse_id', $userWarehouseId)
                ->pluck('i.rfid_tag_id')
                ->toArray();

            // 3️⃣ Update status = match jika ada di stock
            WarehouseStockOpnameDetail::where('warehouse_stock_opname_id', $opnameId)
                ->whereIn('rfid_tag_id', $stockRfids)
                ->update([
                    'status' => 'match',
                    'updated_at' => now(),
                ]);

            // 4️⃣ Update status = extra jika tidak ada di stock
            WarehouseStockOpnameDetail::where('warehouse_stock_opname_id', $opnameId)
                ->whereNotIn('rfid_tag_id', $stockRfids)
                ->update([
                    'status' => 'extra',
                    'updated_at' => now(),
                ]);

            // 5️⃣ Tambahkan detail baru jika RFID ada di stock tapi belum ada di detail → missing
            $missingRfids = array_diff($stockRfids, $detailRfids);

            if (!empty($missingRfids)) {
                $newDetails = array_map(function ($rfid) use ($opnameId) {
                    return [
                        'warehouse_stock_opname_id' => $opnameId,
                        'rfid_tag_id' => $rfid,
                        'status' => 'missing',
                        'scanned_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $missingRfids);

                WarehouseStockOpnameDetail::insert($newDetails);
            }

            WarehouseStockOpname::where('id', $opnameId)
            ->update([
                'status' => 'in_progress',
                'updated_at' => now(),
            ]);
        });

        return to_route('stock-opname.monitoring', ['headerId' => $opnameId]);
    }

    public function updateItemCondition(Request $request)
    {
        $rules = [
            'stock_opname_id' => ['string', 'required', 'exists:warehouse_stock_opnames,id'],
            'rfid' => ['string', 'required', 'exists:rfid_tags,value'],
            'condition' => ['string', 'required', 'max:255'],
        ];

        $user = auth()->user();

        $validated = $request->validate($rules);

        try {
            \DB::beginTransaction();

            // A. Cek/Buat ItemCondition
            $itemCondition = ItemCondition::firstOrCreate(
                ['name' => $validated['condition']]
            );

            // B. Temukan Item berdasarkan RFID dan pastikan bisa di-update
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

            // C. Update Item (Mengganti kondisi dan status)
            $item->update([
                'current_condition_id' => $itemCondition->id,
            ]);

            // E. Create History Condition
            ItemConditionHistory::firstOrCreate([
                'item_id' => $item->id,
                'item_condition_id' => $itemCondition->id,
                'changed_by' => $user->id,
                'reference_type' => 'warehouse_stock_opname',
                'reference_id' => $validated['stock_opname_id'],
                'changed_at' => now(),
            ]);

            \DB::commit();

            return to_route('stock-opname.monitoring', ['headerId' => $validated['stock_opname_id']]);

        } catch (\Exception $e) {
            // Jika terjadi error (termasuk ValidationException dari atas), lakukan rollback
            if (\DB::transactionLevel() > 0) {
                \DB::rollback();
            }
            // Throw ulang exception
            throw $e;
        }
    }

    public function updateStock(Request $request)
    {
        $validated = $request->validate([
            'warehouse_stock_opname_id' => ['required', 'string', 'exists:warehouse_stock_opnames,id']
        ]);
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        \DB::transaction(function () use ($validated, $userWarehouseId, $user) {
            // Ambil semua item dari detail opname
            $allItems = DB::table('warehouse_stock_opname_details as wsod')
                ->join('rfid_tags as rt', 'rt.id', '=', 'wsod.rfid_tag_id')
                ->join('items as i', 'i.rfid_tag_id', '=', 'rt.id')
                ->where('wsod.warehouse_stock_opname_id', $validated['warehouse_stock_opname_id'])
                ->pluck('i.id')
                ->toArray();

            if (!empty($allItems)) {
                $itemConditionId = ItemCondition::where('name', 'Good')->value('id');

                // Ambil item_id yang sudah punya history dengan reference_id di stock opname ini
                $existingHistoryItems = ItemConditionHistory::where('reference_type', 'warehouse_stock_opname')
                    ->where('reference_id', $validated['warehouse_stock_opname_id'])
                    ->pluck('item_id')
                    ->toArray();

                // Filter item yang belum punya history di stcok opname ini
                $newItems = array_diff($allItems, $existingHistoryItems);

                if (!empty($newItems)) {

                    $itemConditions = Item::whereIn('id', $newItems)
                        ->pluck('current_condition_id', 'id') // key = item_id, value = condition_id
                        ->toArray();

                    $itemConditionHistories = collect($itemConditions)->map(function ($conditionId, $itemId) use ($user, $validated) {
                        return [
                            'item_id' => $itemId,
                            'item_condition_id' => $conditionId, // pakai kondisi terakhir dari Item
                            'changed_by' => $user->id,
                            'reference_type' => 'warehouse_stock_opname',
                            'reference_id' => $validated['warehouse_stock_opname_id'],
                            'changed_at' => now(),
                        ];
                    })->values()->toArray();

                    if (!empty($itemConditionHistories)) {
                        ItemConditionHistory::insert($itemConditionHistories);
                    }
                }
            }


            // Ambil item extra (barang baru yang tidak ada di stok sistem)
            $extraItems = WarehouseStockOpnameDetail::query()
                ->from('warehouse_stock_opname_details as wsod')
                ->join('rfid_tags as rt', 'rt.id', '=', 'wsod.rfid_tag_id')
                ->join('items as i', 'i.rfid_tag_id', '=', 'rt.id')
                ->where('wsod.warehouse_stock_opname_id', $validated['warehouse_stock_opname_id'])
                ->where('wsod.status', 'extra')
                ->pluck('i.id')
                ->toArray();

            // Ambil item missing (barang yang ada di sistem tapi tidak ada secara fisik)
            $missingItems = WarehouseStockOpnameDetail::query()
                ->from('warehouse_stock_opname_details as wsod')
                ->join('rfid_tags as rt', 'rt.id', '=', 'wsod.rfid_tag_id')
                ->join('items as i', 'i.rfid_tag_id', '=', 'rt.id')
                ->where('wsod.warehouse_stock_opname_id', $validated['warehouse_stock_opname_id'])
                ->where('wsod.status', 'missing')
                ->pluck('i.id')
                ->toArray();

            // Proses EXTRA items
            if (!empty($extraItems)) {
                foreach ($extraItems as $itemId) {
                    WarehouseStock::firstOrCreate([
                        'warehouse_id' => $userWarehouseId,
                        'item_id' => $itemId,
                    ]);
                }

                Item::whereIn('id', $extraItems)
                    ->update(['status' => 'warehouse_stock']);
            }

            // Proses MISSING items
            if (!empty($missingItems)) {
                Item::whereIn('id', $missingItems)
                    ->where('status', 'warehouse_stock')
                    ->update(['status' => 'missing']);

                WarehouseStock::whereIn('item_id', $missingItems)
                    ->delete();
            }

            WarehouseStockOpname::where('id', $validated['warehouse_stock_opname_id'])
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return to_route('stock-opname.monitoring', ['headerId' => $validated['warehouse_stock_opname_id']]);
    }

    private function generateCode()
    {
        $date = now(); // pakai Carbon
        $dateCode = $date->format('ymd'); // contoh: 251014

        // Ambil surat jalan terakhir yang dibuat pada hari ini
        $lastRecord = WarehouseStockOpname::whereDate('created_at', $date->toDateString())
            // ->where('code', 'ILIKE', "SOPN-{$dateCode}-%")
            ->orderBy('created_at', 'desc')
            ->first();

        // Tentukan nomor urut berikutnya
        $nextNumber = 1;
        if ($lastRecord) {
            $parts = explode('-', $lastRecord->code);
            $lastNumber = isset($parts[2]) ? (int) $parts[2] : 0;
            $nextNumber = $lastNumber + 1;
        }

        $runningNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        $kodeSuratJalan = "SOPN-{$dateCode}-{$runningNumber}";

        return $kodeSuratJalan;
    }
}
