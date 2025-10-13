<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\WarehouseStagingOutbound;
use App\Models\WarehouseStagingOutboundDetail;
use Illuminate\Http\Request;

class StagingController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status']);
        $search = $filters['search'] ?? '';
        $status = $filters['status'] ?? '';

        $paginations = WarehouseStagingOutbound::query()
            ->with([
                'detail',
                'warehouse' => function ($query) {
                    $query->select('id', 'name', 'code', 'address');
                },
                'detail.product' => function ($query) {
                    $query->select('id', 'name', 'code');
                },
                'detail.rfid' => function ($query) {
                    $query->select('id', 'value');
                },
            ])
            ->when($search, fn($q) => $q->where('p.name', 'ILIKE', '%' . $search . '%'))
            ->when($status, function ($q, $status) {
                if($status==='relesed') $q->whereNotNull('released_at');
                else $q->whereNull('released_at');
            })
            ->unless($status, fn ($q) => $q->whereNull('released_at'))
            ->orderBy('created_at', 'desc')
            ->simplePaginate(10);

        return inertia('staging/index', [
            'pagination' => $paginations,
            'params' => $filters
        ]);
    }

    public function deleteDetail(string $detailId)
    {
        $headerId = null;
        $detailStaging = WarehouseStagingOutbound::where('id', $detailId)->whereNotNull('released_at')->first();
        if ($detailStaging) {
            return redirect()->back()->withErrors(['error'=> 'Detail tidak bisa dihapus karena detail staging sudah released']);
        }
        \DB::transaction(function () use (&$headerId, $detailId) {
            $detail = WarehouseStagingOutboundDetail::findOrFail($detailId);
            $headerId = $detail->warehouse_staging_outbound_id;
            $detail->delete();
            $header = WarehouseStagingOutbound::findOrFail($headerId);

            $result = WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $header->id)
                ->selectRaw('COUNT(*) as grand_total')
                ->first();

            $header->update([
                'quantity'   => $result->grand_total,
            ]);
        });

        return to_route('staging.index', ['header_id' => $headerId]);
    }

    public function detail (Request $request) {
        $headerId = $request->input('header');

        $header = WarehouseStagingOutbound::query()
        ->with([
            'warehouse' => function ($query) {
                $query->select('id', 'name', 'code', 'address');
            },
        ])
        ->where('id', $headerId)
        ->first();

        $pagination = WarehouseStagingOutboundDetail::with([
             'product' => function ($query) {
                $query->select('id', 'name', 'code');
            },
            'rfid' => function ($query) {
                $query->select('id', 'value');
            },
            ])
            ->where('warehouse_staging_outbound_id', $headerId)
            ->simplePaginate(10);

        return inertia('staging/detail',[
            'headerData' => $header,
            'detailPagination' =>$pagination,
            'header' => $headerId
        ]);
    }

    public function saveHeader(Request $request)
    {
        $validated = $request->validate(['location_rfid_tag_id' => ['string', 'required', 'exists:location_rfid_tags,id']]);

        $location = Location::query()
                    ->join('location_rfid_tag as lrg','lrg.location_id', '=', 'locations.id')
                    ->join('warehouse_locatins as wl','wl.location_id', '=', 'locations.id')
                    ->where('lrg.value',$validated)
                    ->select('location.*', 'wl.warehouse_id')
                    ->first();

        $header = WarehouseStagingOutbound::newModelInstance();
        \DB::transaction(function () use ($request, $location, &$header) {
            if ($request->id) {
                $header = WarehouseStagingOutbound::updateOrCreate(
                    ['id' => $request->id],
                    [
                        'name' => $location->name,
                        'warehouse' => $location->warehouse_id
                    ]
                );
            } else {
                $header = WarehouseStagingOutbound::create([
                        'name' => $location->name,
                        'warehouse' => $location->warehouse_id
                    ]);
            }

            $result = WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $header->id)
                ->selectRaw('COUNT(*) as grand_total')
                ->first();

            $header->update([
                'quantity'   => $result->grand_total,
            ]);
        });

        return to_route('staging.detail', ['header_id' => $header->id]);
    }
}
