<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ItemCondition;
use App\Models\ItemConditionHistory;
use App\Models\WarehouseQC;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class QCApiController extends Controller
{
    public function updateLabelInboundQc(Request $request)
    {
        $rules = [
            'rfid_tags' => ['required', 'array', 'min:1'],
            'rfid_tags.*' => ['string', 'exists:rfid_tags,value'],
            'warehouse_id' => ['required', 'string', 'exists:warehouses,id'],
            'condition' => ['required', 'string'], // Tambahkan validasi untuk kondisi
        ];

        $validated = $request->validate($rules);

        // $user = auth()->user(); // aktifkan jika pakai auth
        $user = auth()->user() ?? (object)['id' => 'a7c3ee1a-3525-45ae-be2c-2c4bf849ea98']; // fallback superadmin sementara

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

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
