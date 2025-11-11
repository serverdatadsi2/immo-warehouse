<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\RFIDTag;
use App\Models\StoreReturn;
use App\Models\WarehouseInbound;
use App\Models\WarehouseReturnInboundDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ReturnInboundApiController extends Controller
{
    public function saveHeader(Request $request)
    {
        $rules = [
            'store_return_id' => ['string', 'required', 'exists:store_returns,id'],
            'received_by' => ['string', 'required', 'exists:users,id'],
            'warehouse_id' => ['string', 'required', 'exists:warehouses,id'],
            'invoice_number' => ['string', 'nullable'],
            'delivery_order_number' => ['string', 'nullable'],
            'received_date' => ['date', 'required'],
        ];

        $validated = array_merge($request->validate($rules), [
                        'inbound_type' => 'store_return',
                    ]) ;

        try {
            $header = WarehouseInbound::newModelInstance();
            \DB::transaction(function () use ($validated, $request, &$header) {
                if ($request->id) {
                    $header = WarehouseInbound::updateOrCreate(
                        ['id' => $request->id],
                        $validated
                    );
                } else {
                    $header = WarehouseInbound::create($validated);
                }

                $result = WarehouseReturnInboundDetail::where('warehouse_inbound_id', $header->id)
                    ->selectRaw('COUNT(*) as quantity_item')
                    ->first();

                StoreReturn::find($validated['store_return_id'])
                    ->update([
                        'status' => 'received',
                        'received_at' => $validated['received_date']
                    ]);

                $header->update([
                    'grand_total'   => $result->quantity_item,
                    'quantity_item' => $result->quantity_item,
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Header return inbound berhasil dibuat.',
            ], 201);

        } catch (\Throwable $e) {
            \DB::rollBack();
            \Log::error('Error save Header return inbound: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan header return inbound: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function saveDetail(Request $request)
    {
        $rules = [
            'warehouse_inbound_id' => ['required', 'string', 'exists:warehouse_inbounds,id'],
            'store_return_id'      => ['required', 'string', 'exists:store_returns,id'],
            'product_id'           => ['nullable', 'string', 'exists:products,id'],
            'rfid_tags'            => ['nullable', 'array'],
            'rfid_tags.*'          => ['string', 'exists:rfid_tags,value'],
        ];

        $validated = $request->validate($rules);

        try {
            \DB::transaction(function () use ($validated) {

                $warehouseInboundId = $validated['warehouse_inbound_id'];
                $storeReturnId      = $validated['store_return_id'];
                $rfidTags           = $validated['rfid_tags'] ?? [];
                $productId          = $validated['product_id'] ?? null;

                // === CASE 1: ADA ARRAY RFID_TAGS ===
                if (!empty($rfidTags)) {
                    foreach ($rfidTags as $rfid) {

                        $status = 'extra';
                        $itemBaru = null;

                        $itemLama = Item::with('rfidTag:id,value')
                            ->whereHas('rfidTag', function ($q) use ($rfid) {
                                $q->where('value', $rfid);
                            })
                            ->first();

                        if (!$itemLama) {
                            throw ValidationException::withMessages([
                                'rfid_tags' => ["Item dengan RFID {$rfid} tidak ditemukan."],
                            ]);
                        }

                        // ✅ Cek apakah RFID valid di store_return
                        $storeReturn = StoreReturn::with([
                                'details:id,item_id',
                                'details.item:id,rfid_tag_id',
                                'details.item.rfidTag:id,value',
                            ])
                            ->where('id', $storeReturnId)
                            ->whereHas('details.item.rfidTag', function ($query) use ($rfid) {
                                $query->where('value', $rfid);
                            })
                            ->first();

                        if ($storeReturn) {
                            $status = 'match';
                        }

                        if ($itemLama->status === 'destroyed') {
                            throw ValidationException::withMessages([
                                'rfid_tags' => ["Item dengan RFID {$rfid} sudah tidak aktif."],
                            ]);
                        }

                        // ✅ Tandai item lama tidak aktif
                        $itemLama->update(['status' => 'destroyed']);

                        // ✅ Buat item baru
                        $itemBaru = Item::create([
                            'product_id'           => $itemLama->product_id,
                            'current_condition_id' => $itemLama->current_condition_id,
                            'rfid_tag_id'          => $itemLama->rfid_tag_id,
                            'expired_date'         => $itemLama->expired_date,
                            'status'               => 'warehouse_processing',
                            'old_item_id'          => $itemLama->id,
                        ]);

                        // ✅ Simpan detail per RFID
                        WarehouseReturnInboundDetail::create([
                            'warehouse_inbound_id' => $warehouseInboundId,
                            'store_return_id'      => $storeReturnId,
                            'item_id'              => $itemBaru->id,
                            'product_id'           => $itemBaru->product_id,
                            'status'               => $status,
                        ]);
                    }
                }

                // === CASE 2: TANPA RFID, ADA PRODUCT ID ===
                elseif (!empty($productId)) {
                    $rfidId = (string) Str::uuid();
                    $rfidTag = RfidTag::create([
                        'id'    => $rfidId,
                        'value' => $rfidId,
                    ]);

                    $itemBaru = Item::create([
                        'product_id'  => $productId,
                        'rfid_tag_id' => $rfidTag->id,
                        'status'      => 'warehouse_processing',
                    ]);

                    $createdDetails[] = WarehouseReturnInboundDetail::create([
                        'warehouse_inbound_id' => $warehouseInboundId,
                        'store_return_id'      => $storeReturnId,
                        'item_id'              => $itemBaru->id,
                        'product_id'           => $itemBaru->product_id,
                        'status'               => 'extra',
                    ]);
                }

                // === CASE 3: VALIDASI GAGAL ===
                else {
                    throw ValidationException::withMessages([
                        'rfid_tags' => ['Minimal salah satu dari RFID Tags atau Product ID harus diisi.'],
                    ]);
                }

                // === UPDATE HEADER ===
                $header = WarehouseInbound::findOrFail($warehouseInboundId);
                $count = WarehouseReturnInboundDetail::where('warehouse_inbound_id', $header->id)->count();

                $header->update([
                    'grand_total'   => $count,
                    'quantity_item' => $count,
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Detail return inbound berhasil diproses.',
            ], 201);

        } catch (ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => $ve->getMessage(),
                'errors'  => $ve->errors(),
            ], 422);

        } catch (\Throwable $e) {
            \Log::error('Error saveDetail return inbound: ' . $e->getMessage(), [
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan detail return inbound.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
