<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class LocationApiController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type');
        $parentId = $request->input('parent_id');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;

        $data = Location::query()
            ->when($type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($parentId, function ($query, $parentId) {
                return $query->where('location_parent_id', $parentId);
            })
            ->offset($offset)
            ->limit(30)
            ->get();

        return Response::json($data);
    }
}