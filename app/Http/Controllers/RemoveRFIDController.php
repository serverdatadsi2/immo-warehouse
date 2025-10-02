<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\RFIDTag;
use App\Models\WarehouseInbound;
use App\Models\WarehouseInboundDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RemoveRFIDController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('remove-rfid/index');
    }

    public function checkRfid(Request $request, $rfidId)
    {
        $rfid = RFIDTag::where('id', $rfidId)->first();

        if ($rfid) {
            // Cek apakah RFID sudah digunakan di item
            $item = Item::where('rfid_tag_id', $rfidId)->first();

            if ($item) {
                $product = Product::find($item->product_id);
                return response()->json([
                    'exists' => true,
                    'rfid' => $rfid->value,
                    'product_name' => $product->name,
                    'product_code' => $product->code
                ]);
            }

            return response()->json([
                'exists' => true,
                'rfid' => $rfid->value,
                'product_name' => null,
                'product_code' => null
            ]);
        }

        return response()->json(['exists' => false]);
    }

    public function removeRfid(Request $request)
    {
        $rules = [
            'rfid_tags' => ['required', 'array'],
            'rfid_tags.*' => ['uuid', 'distinct'],
        ];

        $validated = $request->validate($rules);

        DB::transaction(function () use ($validated) {
            foreach ($validated['rfid_tags'] as $rfidId) {
                // Cari item berdasarkan RFID
                $item = Item::where('rfid_tag_id', $rfidId)->first();

                if ($item) {
                    // Cari detail inbound
                    $detail = WarehouseInboundDetail::find($item->warehouse_inbound_detail_id);

                    if ($detail) {
                        // Kurangi quantity detail
                        $detail->decrement('quantity', 1);

                        // Update header inbound (grand_total)
                        $header = WarehouseInbound::find($detail->warehouse_inbound_id);

                        if ($header) {
                            $header->decrement('grand_total', 1);
                        }
                    }

                    // Hapus item
                    $item->delete();
                }

                // Hapus RFID tag
                RFIDTag::where('id', $rfidId)->delete();
            }
        });


        return response()->json(['message' => 'RFID berhasil dihapus']);
    }
}
