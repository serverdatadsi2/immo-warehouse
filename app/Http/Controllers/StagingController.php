<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\Item;
use App\Models\Location;
use App\Models\StoreOrder;
use App\Models\WarehouseOutbound;
use App\Models\WarehouseOutboundDetail;
use App\Models\WarehouseStagingOutbound;
use App\Models\WarehouseStagingOutboundDetail;
use App\Models\WarehouseStock;
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
                'warehouse:id,name,code,address',
                'detail.outbound:id,order_ref,order_number,delivery_order_number,courier_id',
                'detail.outbound.courier:id,name',
            ])
            ->when($search, fn($q) => $q->where('p.name', 'ILIKE', '%' . $search . '%'))
            ->when($status, function ($q, $status) {
                if($status==='relesed') $q->whereNotNull('released_at');
                else $q->whereNull('released_at');
            })
            // ->unless($status, fn ($q) => $q->whereNull('released_at'))
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
            'warehouse:id,name,code,address',
        ])
        ->where('id', $headerId)
        ->first();

        $pagination = WarehouseStagingOutboundDetail::with([
                        'outbound:id,order_ref,order_number,delivery_order_number,courier_id',
                        'outbound.courier:id,name'
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
            'warehouse_outbound_id' => ['string', 'required', 'exists:warehouse_outbounds,id'],
            'warehouse_staging_outbound_id' => ['string', 'required', 'exists:warehouse_staging_outbounds,id']
        ]);

        $header = WarehouseStagingOutboundDetail::newModelInstance();
        \DB::transaction(function () use ($validated, &$header) {

            $detail = WarehouseStagingOutboundDetail::firstOrCreate(
                [
                    'warehouse_outbound_id' => $validated['warehouse_outbound_id'],
                    'warehouse_staging_outbound_id' => $validated['warehouse_staging_outbound_id'],
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

    public function release(Request $request, $stagingId)
    {
        $outboundIds = WarehouseStagingOutboundDetail::where('warehouse_staging_outbound_id', $stagingId)
                    ->pluck('warehouse_outbound_id')
                    ->toArray();

        \DB::transaction(function () use ($outboundIds, $stagingId) {
            WarehouseStagingOutbound::find($stagingId)->update(['released_at' => now()]);
            $outbounds = WarehouseOutbound::query()->whereIn('id', $outboundIds)
                        ->select('order_ref', 'order_id')
                        ->get();

            $groupedOutbounds = $outbounds->groupBy('order_ref');

            $ecommerceOrderIds = $groupedOutbounds->get('ecommerce', collect())->pluck('order_id')->toArray();
            $storeOrderIds = $groupedOutbounds->get('store', collect())->pluck('order_id')->toArray();

            if (!empty($storeOrderIds)) {
                StoreOrder::whereIn('id', $storeOrderIds)->update(['status' => 'shipped']);
            }

            if (!empty($ecommerceOrderIds)) {
                EcommerceOrder::whereIn('id', $ecommerceOrderIds)->update(['status' => 'shipped']);
            }

            WarehouseOutbound::whereIn('id', $outboundIds)->update(['released_at' => now()]);

            $itemIds = WarehouseOutboundDetail::whereIn('warehouse_outbound_id', $outboundIds)->pluck('item_id')->toArray();
            Item::whereIn('id', $itemIds)->update(['status' => 'in_delivery']);
            WarehouseStock::whereIn('item_id', $itemIds)->delete();
        });

        return to_route('staging.index');
    }
}
