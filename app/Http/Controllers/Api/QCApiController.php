<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ItemCondition;
use App\Models\ItemConditionHistory;
use App\Models\WarehouseQC;
use Illuminate\Http\Request;

class QCApiController extends Controller
{
    public function inboundQc(Request $request)
    {
        $rules = [
            'rfid_tags' => ['required', 'array', 'min:1'],
            'rfid_tags.*' => ['string', 'exists:rfid_tags,value'],
            'warehouse_id' => ['required', 'string', 'exists:warehouses,id'],
            'condition' => ['required', 'string'],
        ];

        $validated = $request->validate($rules);

        // $user = auth()->user(); // aktifkan jika pakai auth
        $user = auth()->user() ?? (object)['id' => 'd3252c7f-8d4c-4bce-9478-db61e4d51c97']; // fallback anam (warehouse jakarta) sementara

        try {
            \DB::beginTransaction();

            $itemCondition = ItemCondition::firstOrCreate(
                ['name' => $validated['condition']]
            );

            $processed = [];
            $failed = [];

            foreach ($validated['rfid_tags'] as $rfidValue) {
                $item = Item::whereHas('rfidTag', function ($query) use ($rfidValue) {
                    $query->where('value', $rfidValue);
                })->first();

                if (!$item) {
                    $failed[] = [
                        'rfid' => $rfidValue,
                        'error' => 'RFID tidak ditemukan atau tidak aktif',
                    ];
                    continue;
                }

                // Update kondisi dan status item
                $item->update([
                    'current_condition_id' => $itemCondition->id,
                    'status' => 'warehouse_processing',
                ]);

                // Buat / update record QC
                $qc = WarehouseQC::updateOrCreate(
                    [
                        'item_id' => $item->id,
                        'qc_type' => 'inbound',
                        'warehouse_id' => $validated['warehouse_id'],
                    ],
                    [
                        'status' => 'accepted',
                        'item_condition_id' => $itemCondition->id,
                        'performed_at' => now(),
                        'performed_by' => $user->id,
                    ]
                );

                // Tambahkan riwayat kondisi
                ItemConditionHistory::create([
                    'item_id' => $item->id,
                    'item_condition_id' => $itemCondition->id,
                    'changed_by' => $user->id,
                    'reference_type' => 'warehouse_inbound_qc',
                    'reference_id' => $qc->id,
                    'changed_at' => now(),
                ]);

                $processed[] = [
                    'rfid' => $rfidValue,
                    'item_id' => $item->id,
                    'qc_id' => $qc->id,
                ];
            }

            \DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Inbound QC updated successfully.',
                'processed' => $processed,
                'failed' => $failed,
            ]);

        } catch (\Throwable $e) {
            if (\DB::transactionLevel() > 0) {
                \DB::rollBack();
            }
            \Log::error('Error processing inbound QC: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function outboundQC(Request $request)
    {
        $rules = [
            'rfid_tags' => ['required', 'array', 'min:1'],
            'rfid_tags.*' => ['string', 'exists:rfid_tags,value'],
            'warehouse_id' => ['required', 'string', 'exists:warehouses,id'],
            'condition' => ['string', 'nullable', 'max:255'],
            'note' => ['string', 'nullable', 'max:500'],
        ];


        $validated = $request->validate($rules);

        $warehouseId = $validated['warehouse_id'];
        $conditionName = $validated['condition'] ?? null;
        $note = $validated['note'] ?? null;
        $rfidTags = $validated['rfid_tags'];

        $user = auth()->user() ?? (object)['id' => 'd3252c7f-8d4c-4bce-9478-db61e4d51c97']; // fallback anam (warehouse jakarta) sementara
        // $user = auth()->user() ?? (object)['id' => 'a7c3ee1a-3525-45ae-be2c-2c4bf849ea98'];

        try {
            \DB::beginTransaction();

            $processed = [];
            $failed = [];

            // jika ada condition baru, pastikan ada di table
            $itemCondition = null;
            if (!empty($conditionName)) {
                $itemCondition = ItemCondition::firstOrCreate(['name' => $conditionName]);
            }

            foreach ($rfidTags as $rfid) {
                $item = Item::whereHas('rfidTag', function ($query) use ($rfid) {
                    $query->where('value', $rfid);
                })->first();

                if (!$item) {
                    $failed[] = [
                        'rfid' => $rfid,
                        'error' => 'RFID tidak ditemukan atau tidak aktif',
                    ];
                    continue;
                }

                // update kondisi & status
                if ($itemCondition) {
                    $item->update([
                        'current_condition_id' => $itemCondition->id,
                        'status' => 'warehouse_processing',
                    ]);

                    // QC record
                    $qc = WarehouseQC::firstOrCreate(
                        [
                            'item_id' => $item->id,
                            'qc_type' => 'outbound',
                            'warehouse_id' => $warehouseId,
                            'status' => 'accepted',
                        ],
                        [
                            'item_condition_id' => $itemCondition->id,
                            'performed_at' => now(),
                            'performed_by' => $user->id,
                            'note' => $note,
                        ]
                    );

                    // History condition
                    ItemConditionHistory::firstOrCreate(
                        [
                            'item_id' => $item->id,
                            'item_condition_id' => $itemCondition->id,
                            'changed_by' => $user->id,
                            'reference_type' => 'warehouse_outbound_qc',
                            'reference_id' => $qc->id,
                        ],
                        ['changed_at' => now()]
                    );
                } else {
                    // jika tidak ada condition, hanya ubah status
                    $item->update([
                        'status' => 'warehouse_processing',
                    ]);

                    WarehouseQC::firstOrCreate(
                        [
                            'item_id' => $item->id,
                            'qc_type' => 'outbound',
                            'warehouse_id' => $warehouseId,
                            'item_condition_id' => $item->current_condition_id,
                            'status' => 'accepted',
                        ],
                        [
                            'performed_at' => now(),
                            'performed_by' => $user->id,
                            'note' => $note,
                        ]
                    );
                }

                $processed[] = [
                    'rfid' => $rfid,
                    'item_id' => $item->id,
                    'status' => 'warehouse_processing',
                ];
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Outbound QC processed successfully.',
                'processed_count' => count($processed),
                'failed_count' => count($failed),
                'processed' => $processed,
                'failed' => $failed,
            ], 200);
        } catch (\Throwable $e) {
            \DB::rollBack();
            \Log::error('Error processing outbound QC: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
