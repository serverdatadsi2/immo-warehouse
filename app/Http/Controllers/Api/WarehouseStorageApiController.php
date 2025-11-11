<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\LocationHistory;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;

class WarehouseStorageApiController extends Controller
{
    public function assignment(Request $request)
    {
        $rules = [
            'rfid_tags' => ['required', 'array', 'min:1'],
            'rfid_tags.*' => ['string', 'exists:rfid_tags,value'],
            'location_tag' => ['required', 'string', 'exists:location_rfid_tags,value'],
            'warehouse_id' => ['required', 'string', 'exists:warehouses,id'],
        ];

        $validated = $request->validate($rules);

        // Pastikan lokasi benar-benar terdaftar di warehouse user
        $location = \DB::table('location_rfid_tags as lrt')
            ->join('warehouse_locations as wl', 'wl.location_id', '=', 'lrt.location_id')
            ->where('lrt.value', $validated['location_tag'])
            ->where('wl.warehouse_id', $validated['warehouse_id'])
            ->value('wl.location_id');

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Lokasi tidak terdaftar di warehouse Anda.'
            ], 422);
        }

        try {
            \DB::beginTransaction();

            $processed = [];
            $failed = [];

            foreach ($validated['rfid_tags'] as $rfid) {
                $item = Item::whereHas('rfidTag', fn($q) => $q->where('value', $rfid))->first();

                if (!$item) {
                    $failed[] = [
                        'rfid' => $rfid,
                        'error' => 'RFID ini tidak terdaftar atau sudah tidak aktif.'
                    ];
                    continue;
                }

                // Update status dan lokasi item
                $item->update([
                    'status' => 'warehouse_stock',
                    'current_location_id' => $location,
                ]);

                // Catat ke WarehouseStock
                WarehouseStock::firstOrCreate([
                    'warehouse_id' => $validated['warehouse_id'],
                    'item_id' => $item->id,
                ]);

                // Simpan ke LocationHistory
                LocationHistory::create([
                    'item_id' => $item->id,
                    'location_id' => $location,
                ]);

                $processed[] = [
                    'rfid' => $rfid,
                    'item_id' => $item->id,
                    'status' => 'warehouse_stock',
                    'location_id' => $location,
                ];
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Items processed successfully.',
                'processed_count' => count($processed),
                'failed_count' => count($failed),
                'processed' => $processed,
                'failed' => $failed,
            ], 200);
        } catch (\Throwable $e) {
            \DB::rollBack();
            \Log::error('Error processing Warehouse Storage Assignment: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
