<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ItemCondition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ConditionApiController extends Controller
{
    public function index(Request $request)
    {
        // $search = $request->input('search');
        // $page = $request->input('page');
        // $offset = ($page - 1) * 30;

        $data = ItemCondition::query()
            // ->when($search, function ($query, $search) {
            //     return $query->where('name', 'ILIKE', "%{$search}%");
            // })
            // ->offset($offset)
            // ->limit(30)
            ->get();

        return Response::json($data);
    }

    public function show(string $id)
    {
        $data = ItemCondition::find($id);
        return Response::json($data);
    }
}
