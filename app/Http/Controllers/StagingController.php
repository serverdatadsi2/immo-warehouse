<?php

namespace App\Http\Controllers;

use App\Models\Item;
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
            return redirect()->back()->withErrors(['error'=> 'Detail tidak bisa dihapus karena data staging sudah released']);
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

        return to_route('staging.detail', ['header' => $headerId]);
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
        $validated = $request->validate(['location_rfid_tag_id' => ['string', 'required', 'exists:location_rfid_tags,value']]);

        $location = Location::query()
                    ->join('location_rfid_tags as lrg', function ($join) {
                        $join->on('lrg.location_id', '=', 'locations.id')
                            ->whereNull('lrg.deleted_at');
                    })
                    ->join('warehouse_locations as wl','wl.location_id', '=', 'locations.id')
                    ->where('lrg.value',$validated)
                    ->select('locations.*', 'wl.warehouse_id', 'lrg.id as location_staging_id')
                    ->first();

        $header = WarehouseStagingOutbound::newModelInstance();
        \DB::transaction(function () use ( $location, &$header) {

            $header = WarehouseStagingOutbound::create([
                'name' => $location->name,
                'warehouse_id' => $location->warehouse_id,
                'location_rfid_tag_id' =>$location->location_staging_id
            ]);

            $result = WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $header->id)
                ->selectRaw('COUNT(*) as grand_total')
                ->first();

            $header->update([
                'quantity'   => $result->grand_total,
            ]);
        });

        return to_route('staging.detail', ['header' => $header->id]);
    }

    public function saveDetail(Request $request)
    {
        $validated = $request->validate([
            'rfid' => ['string', 'required', 'exists:rfid_tags,value'],
            'warehouse_staging_outbound_id' => ['string', 'required', 'exists:warehouse_staging_outbounds,id']
        ]);

        $item = Item::with([
            'rfidTag' => function ($query) use ($validated) {
                $query->select('id', 'value');
            }
        ])
        ->whereHas('rfidTag', function ($query) use ($validated) {
            $query->where('value', $validated['rfid']);
        })->first();

        $header = WarehouseStagingOutboundDetail::newModelInstance();
        \DB::transaction(function () use ($validated, $item, &$header) {

            $detail = WarehouseStagingOutboundDetail::firstOrCreate(
                [
                    'rfid_tag_id' => $item->rfidTag->id,
                    'warehouse_staging_outbound_id' => $validated['warehouse_staging_outbound_id'],
                ],
                [
                    'item_id' => $item->id,
                    'product_id' => $item->product_id,
                ]);

            $header = WarehouseStagingOutbound::findOrFail($detail->warehouse_staging_outbound_id);


            $result = WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $header->id)
                ->selectRaw('COUNT(*) as grand_total')
                ->first();

            $header->update([
                'quantity'   => $result->grand_total,
            ]);
        });

        return to_route('staging.detail', ['header' => $header->id]);
    }

     public function deleteHeader(string $headerId)
    {
        $detailStaging = WarehouseStagingOutbound::where('id', $headerId)->whereNotNull('released_at')->first();
        if ($detailStaging) {
            return redirect()->back()->withErrors(['error'=> 'Detail tidak bisa dihapus karena data staging sudah released']);
        }
        \DB::transaction(function () use ($headerId) {
            $header = WarehouseStagingOutbound::findOrFail($headerId);
            WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $header->id)->delete();
            $header->delete();


        });

        return to_route('staging.index');
    }
}
