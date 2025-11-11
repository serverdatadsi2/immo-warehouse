<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\RFIDTag;
use App\Models\StoreReturn;
use App\Models\WarehouseInbound;
use App\Models\WarehouseReturnInboundDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Log;

class ReturnInboundController extends Controller
{
    public function history(Request $request)
    {
        $user = auth()->user();
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $pagination = WarehouseInbound::query()
            ->with(['returnDetail', 'returnDetail.product:id,name', 'returnDetail.item:id,expired_date,rfid_tag_id'])
            ->join('store_returns as sr', 'sr.id', '=', 'warehouse_inbounds.store_return_id')
            ->join('stores as s', 's.id', '=', 'sr.store_id')
            ->leftJoin('warehouses as w', 'warehouse_inbounds.warehouse_id', '=', 'w.id')
            ->leftJoin('users as u', 'warehouse_inbounds.received_by', '=', 'u.id')
            ->whereIn('w.id', $userWarehouseIds)
            // ->whereNotNull('warehouse_inbounds.store_return_id')
            ->where('warehouse_inbounds.inbound_type', 'store_return')
            ->select('warehouse_inbounds.*', 'w.name as warehouse_name', 'u.name as received_name', 's.name as store_name')
            ->groupBy('warehouse_inbounds.id', 'w.name', 'u.name', 's.name')
            ->simplePaginate(10);

        return Inertia::render('inbounds/return-inbound/history', ['pagination' => $pagination]);
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $userWarehouseId = $user->warehouses()->pluck('warehouses.id')->first();

        $pagination = StoreReturn::query()
            ->with(['details', 'store:id,name','approved:id,name'])
            ->where('warehouse_id',$userWarehouseId)
            ->whereNotNull('approved_at')
            ->whereNotNull('approved_by')
            ->whereNotNull('shipped_at')
            ->orderBy('shipped_at', 'desc')
            ->simplePaginate(10);

        return Inertia::render('inbounds/return-inbound/index', ['pagination' => $pagination]);
   }

    public function detail(Request $request)
    {
        $storeReturnId = $request->input('storeReturnId');

        $header = null;
        $detailsPagination = null;

        if ($storeReturnId) {
            $header = WarehouseInbound::where('store_return_id', $storeReturnId)->first();
            if($header){
                $detailsPagination = WarehouseReturnInboundDetail::query()
                    ->leftJoin('products as p', 'p.id', '=', 'warehouse_return_inbound_details.product_id')
                    ->leftJoin('items as i', 'i.id', '=', 'warehouse_return_inbound_details.item_id')
                    ->where('warehouse_inbound_id', $header->id)
                    ->select('warehouse_return_inbound_details.*', 'p.name as product_name', 'i.expired_date', 'i.rfid_tag_id')
                    ->simplePaginate(5);
            }
        }

        return Inertia::render('inbounds/return-inbound/detail', [
            'detailsPagination' => $detailsPagination,
            'header' => $header,
            'storeReturnId' => $storeReturnId
        ]);
    }

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

