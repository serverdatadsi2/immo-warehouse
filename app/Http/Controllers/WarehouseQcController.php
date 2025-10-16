<?php

namespace App\Http\Controllers;

use App\Http\Resources\InboundQCResource;
use App\Models\Item;
use App\Models\ItemCondition;
use App\Models\ItemConditionHistory;
use App\Models\WarehouseQC;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WarehouseQcController extends Controller
{
    public function indexInboundQC(Request $request)
    {
        return Inertia::render('inbound-qc/index');
    }

    public function updateRejectLabelInbounQc(Request $request)
    {
        $rules = [
            'rfid' => ['string', 'required', 'exists:rfid_tags,value'],
            'condition' => ['string', 'required', 'max:255'],
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
                'status' => 'warehouse_processing'
            ]);



            // D. Create WarehouseQC Record (Log Reject)
            $qc = WarehouseQC::firstOrCreate([
                'item_id' => $item->id,
                'qc_type' => 'inbound',
                'warehouse_id' => $warehouseId,
                'status' => 'accepted',
            ],
    [
                'item_condition_id' => $itemCondition->id,
                'performed_at' => now(),
                'performed_by' => $user->id,
            ]);

            // E. Create History Condition
            ItemConditionHistory::firstOrCreate([
                'item_id' => $item->id,
                'item_condition_id' => $itemCondition->id,
                'changed_by' => $user->id,
                'reference_type' => 'inbound_qc',
                'reference_id' => $qc->id,
            ],
            ['changed_at' => now(),]);

            \DB::commit();

            return to_route('inbound-qc.index');

        } catch (\Exception $e) {
            // Jika terjadi error (termasuk ValidationException dari atas), lakukan rollback
            if (\DB::transactionLevel() > 0) {
                \DB::rollback();
            }
            // Throw ulang exception
            throw $e;
        }
    }

    public function inboundQC(Request $request)
    {
        $user = auth()->user();
        // ambil warehouse pertama milik user
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $search = $request->input('search');
        $status = $request->input('status');
        $from = $request->input('from');
        $to = $request->input('to');
        $pageSize = 10;

        $dataQuery = WarehouseQC::query()
            ->join('items as i', 'i.id', '=', 'warehouse_qc.item_id')
            ->join('rfid_tags as rt', 'rt.id', '=', 'i.rfid_tag_id')
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->join('item_conditions as ic', 'ic.id', '=', 'warehouse_qc.item_condition_id')
            ->join('users as u', 'u.id', '=', 'warehouse_qc.performed_by')
            ->join('warehouses as w', 'w.id', '=', 'warehouse_qc.warehouse_id')
            ->whereIn('warehouse_qc.warehouse_id', $userWarehouseIds)
            ->where('i.status', 'warehouse_processing')
            ->where('warehouse_qc.qc_type', 'inbound')
            // ✅ pastikan RFID belum pernah QC outbound
            ->whereNotIn('i.rfid_tag_id', function ($sub) {
                $sub->select('i2.rfid_tag_id')
                    ->from('warehouse_qc as qc2')
                    ->join('items as i2', 'i2.id', '=', 'qc2.item_id')
                    ->where('qc2.qc_type', 'outbound');
            })
            ->select(
                'warehouse_qc.*',
                'p.id as product_id', 'p.name as product_name',
                'w.id as warehouse_id', 'w.name as warehouse_name',
                'ic.name as condition_name', 'u.name as performed_by',
                'rt.value as rfid'
            );

        if ($search) { $dataQuery->where('p.name', 'ILIKE', '%' . $search . '%'); }
        if ($status && $status !== 'All') {
             $oprator = $status === 'Good' ? '=' : '!=';
             $dataQuery->where('ic.name', $oprator,'Good');
        }
        if ($from) { $dataQuery->where('warehouse_qc.performed_at', '>=', Carbon::parse($from)->startOfDay()); }
        if ($to) { $dataQuery->where('warehouse_qc.performed_at', '<=', Carbon::parse($to)->endOfDay()); }

        $paginatedResults = $dataQuery->orderBy('warehouse_qc.performed_at', 'desc')
                ->simplePaginate($pageSize);



        $summaryQuery = WarehouseQC::query()
            ->join('items as i', 'i.id', '=', 'warehouse_qc.item_id')
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->join('item_conditions as ic', 'ic.id', '=', 'warehouse_qc.item_condition_id')
            ->whereIn('warehouse_qc.warehouse_id', $userWarehouseIds)
            ->where('warehouse_qc.qc_type', 'inbound')
            ->where('i.status', 'warehouse_processing')
            // ✅ pastikan RFID belum pernah QC outbound
            ->whereNotIn('i.rfid_tag_id', function ($sub) {
                $sub->select('i2.rfid_tag_id')
                    ->from('warehouse_qc as qc2')
                    ->join('items as i2', 'i2.id', '=', 'qc2.item_id')
                    ->where('qc2.qc_type', 'outbound');
            });

        // Terapkan filter yang
        if ($search) { $summaryQuery->where('p.name', 'ILIKE', '%' . $search . '%'); }
        if ($status && $status !== 'All') {
            $oprator = $status === 'Good' ? '=' : '!=';
            $summaryQuery->where('ic.name', $oprator, 'Good');
        }
        if ($from) { $summaryQuery->where('warehouse_qc.performed_at', '>=', Carbon::parse($from)->startOfDay()); }
        if ($to) { $summaryQuery->where('warehouse_qc.performed_at', '<=', Carbon::parse($to)->endOfDay()); }

        // Hitung ringkasan
        $total = $summaryQuery->count();
        $goodCount = (clone $summaryQuery)->where('ic.name', 'Good')->count();
        $badCount = $total - $goodCount;

        // Hitung Highest Bad Product
        $highestBadProduct = \DB::table('warehouse_qc')
            ->join('item_conditions as ic', 'ic.id', '=', 'warehouse_qc.item_condition_id')
            ->join('items as i', 'i.id', '=', 'warehouse_qc.item_id')
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->whereIn('warehouse_qc.warehouse_id', $userWarehouseIds)
            ->where('i.status', 'warehouse_processing')
            ->where('warehouse_qc.qc_type', 'inbound')
            // Terapkan filter yang sama
            ->when($search, fn($q) => $q->where('p.name', 'ILIKE', '%' . $search . '%'))
            ->when($from, fn($q) => $q->where('warehouse_qc.performed_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($to, fn($q) => $q->where('warehouse_qc.performed_at', '<=', Carbon::parse($to)->endOfDay()))
            ->where('ic.name', '!=', 'Good')
            ->select('p.name', 'p.id', \DB::raw('COUNT(*) as bad_count'))
            ->groupBy('p.name', 'p.id')
            ->orderByDesc('bad_count')
            ->first();


        // Ambil metadata paginasi
        $paginationMeta = [
            'current_page' => $paginatedResults->currentPage(),
            'from' => $paginatedResults->firstItem(),
            'to' => $paginatedResults->lastItem(),
            'per_page' => $paginatedResults->perPage(),
            'next_page_url' => $paginatedResults->nextPageUrl(),
            'prev_page_url' => $paginatedResults->previousPageUrl(),
            'path' => $paginatedResults->path(),
        ];

        // Format Summary (sesuai snake_case interface)
        $summaryData = [
            'grand_total' => $total,
            'good_qty' => $goodCount,
            'bad_dty' => $badCount,
            'highestBadProduct' => $highestBadProduct ? [
                'product_name' => $highestBadProduct->name,
                'product_id' => (string) $highestBadProduct->id,
                'percentage' => $total > 0 ? round(($highestBadProduct->bad_count / $total) * 100, 2) : 0,
            ] : [
                'product_name' => '-',
                'product_id' => '-',
                'percentage' => 0,
            ],
        ];

        return response()->json([
            'pagination' => $paginationMeta,
            'data' => InboundQCResource::collection($paginatedResults->items()),
            'summary' => $summaryData,
        ]);
    }

    public function indexOutboundQC(Request $request)
    {
        return Inertia::render('outbound-qc/index');
    }
    public function outboundQC(Request $request)
    {
        $user = auth()->user();
        // ambil warehouse pertama milik user
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $search = $request->input('search');
        $status = $request->input('status');
        $from = $request->input('from');
        $to = $request->input('to');
        $pageSize = 10;

        $dataQuery = WarehouseQC::query()
            ->join('items as i', 'i.id', '=', 'warehouse_qc.item_id')
            ->join('rfid_tags as rt', 'rt.id', '=', 'i.rfid_tag_id')
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->join('item_conditions as ic', 'ic.id', '=', 'warehouse_qc.item_condition_id')
            ->join('users as u', 'u.id', '=', 'warehouse_qc.performed_by')
            ->join('warehouses as w', 'w.id', '=', 'warehouse_qc.warehouse_id')
            ->whereIn('warehouse_qc.warehouse_id', $userWarehouseIds)
            ->where('i.status', 'warehouse_processing')
            ->where('warehouse_qc.qc_type', 'outbound')
            ->select(
                'warehouse_qc.*',
                'p.id as product_id', 'p.name as product_name',
                'w.id as warehouse_id', 'w.name as warehouse_name',
                'ic.name as condition_name', 'u.name as performed_by',
                'rt.value as rfid'
            );

        if ($search)  $dataQuery->where('p.name', 'ILIKE', '%' . $search . '%');
        if ($status) $dataQuery->where('warehouse_qc.status', '=', $status);
        if ($from)  $dataQuery->where('warehouse_qc.performed_at', '>=', Carbon::parse($from)->startOfDay());
        if ($to)  $dataQuery->where('warehouse_qc.performed_at', '<=', Carbon::parse($to)->endOfDay());

        $pagination = $dataQuery->orderBy('warehouse_qc.performed_at', 'desc')
                            ->simplePaginate($pageSize);

        return response()->json($pagination);
    }

    public function rejectOutboundQC(Request $request)
    {
        $rules = [
            'rfid' => ['string', 'required', 'exists:rfid_tags,value'],
            'condition' => ['string', 'nullable', 'max:255'],
            'note' => ['string', 'nullable'],
        ];

        $user = auth()->user();

        // Pastikan user memiliki warehouse yang terdaftar
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();


        $validated = $request->validate($rules);

        try {
            \DB::beginTransaction();


            // Temukan Item berdasarkan RFID dan pastikan bisa di-update
            $item = Item::whereHas('rfidTag', function ($query) use ($validated) {
                        $query->where('value', $validated['rfid']);
                    })
                    ->whereHas('warehouse', function ($query) use ($userWarehouseId) {
                        $query->where('warehouse_id', $userWarehouseId);
                    })
                    ->first();

            // Cek jika Item tidak ditemukan
            if (!$item) {
                \DB::rollback();
                // Throw exception agar frontend menerima error yang jelas
                throw ValidationException::withMessages([
                    'rfid' => 'RFID ini tidak terdaftar atau sudah tidak aktif.'
                ]);
            }

            if(!empty($validated['condition'])){
                // A. Cek/Buat ItemCondition
                $itemCondition = ItemCondition::firstOrCreate(
                    ['name' => $validated['condition']]
                );

                // B. Update Item (Mengganti kondisi dan status)
                $item->update([
                    'current_condition_id' => $itemCondition->id,
                    'status' => 'warehouse_processing'
                ]);

                // D. Create WarehouseQC Record (Log Reject)
                $qc = WarehouseQC::firstOrCreate([
                    'item_id' => $item->id,
                    'qc_type' => 'outbound',
                    'warehouse_id' => $userWarehouseId,
                    'status' => 'rejected',
                ],
        [
                    'item_condition_id' => $itemCondition->id,
                    'performed_at' => now(),
                    'performed_by' => $user->id,
                    'note' => $validated['note'] ?? null,
                ]);

                // E. Create History Condition
                ItemConditionHistory::firstOrCreate([
                    'item_id' => $item->id,
                    'item_condition_id' => $itemCondition->id,
                    'changed_by' => $user->id,
                    'reference_type' => 'outbound_qc',
                    'reference_id' => $qc->id,
                ],
                ['changed_at' => now(),]);
            }else{

                 // Update Item (Mengganti kondisi dan status)
                $item->update([
                    'status' => 'warehouse_processing'
                ]);

                // Create WarehouseQC Record (Log Reject)
                $qc = WarehouseQC::firstOrCreate([
                    'item_id' => $item->id,
                    'qc_type' => 'outbound',
                    'warehouse_id' => $userWarehouseId,
                    'item_condition_id' => $item->current_condition_id,
                    'status' => 'rejected',
                ],
        [
                    'performed_at' => now(),
                    'performed_by' => $user->id,
                    'note' => $validated['note'] ?? null,
                ]);
            }


            \DB::commit();

            return to_route('outbound-qc.index');

        } catch (\Exception $e) {
            // Jika terjadi error (termasuk ValidationException dari atas), lakukan rollback
            if (\DB::transactionLevel() > 0) {
                \DB::rollback();
            }
            // Throw ulang exception
            throw $e;
        }
    }
}
