<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Product;
use App\Models\RFIDTag;
use App\Models\WarehouseInboundDetail;
use App\Models\WarehouseStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

class RFIDTaggingController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('rfid-tagging/index');
    }

    public function listDetails(Request $request)
    {
        $search = $request->input('search');

        $query = WarehouseInboundDetail::query()
                ->leftJoin('products as p', 'p.id', '=', 'warehouse_inbound_details.product_id')
                ->leftJoin('warehouse_inbounds as wi', 'wi.id', '=', 'warehouse_inbound_details.warehouse_inbound_id')
                ->leftJoin('items as i', 'i.warehouse_inbound_detail_id', '=', 'warehouse_inbound_details.id')
                ->select('warehouse_inbound_details.*', 'p.name as product_name', 'p.code as product_code', 'received_date', 'warehouse_id')
                ->where('i.status', '=', null)
                ->orderBy('received_date', 'asc')
                ->groupBy('warehouse_inbound_details.id', 'p.name', 'p.code', 'wi.received_date', 'wi.warehouse_id');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('p.name', 'ILIKE', "%{$search}%")
                  ->orWhere('p.code', 'ILIKE', "%{$search}%");
            });
        }
        $data = $query->paginate(4);

        return Response::json($data);
    }

    public function insertItemStock(Request $request)
    {
        $rules = [
            'warehouse_id' => ['string', 'required', 'exists:warehouses,id'],
            'rfid_tags' => ['required', 'array'],
            'rfid_tags.*' => ['uuid', 'distinct'],
        ];

        $validated = $request->validate($rules);

        DB::transaction(function () use ($validated) {
            $stocks = [];

            foreach ($validated['rfid_tags'] as $rfidId) {
                $item = Item::where('rfid_tag_id', $rfidId)->firstOrFail();
                $item->update(['status' => 'warehouse_stock']);

                // Simpan Stock
                $stocks[] = [
                    'warehouse_id' => $validated['warehouse_id'],
                    'item_id' => $item->id,
                ];
            }

            WarehouseStock::insert($stocks);
        });

        return to_route('rfid-tagging.index');
    }

    public function createRFIDTag(Request $request)
    {
        $validated = $request->validate([
            'quantity' => ['numeric', 'required'],
        ]);

        $qty = (int) $validated['quantity'];

        $unusedTags = RfidTag::leftJoin('items', 'rfid_tags.id', '=', 'items.rfid_tag_id')
                        ->whereNull('items.rfid_tag_id')
                        ->select('rfid_tags.*')
                        ->get();

        $unusedTagCount = $unusedTags->count();

        $qtyToInsert = $qty - $unusedTagCount;

        $newTags = collect();

        DB::transaction(function () use ($qtyToInsert, &$newTags) {
            if ($qtyToInsert > 0) {
                $rfids = [];

                for ($i = 0; $i < $qtyToInsert; $i++) {
                    $rfidId = (string) Str::uuid();
                    $rfids[] = [
                        'id' => $rfidId,
                        'value' => $rfidId,
                    ];
                }

                RfidTag::insert($rfids);

                $newTags = RfidTag::whereIn('id', array_column($rfids, 'id'))->get();
            }
        });

        $allAvailable = $unusedTags->merge($newTags);

        return response()->json($allAvailable);
    }

    public function generateRFIDTagItems(Request $request)
    {
        $rules = [
            'warehouse_inbound_detail_id' => ['string', 'required', 'exists:warehouse_inbound_details,id'],
            'product_id' => ['string', 'required', 'exists:products,id'],
            'expired_date' => ['date', 'nullable'],
            'quantity' => ['numeric', 'required'],
        ];

        $validated = $request->validate($rules);

        $qty = (int) $validated['quantity'];

        $items = Item::where('warehouse_inbound_detail_id', $validated['warehouse_inbound_detail_id'])
                    ->where('product_id', $validated['product_id'])
                    ->where('expired_date', $validated['expired_date'])
                    ->get();

        $newItems = DB::transaction(function () use ($items, $validated, $qty) {
            $createdItems = [];

            $qtyToInsert = $qty - $items->count();

            for ($i = 0; $i < $qtyToInsert; $i++) {
                $rfidId = (string) Str::uuid();

                // Simpan RFID Tag
                $rfid = RfidTag::create([
                    'id' => $rfidId,
                    'value' => $rfidId,
                ]);

                // Simpan Item
                $createdItems[] = Item::updateOrCreate(
                    [
                        'warehouse_inbound_detail_id' => $validated['warehouse_inbound_detail_id'],
                        'rfid_tag_id' => $rfid->id,
                    ],
                    [
                        'product_id' => $validated['product_id'],
                        'expired_date' => $validated['expired_date'],
                    ],
                );
            }
            return $createdItems;
        });

        $allAvailable = $items->merge($newItems);

        return $allAvailable;
        // return response()->json($allAvailable);
    }

    public function getRFIDItems(Request $request)
    {
        $rules = [
            'warehouse_inbound_detail_id' => ['string', 'required', 'exists:warehouse_inbound_details,id'],
            'product_id' => ['string', 'required', 'exists:products,id'],
            'expired_date' => ['date', 'nullable'],
        ];

        $validated = $request->validate($rules);

        $items = Item::where('warehouse_inbound_detail_id', $validated['warehouse_inbound_detail_id'])->where('product_id', $validated['product_id'])->where('expired_date', $validated['expired_date'])->get();

        return response()->json($items);
    }

    public function generatePdfWithRFID(Request $request)
    {
        $items = $this->generateRFIDTagItems($request); // sudah return collection
        $product = Product::findOrFail($request->product_id);

        $pdf = new \FPDF('P','mm','A4');
        $pdf->AddPage();
        $pageWidth = $pdf->GetPageWidth();
        $pageHeight = $pdf->GetPageHeight();

        $qrSize = 20;
        $cols = 3;
        $cellHeight = 28;
        $cellWidth = $pageWidth / $cols;

        $x = 10;
        $y = 10;

        foreach ($items as $i => $item) {
            $rfid_tag_id = $item->rfid_tag_id;

            // Generate QR ke binary string PNG
            $options = new QROptions([
                'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel'   => QRCode::ECC_L,
                'scale'      => 3,
            ]);
            $qrcode = (new QRCode($options))->render($rfid_tag_id);

            // Simpan ke file sementara dengan ekstensi .png
            $tempFile = storage_path("app/tmp/".md5($rfid_tag_id).".png");
            if (!file_exists(dirname($tempFile))) {
                mkdir(dirname($tempFile), 0777, true);
            }
            file_put_contents($tempFile, $qrcode);

            // Masukkan QR ke PDF
            $pdf->Image($tempFile, $x, $y, $qrSize, $qrSize);

            // Text di bawah dan kanan QR
            $pdf->SetFont('Arial','',7);
            $pdf->Text($x+2, $y+$qrSize+4, $rfid_tag_id);

            $pdf->SetFont('Arial','',8);
            $pdf->Text($x+$qrSize+2, $y+6, $product->product_name);
            $pdf->Text($x+$qrSize+2, $y+10, "Code: ".$product->product_code);

            // Posisi kolom
            if ((($i+1) % $cols) == 0) {
                $x = 10;
                $y += $cellHeight;
            } else {
                $x += $cellWidth;
            }

            // Page break
            if ($y + $cellHeight > $pageHeight - 10) {
                $pdf->AddPage();
                $x = 10;
                $y = 10;
            }

            // Hapus file sementara
            @unlink($tempFile);
        }

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="rfid-qrcodes.pdf"');
    }
}
