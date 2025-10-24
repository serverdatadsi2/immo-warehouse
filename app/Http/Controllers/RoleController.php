<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function roleList(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page');
        $offset = ($page - 1) * 30;

        $data = Role::query()
            ->when($search, fn($q, $search) =>
                $q->where('name', 'ILIKE', "%{$search}%")
            )
            ->offset($offset)
            ->limit(30)->get();

            return response()->json($data);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $pagination = Role::with('permissions')
            ->orderBy('name')
            ->simplePaginate(10)
            ->through(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'created_at' => $role->created_at,
                ];
            });

        return Inertia::render('system/roles/index', [
            'pagination' => $pagination
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $permissions = Permission::orderBy('id')->get();

        return Inertia::render('system/roles/components/form', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role): Response
    {
        $role->load('permissions');
        $permissions = Permission::orderBy('id')->get();

        return Inertia::render('system/roles/components/form', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();

        return to_route('system.roles.index');
    }

    public function save(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['nullable', 'exists:db-auth.roles,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('db-auth.roles', 'name')->ignore($request->id),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:db-auth.permissions,name'],
        ]);


        \DB::transaction(function () use ($validated) {
            // Jika ada ID → update, jika tidak → create
            $role = Role::updateOrCreate(
                ['id' => $validated['id'] ?? null],
                [
                    'name' => $validated['name'],
                    'guard_name' => 'web',
                ]
            );

            // Sinkronisasi permissions
            $role->syncPermissions($validated['permissions'] ?? []);
        });

        return to_route('system.roles.index');
    }
}
