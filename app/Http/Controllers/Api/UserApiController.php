<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class UserApiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;

        $data = User::query()
            ->when($search, function ($query, $search) {
                return $query->where('name', 'ILIKE', "%{$search}%");
            })
            ->offset($offset)
            ->limit(30)->get();

        return Response::json($data);
    }

    public function show(string $id)
    {
        $data = User::find($id);
        return Response::json($data);
    }
}
