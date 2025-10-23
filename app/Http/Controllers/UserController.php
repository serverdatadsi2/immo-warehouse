<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;

class UserController extends Controller
{
    public function userList(Request $request)
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

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $pagination = User::with(['roles', 'warehouses'])
            ->orderBy('name')
            ->simplePaginate(10)
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'warehouses' => $user->warehouses->pluck('name', 'id')->toArray(),
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });


        return Inertia::render('users/index', [
            'pagination' => $pagination
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $roles = Role::orderBy('name')->get();
        $warehouses = Warehouse::orderBy('name')->get();

        return Inertia::render('users/create', [
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            }),
            'warehouses' => $warehouses->map(function ($warehouse) {
                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                ];
            })
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'array',
            'roles.*' => 'exists:db-auth.roles,name',
            'warehouses' => 'array',
            'warehouses.*' => 'exists:warehouses,id',
            'ecommerce_access' => 'boolean',
            'wms_access' => 'boolean',
            'backoffice_access' => 'boolean',
            'store_access' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'ecommerce_access' => $request->ecommerce_access ?? false,
            'wms_access' => $request->wms_access ?? false,
            'backoffice_access' => $request->backoffice_access ?? false,
            'store_access' => $request->store_access ?? false,
        ]);

        if ($request->roles) {
            $user->syncRoles($request->roles);
        }

        if ($request->warehouses) {
            $user->warehouses()->sync($request->warehouses);
        }

        return redirect()->route('users.index')->with('message', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): Response
    {
        return Inertia::render('users/show', [
            'user' => $user->load(['roles', 'warehouses'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $user->load(['roles', 'warehouses']);
        $roles = Role::orderBy('name')->get();
        $warehouses = Warehouse::orderBy('name')->get();

        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            }),
            'warehouses' => $warehouses->map(function ($warehouse) {
                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                ];
            })
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'array',
            'roles.*' => 'exists:db-auth.roles,name',
            // 'warehouses' => 'array',
            // 'warehouses.*' => 'exists:warehouses,id',
            'ecommerce_access' => 'boolean',
            'wms_access' => 'boolean',
            'backoffice_access' => 'boolean',
            'store_access' => 'boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'ecommerce_access' => $request->ecommerce_access ?? false,
            'wms_access' => $request->wms_access ?? false,
            'backoffice_access' => $request->backoffice_access ?? false,
            'store_access' => $request->store_access ?? false,
        ]);

        if ($request->password) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        if ($request->roles) {
            $user->syncRoles($request->roles);
        } else {
            $user->roles()->detach();
        }

        // if ($request->warehouses) {
        //     $user->warehouses()->sync($request->warehouses);
        // } else {
        //     $user->warehouses()->detach();
        // }

        return redirect()->route('users.index')->with('message', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('users.index')->with('message', 'User deleted successfully.');
    }
}
