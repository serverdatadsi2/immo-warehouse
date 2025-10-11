<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;

        $user = auth()->user();
        $warehouseUserIds = $user->warehouses()->pluck('warehouses.id');

        $data = User::query()
            ->join('warehouse_users as wu', 'wu.user_id', '=', 'users.id')
            ->where('wms_access', true)
            ->whereIn('wu.warehouse_id', $warehouseUserIds)
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
