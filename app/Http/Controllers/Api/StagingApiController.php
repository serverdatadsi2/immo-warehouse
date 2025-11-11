<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\WarehouseStagingOutbound;
use App\Models\WarehouseStagingOutboundDetail;
use Illuminate\Http\Request;

class StagingApiController extends Controller
{
    public function saveHeader(Request $request)
    {
        $validated = $request->validate([
            'staging_rfid_tag' => ['string', 'required', 'exists:location_rfid_tags,value'],
        ]);

        try {
            $location = Location::query()
                ->join('location_rfid_tags as lrg', function ($join) {
                    $join->on('lrg.location_id', '=', 'locations.id')
                        ->whereNull('lrg.deleted_at');
                })
                ->join('warehouse_locations as wl', 'wl.location_id', '=', 'locations.id')
                ->where('lrg.value', $validated['staging_rfid_tag'])
                ->select('locations.*', 'wl.warehouse_id', 'lrg.id as location_staging_id')
                ->first();

            if (!$location) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lokasi tidak ditemukan atau tidak terkait dengan gudang mana pun.'
                ], 404);
            }

            $header = null;

            \DB::transaction(function () use ($location, &$header) {
                $header = WarehouseStagingOutbound::create([
                    'name' => $location->name,
                    'warehouse_id' => $location->warehouse_id,
                    'location_rfid_tag_id' => $location->location_staging_id,
                ]);

                $result = WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $header->id)
                    ->selectRaw('COUNT(*) as grand_total')
                    ->first();

                $header->update([
                    'quantity' => $result->grand_total ?? 0,
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Header staging area berhasil dibuat.',
            ], 201);

        } catch (\Throwable $e) {
            \DB::rollBack();
            \Log::error('Error save Header Staging Area: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan header staging area: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function saveDetail(Request $request)
    {
        $validated = $request->validate([
            'warehouse_outbound_ids' => ['required', 'array', 'min:1'],
            'warehouse_outbound_ids.*' => ['string', 'exists:warehouse_outbounds,id'],
            'warehouse_staging_outbound_id' => ['string', 'required', 'exists:warehouse_staging_outbounds,id']
        ]);

        try {
            \DB::transaction(function () use ($validated) {

                $stagingId = $validated['warehouse_staging_outbound_id'];
                $outboundIds = $validated['warehouse_outbound_ids'];

                // Loop semua outbound ID dan masukkan ke detail
                foreach ($outboundIds as $outboundId) {
                    WarehouseStagingOutboundDetail::firstOrCreate([
                        'warehouse_outbound_id' => $outboundId,
                        'warehouse_staging_outbound_id' => $stagingId,
                    ]);
                }

                $header = WarehouseStagingOutbound::findOrFail($stagingId);

                $result = WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $header->id)
                    ->selectRaw('COUNT(*) as grand_total')
                    ->first();

                $header->update([
                    'quantity' => $result->grand_total,
                ]);

                return $header;
            });

            return response()->json([
                'success' => true,
                'message' => 'Detail staging area berhasil ditambahkan.',
            ], 201);

        } catch (\Throwable $e) {
            \Log::error('Error saveDetail Staging Area: ' . $e->getMessage(), [
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan detail staging area: ' . $e->getMessage(),
            ], 500);
        }
    }
}
