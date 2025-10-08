<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Product;
use App\Models\RFIDTag;
use App\Models\WarehouseInboundDetail;
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
        $user = auth()->user();
        // ambil warehouse pertama milik user
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');
        $search = $request->input('search');

        $query = WarehouseInboundDetail::query()
                ->join('products as p', 'p.id', '=', 'warehouse_inbound_details.product_id')
                ->join('warehouse_inbounds as wi', 'wi.id', '=', 'warehouse_inbound_details.warehouse_inbound_id')
                ->leftJoin('items as i', 'i.warehouse_inbound_detail_id', '=', 'warehouse_inbound_details.id')
                ->whereIn('wi.warehouse_id', $userWarehouseIds)
                ->select(
                    'warehouse_inbound_details.id',
                    'warehouse_inbound_details.product_id',
                    'warehouse_inbound_details.warehouse_inbound_id',
                    'warehouse_inbound_details.quantity as quantity_inbound',
                    'p.name as product_name',
                    'p.code as product_code',
                    'wi.received_date',
                    'wi.warehouse_id',
                    'warehouse_inbound_details.expired_date',

                    // 1. Hitung jumlah item yang sudah QC (current_condition_id TIDAK NULL)
                    // 2. Kurangi quantity inbound detail dengan quantity qc 'quantity'
                    DB::raw('
                        warehouse_inbound_details.quantity - COUNT(
                            CASE
                                WHEN i.current_condition_id IS NOT NULL THEN i.id
                                ELSE NULL
                            END
                        ) AS quantity'
                    )
                )
                ->orderBy('received_date', 'asc')
                ->groupBy(
                    'warehouse_inbound_details.id',
                    'warehouse_inbound_details.product_id',
                    'warehouse_inbound_details.warehouse_inbound_id',
                    'warehouse_inbound_details.quantity',
                    'p.name',
                    'p.code',
                    'wi.received_date',
                    'wi.warehouse_id',
                    'warehouse_inbound_details.expired_date'
                )

                // Memastikan quantity sisa (hasil perhitungan) lebih besar dari 0
                ->havingRaw('
                    warehouse_inbound_details.quantity - COUNT(
                        CASE
                            WHEN i.current_condition_id IS NOT NULL THEN i.id
                            ELSE NULL
                        END
                    ) > 0'
                );

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
        $user = $request->user();

        DB::transaction(function () use ($validated, $user) {
            // $stocks = [];

            foreach ($validated['rfid_tags'] as $rfidId) {
                $item = Item::where('rfid_tag_id', $rfidId)->firstOrFail();
                // $item->update(['rfid_installed_by' => $user->id]);

                // Simpan Stock
                // $stocks[] = [
                //     'warehouse_id' => $validated['warehouse_id'],
                //     'item_id' => $item->id,
                // ];
            }

            // WarehouseStock::insert($stocks);
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
                    ->whereNull('current_condition_id') // Hanya yang belum QC
                    ->whereNull('status') // Hanya yang belum QC
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

        return response()->json($allAvailable);
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
        try {
            $items = $this->generateRFIDTagItems($request)->getData();

            $product = Product::findOrFail($request->product_id);

            $pdf = new \FPDF('P','mm','A4');
            $pdf->AddPage();
            $pageWidth = $pdf->GetPageWidth();
            $pageHeight = $pdf->GetPageHeight();

            $qrSize = 20;
            $cols = 3;
            $cellHeight = 25;
            $cellWidth = $pageWidth / $cols;

            $x = 6;
            $y = 10;

            foreach ($items as $i => $item) {
                $rfid_tag_id = $item->rfid_tag_id;

                // Generate QR ke binary string PNG
                $options = new QROptions([
                    'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                    'eccLevel'   => QRCode::ECC_L,
                    'scale'      => 3,
                    'imageBase64' => false,
                ]);
                $qrcode = (new QRCode($options))->render($rfid_tag_id);
                if (!$qrcode) {
                    throw new \Exception("Gagal generate QR untuk $rfid_tag_id");
                }
                // Simpan ke file sementara dengan ekstensi .png
                $tempFile = storage_path("app/tmp/".md5($rfid_tag_id).".png");
                if (!file_exists(dirname($tempFile))) {
                    mkdir(dirname($tempFile), 0777, true);
                }
                file_put_contents($tempFile, $qrcode);

                // Masukkan QR ke PDF
                $pdf->Image($tempFile, $x, $y, $qrSize, $qrSize);

                // Text di bawah
                $pdf->SetFont('Arial','',7);
                $pdf->Text($x+2, $y+$qrSize+1, $rfid_tag_id);

                // Mulai tulis teks di kanan QR
                $pdf->SetXY($x + $qrSize , $y+2);

                // Wrap product name max 50mm
                $pdf->MultiCell(50, 3, $product->name, 0, 'L');

                //  product code
                $pdf->SetX($x + $qrSize);
                $pdf->MultiCell(40, 4, "Code: ".$product->code, 0, 'L');

                // Posisi kolom
                if ((($i+1) % $cols) == 0) {
                    $x = 6;
                    $y += $cellHeight;
                } else {
                    $x += $cellWidth;
                }

                // Page break
                if ($y + $cellHeight > $pageHeight - 10) {
                    $pdf->AddPage();
                    $x = 6;
                    $y = 10;
                }

                // Hapus file sementara
                @unlink($tempFile);
            }

            return response($pdf->Output('S'))
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="'.$product->name.'-rfid-qrcodes.pdf"');

        } catch (\Throwable $e) {
            \Log::error($e);
            // Kirim error ke frontend
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate PDF',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}
