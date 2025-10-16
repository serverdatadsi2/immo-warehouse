<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\WarehouseStock;
use App\Models\WarehouseStockOpname;
use App\Models\WarehouseStockOpnameDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                ->groupBy('i.product_id', 'p.name')
                ->select([
                    'i.product_id',
                    'p.name as product_name',

                    // ✅ QTY berdasarkan status
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

        $details = WarehouseStockOpnameDetail::query()
                    ->from('warehouse_stock_opname_details as wsod')
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

        return response()->json( $details);
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
                ],
                [
                    'code' => $code,
                    'location_id' => $locationId,
                    'created_at' => now(),
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
