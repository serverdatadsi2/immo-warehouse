<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\Item;
use App\Models\StoreOrder;
use App\Models\WarehouseOutbound;
use App\Models\WarehouseOutboundDetail;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class OutboundController extends Controller
{

    public function index(Request $request)
    {
        // Gate::authorize('formula.read');

        $pagination = WarehouseOutbound::query()
        ->with(['warehouse:id,name,code', 'user:id,name', 'courier:id,name'])
        ->simplePaginate(10);


        return Inertia::render('outbound/index', ['pagination' => $pagination]);
    }

    public function detail(Request $request)
    {
        $params = $request->only(['headerId', 'storeOrder', 'ecommerceOrder', 'orderNumber']);

        $headerId = $request->input('headerId');
        $storeOrderId = $request->input('storeOrder');
        $ecommerceOrderId = $request->input('ecommerceOrder');
        $header = null;
        $detailsPagination = null;

        if($headerId){
            $header = WarehouseOutbound::with([
                            'warehouse:id,name,code',
                            'user:id,name',
                            'courier:id,name'
                            ])
                            ->findOrFail($headerId);

        }else if($storeOrderId || $ecommerceOrderId) {
            $header = WarehouseOutbound::with([
                            'warehouse:id,name,code',
                            'user:id,name',
                            'courier:id,name'
                            ])
                            ->where('order_id',$storeOrderId ?? $ecommerceOrderId)
                            ->first();
        }

        if($header){
            $detailsPagination = WarehouseOutboundDetail::query()
                ->with([
                    'item:id,product_id,rfid_tag_id',
                    'item.product:id,name',
                    'item.rfidTag:id,value'
                ])
                ->where('warehouse_outbound_id', $header->id)
                ->simplePaginate(5);
        }


        return Inertia::render('outbound/detail', [
            'detailsPagination' => $detailsPagination,
            'headerData' => $header,
            'params' => $params
        ]);
    }

    public function detailOutbound(Request $request, $headerId)
    {
        // $headerId = $request->input('header');
        $header = null;
        $details = null;

        if ($headerId) {
            $header = WarehouseOutbound::with([
                            'warehouse:id,name,code,address',
                            'user:id,name',
                            'courier:id,name',
                            'storeOrder:id,store_id',
                            'storeOrder.store:id,name,address',
                            'ecommerceOrder:id,shipping_address_id,customer_id',
                            'ecommerceOrder.customer:id,name',
                            'ecommerceOrder.shippingAddress.provincy:id,code,name',
                            'ecommerceOrder.shippingAddress.regency:id,code,name',
                            'ecommerceOrder.shippingAddress.district:id,code,name',
                            'ecommerceOrder.shippingAddress.village:id,code,name',
                            ])
                            ->findOrFail($headerId);

            $details = WarehouseOutboundDetail::query()
                            ->join('items as i', 'i.id', '=', 'warehouse_outbound_details.item_id')
                            ->join('products as p', 'p.id', '=', 'i.product_id')
                            ->join('units as u', 'u.id', '=', 'p.unit_id')
                            ->select(columns: [
                                'i.product_id',
                                'p.name as product_name',
                                'p.code as product_code',
                                'u.name as unit_name',
                                DB::raw('COUNT(warehouse_outbound_details.id) as quantity')
                            ])
                            ->groupBy('i.product_id', 'p.name', 'u.name', 'p.code')
                            ->get();
        }

        return response()->json([
            'details' => $details,
            'header' => $header,
        ]);
    }

    public function saveHeader(Request $request)
    {
        $rules = [
            'warehouse_id' => ['string', 'required', 'exists:warehouses,id'],
            'user_id' => ['string', 'required', 'exists:users,id'],
            'invoice_number' => ['string', 'nullable'],
            'delivery_order_number' => ['string', 'nullable'],
            'courier_id' => ['string', 'nullable', 'exists:couriers,id'],
            'shipment_date' => ['date', 'required'],
            'order_ref' => ['string', 'required'],
            'order_id' => ['string', 'required'],
            'order_number' => ['string', 'required'],
            'outbound_type' => ['string', 'required'],
        ];

        $validated = $request->validate($rules);

        $header = WarehouseOutbound::newModelInstance();
        DB::transaction(function () use ($validated, $request, &$header) {
            if ($request->id) {
                $header = WarehouseOutbound::updateOrCreate(
                    ['id' => $request->id],
                    $validated
                );
            } else {
                $header = WarehouseOutbound::create($validated);
            }

            if (empty($header->delivery_order_number)) {
                $kodeSuratJalan = $this->generateDeliveryOrderNumber();
                $header->update(['delivery_order_number' => $kodeSuratJalan]);
            }

            if (empty($header->invoice_number) && $header->order_ref === 'store') {
                $kodeInvoice = $this->generateInvoiceNumber();
                $header->update(['invoice_number' => $kodeInvoice]);
            }

            $result = WarehouseOutboundDetail::where('warehouse_outbound_id', $header->id)
                ->selectRaw('COUNT(*) as quantity')
                ->first();

            $header->update([
                'quantity_item'   => $result->quantity,
            ]);
        });

        return to_route('outbound.detail', ['headerId' => $header->id]);
    }

    public function saveDetail(Request $request)
    {
        $rules = [
            'warehouse_outbound_id' => ['string', 'required', 'exists:warehouse_outbounds,id'],
            'rfid' => ['string', 'required', 'exists:rfid_tags,value'],
        ];

        $validated = $request->validate($rules);

        $item = Item::with(['rfidTag:id,value'])
                ->whereHas('rfidTag', function ($query) use ($validated) {
                    $query->where('value', $validated['rfid']);
                })->first();

        DB::transaction(function () use ($validated, $item) {
           $detail = WarehouseOutboundDetail::firstOrCreate(
                [
                    'warehouse_outbound_id' => $validated['warehouse_outbound_id'],
                    'item_id' => $item->id,
                ]);

            $header = WarehouseOutbound::findOrFail($detail->warehouse_outbound_id);

            $result = WarehouseOutboundDetail::where('warehouse_outbound_id', $header->id)
                ->selectRaw('COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('outbound.detail', ['headerId' => $validated['warehouse_outbound_id']]);
    }

    public function deleteDetail(string $detailId)
    {
        $headerId = null;
        // $item = Item::where('warehouse_outbound_detail_id', $detailId)->first();
        // if ($item) {
        //     return redirect()->back()->withErrors(['error'=> 'Detail tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
        // }
        DB::transaction(function () use (&$headerId, $detailId) {
            $detail = WarehouseOutboundDetail::findOrFail($detailId);
            $headerId = $detail->warehouse_outbound_id;
            $detail->delete();
            $header = WarehouseOutbound::findOrFail($detail->warehouse_outbound_id);

            $result = WarehouseOutboundDetail::where('warehouse_outbound_id', $header->id)
                ->selectRaw('COUNT(*) as quantity_item')
                ->first();

            $header->update([
                'quantity_item' => $result->quantity_item,
            ]);
        });

        return to_route('outbound.detail', ['headerId' => $headerId]);
    }

    public function deleteHeader(string $headerId)
    {
        // $item = WarehouseOutbound::join('warehouse_outbound_details', 'warehouse_outbound_details.warehouse_outbound_id', '=', 'warehouse_outbounds.id')
        //     ->join('items', 'items.warehouse_outbound_detail_id', '=', 'warehouse_outbound_details.id')
        //     ->where('warehouse_outbounds.id', $headerId)
        //     ->first();

        // if ($item) {
        //     return redirect()->back()->withErrors(['error' => 'outbound tidak bisa dihapus karena sudah terhubung dengan RFID Tag']);
        // }

        DB::transaction(function () use ($headerId) {
            $header = WarehouseOutbound::findOrFail($headerId);
            WarehouseOutboundDetail::where('warehouse_outbound_id', $header->id)->delete();
            $header->delete();
        });

        return to_route('outbound.index');
    }

    public function getStoreOrderPacking(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;


        $data = StoreOrder::where('status','packing')
            ->when($search, function ($query, $search) {
                return $query->where('order_number', 'ILIKE', "{$search}%");
            })
            ->offset($offset)
            ->limit(30)->get();

        return Response::json($data);
    }

    public function getEcommerceOrderPacking(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;


        $data = EcommerceOrder::where('status','packing')
            ->when($search, function ($query, $search) {
                return $query->where('order_number', 'ILIKE', "{$search}%");
            })
            ->offset($offset)
            ->limit(30)->get();

        return Response::json($data);
    }

    private function generateDeliveryOrderNumber()
    {
        $date = now();
        $dateCode = $date->format('Ymd'); // contoh: 20251014

        // Ambil surat jalan terakhir yang dibuat pada hari ini
        $lastRecord = WarehouseOutbound::whereDate('created_at', $date->toDateString())
            // ->where('delivery_order_number', 'ILIKE', "SJ-{$dateCode}-%")
            ->orderBy('created_at', 'desc')
            ->first();

        // Tentukan nomor urut berikutnya
        $nextNumber = 1;
        if ($lastRecord) {
            $parts = explode('-', $lastRecord->delivery_order_number);
            $lastNumber = isset($parts[2]) ? (int) $parts[2] : 0;
            $nextNumber = $lastNumber + 1;
        }

        $runningNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        $kodeSuratJalan = "SJ-{$dateCode}-{$runningNumber}";

        return $kodeSuratJalan;
    }

    private function generateInvoiceNumber()
    {
        $date = now();
        $dateCode = $date->format('Ymd');

        $lastRecord = WarehouseOutbound::whereDate('created_at', $date->toDateString())
            // ->where('invoice_number', 'ILIKE', "INV-SO-{$dateCode}-%")
            ->orderBy('created_at', 'desc')
            ->first();

        $nextNumber = 1;
        if ($lastRecord && !empty($lastRecord->invoice_number)) {
            $parts = explode('-', $lastRecord->invoice_number);
            $lastNumber = isset($parts[2]) ? (int) $parts[2] : 0;
            $nextNumber = $lastNumber + 1;
        }

        $runningNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        return "INV-SO-{$dateCode}-{$runningNumber}";
        // return "INV-SO{$kodeStore}-{$dateCode}-{$runningNumber}"; //nantinya akan di rubah berdsarkan kode store
    }
}