        $header = WarehouseInbound::newModelInstance();
        DB::transaction(function () use ($validated, $request, &$header) {
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

        return to_route('inbounds.return-store.detail', ['storeReturnId' => $header->store_return_id]);
    }

    public function saveDetail(Request $request)
    {
        $rules = [
            'warehouse_inbound_id' => ['required', 'string', 'exists:warehouse_inbounds,id'],
            'store_return_id'      => ['required', 'string', 'exists:store_returns,id'],
            'product_id'           => ['nullable', 'string', 'exists:products,id'],
            'rfid'                 => ['nullable', 'string', 'exists:rfid_tags,value'],
        ];

        $validated = $request->validate($rules);

        $header = null;

        DB::transaction(function () use (&$header, $validated) {

            $status = 'extra';
            $itemBaru = null;

            // ==== CASE 1: ADA RFID ====
            if (!empty($validated['rfid'])) {
                // Cari item berdasarkan RFID
                $itemLama = Item::with(['rfidTag:id,value'])
                    ->whereHas('rfidTag', function ($q) use ($validated) {
                        $q->where('value', $validated['rfid']);
                    })
                    ->first();

                if (!$itemLama) {
                    throw new \Exception('Item dengan RFID tersebut tidak ditemukan.');
                }

                // Cek apakah RFID ada di store return
                $storeReturn = StoreReturn::with([
                        'details:id,item_id',
                        'details.item:id,rfid_tag_id',
                        'details.item.rfidTag:id,value',
                    ])
                    ->whereHas('details.item.rfidTag', function ($query) use ($validated) {
                        $query->where('value', $validated['rfid']);
                    })
                    ->first();

                if ($storeReturn) {
                    $status = 'match';
                }

                // ✅ Ubah status item lama menjadi destroy
                $itemLama->update(['status' => 'destroyed']);

                // ✅ Buat item baru dengan RFID yang sama (tidak generate baru)
                $itemBaru = Item::create([
                    'product_id' => $itemLama->product_id,
                    'current_condition_id' => $itemLama->current_condition_id,
                    'rfid_tag_id' => $itemLama->rfid_tag_id, // ← pakai RFID yang sama
                    'expired_date' => $itemLama->expired_date,
                    'status' => 'warehouse_processing',
                    'old_item_id' => $itemLama->id,
                ]);
            }

            // ==== CASE 2: TIDAK ADA RFID, ADA PRODUCT_ID ====
            elseif (!empty($validated['product_id'])) {

                // ✅ Generate RFID baru karena item baru
                $rfidId = (string) Str::uuid();
                $rfidTag = RFIDTag::create([
                    'id' => $rfidId,
                    'value' => $rfidId,
                ]);

                $itemBaru = Item::create([
                    'product_id' => $validated['product_id'],
                    'rfid_tag_id' => $rfidTag->id,
                    'status' => 'warehouse_processing',
                ]);

                $status = 'extra';
            }

            // ==== CASE 3: KEDUA FIELD KOSONG ====
            else {
                throw new \Exception('RFID atau Product ID harus diisi.');
            }

            // ==== SIMPAN DETAIL ====
            $detail = WarehouseReturnInboundDetail::create([
                'warehouse_inbound_id' => $validated['warehouse_inbound_id'],
                'item_id'              => $itemBaru->id,
                'product_id'           => $itemBaru->product_id,
                'status'               => $status,
            ]);

            // ==== UPDATE HEADER ====
            $header = WarehouseInbound::findOrFail($detail->warehouse_inbound_id);

            $result = WarehouseReturnInboundDetail::where('warehouse_inbound_id', $header->id)
                ->selectRaw('COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'grand_total'   => $result->quantity_item,
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('inbounds.return-store.detail', [
            'storeReturnId' => $header->store_return_id
        ]);
    }

    // public function deleteDetail(string $detailId)
    // {
    //     $header = null;
    //     $item = Item::where('warehouse_inbound_detail_id', $detailId)->first();
    //     if ($item) {
    //         return redirect()->back()->withErrors(['error'=> 'Detail tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
    //     }
    //     DB::transaction(function () use (&$header, $detailId) {
    //         $detail = WarehouseInboundDetail::findOrFail($detailId);
    //         $header = WarehouseInbound::findOrFail($detail->warehouse_inbound_id);
    //         $detail->delete();

    //         $result = WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)
    //             ->selectRaw('COALESCE(SUM(quantity),0) as grand_total, COUNT(*) as quantity_item')
    //             ->first();

    //         $header->update([
    //             'grand_total'   => $result->grand_total,
    //             'quantity_item' => $result->quantity_item,
    //         ]);
    //     });

    //     return to_route('inbounds.return-store.detail', ['storeReturnId' => $header->store_return_id]);
    // }

    // public function deleteHeader(string $headerId)
    // {
    //     $item = WarehouseInbound::join('warehouse_inbound_details', 'warehouse_inbound_details.warehouse_inbound_id', '=', 'warehouse_inbounds.id')
    //         ->join('items', 'items.warehouse_inbound_detail_id', '=', 'warehouse_inbound_details.id')
    //         ->where('warehouse_inbounds.id', $headerId)
    //         ->first();

    //     if ($item) {
    //         return redirect()->back()->withErrors(['error' => 'Inbound tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
    //     }

    //     DB::transaction(function () use ($headerId) {
    //         $header = WarehouseInbound::findOrFail($headerId);
    //         WarehouseInboundDetail::where('warehouse_inbound_id', $header->id)->delete();
    //         $header->delete();
    //     });

    //     return to_route('inbounds.return-store.index');
    // }

    public function compareMissing(Request $request)
    {
        $validated = $request->validate([
            'store_return_id' => ['required', 'string', 'exists:store_returns,id'],
            'warehouse_inbound_id' => ['required', 'string', 'exists:warehouse_inbounds,id'],
        ]);

        DB::transaction(function () use ($validated) {
            // 1️⃣ Ambil semua RFID dari StoreReturn
            $storeReturn = StoreReturn::with([
                'details.item:id,rfid_tag_id',
                'details.item.rfidTag:id,value',
            ])->findOrFail($validated['store_return_id']);

            $storeRfids = $storeReturn->details
                ->pluck('item.rfidTag.value')
                ->filter()
                ->toArray();

            if (empty($storeRfids)) {
                return to_route('inbounds.return-store.detail', ['storeReturnId' => $validated['store_return_id']]);
            }

            // 2️⃣ Ambil semua RFID yang SUDAH ADA di detail inbound
            $inboundRfids = WarehouseReturnInboundDetail::query()
                ->where('warehouse_inbound_id', $validated['warehouse_inbound_id'])
                ->join('items as i', 'i.id', '=', 'warehouse_return_inbound_details.item_id')
                ->join('rfid_tags as rt', 'rt.id', '=', 'i.rfid_tag_id')
                ->pluck('rt.value')
                ->toArray();

            // 3️⃣ Cari RFID yang ADA di StoreReturn tapi BELUM ADA di inbound detail
            $missingRfids = array_diff($storeRfids, $inboundRfids);

            if (empty($missingRfids)) {
                return to_route('inbounds.return-store.detail', ['storeReturnId' => $validated['store_return_id']]);
            }

            // 4️⃣ Ambil item yang terkait dengan RFID yang missing
            $missingItems = Item::query()
                ->join('rfid_tags as rt', 'rt.id', '=', 'items.rfid_tag_id')
                ->whereIn('rt.value', $missingRfids)
                ->select('items.id')
                ->get();

            // 5️⃣ Siapkan data untuk insert batch
            $dataToInsert = $missingItems->map(function ($item) use ($validated) {
                return [
                    'warehouse_inbound_id' => $validated['warehouse_inbound_id'],
                    'item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'status' => 'missing',
                ];
            })->toArray();

            // 6️⃣ Insert semua item yang missing
            WarehouseReturnInboundDetail::insert($dataToInsert);

            // 7️⃣ Update jumlah total item di WarehouseInbound
            $header = WarehouseInbound::find($validated['warehouse_inbound_id']);
            if ($header) {
                $result = WarehouseReturnInboundDetail::where('warehouse_inbound_id', $header->id)
                    ->selectRaw('COUNT(*) as quantity_item')
                    ->first();

                $header->update([
                    'grand_total'   => $result->quantity_item,
                    'quantity_item' => $result->quantity_item,
                ]);
            }
        });

        return to_route('inbounds.return-store.detail', ['storeReturnId' => $validated['store_return_id']]);
    }
}
