<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class CourierApiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;

        $data = Courier::query()
            ->when($search, function ($query, $search) {
                return $query->where('name', 'ILIKE', "%{$search}%");
            })
            ->whereNull('deleted_at')
            ->where('status', 'active')
            ->offset($offset)
            ->limit(30)
            ->get();

        return Response::json($data);
    }

    public function show(string $id)
    {
        $data = Courier::find($id);
        return Response::json($data);
    }
}
