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

        return Inertia::render('roles/index', [
            'pagination' => $pagination
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('roles/components/form', [
            'permissions' => $permissions,
        ]);
    }

    // /**
    //  * Store a newly created resource in storage.
    //  */
    // public function store(Request $request): RedirectResponse
    // {
    //     $request->validate([
    //         'name' => 'required|string|max:255|unique:db-auth.roles,name',
    //         'permissions' => 'array',
    //         'permissions.*' => 'exists:db-auth.permissions,name',
    //     ]);

    //     $role = Role::create([
    //         'name' => $request->name,
    //         'guard_name' => 'web',
    //     ]);

    //     if ($request->permissions) {
    //         $role->syncPermissions($request->permissions);
    //     }

    //     return redirect()->route('roles.index')->with('message', 'Role created successfully.');
    // }

    /**
     * Display the specified resource.
     */
    public function show(Role $role): Response
    {
        return Inertia::render('roles/show', [
            'role' => $role->load('permissions')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role): Response
    {
        $role->load('permissions');
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('roles/components/form', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    // /**
    //  * Update the specified resource in storage.
    //  */
    // public function update(Request $request, Role $role): RedirectResponse
    // {
    //     $request->validate([
    //         'name' => 'required|string|max:255|unique:db-auth.roles,name,' . $role->id,
    //         'permissions' => 'array',
    //         'permissions.*' => 'exists:db-auth.permissions,name',
    //     ]);

    //     $role->update([
    //         'name' => $request->name,
    //         'guard_name' => 'web',
    //     ]);

    //     if ($request->permissions) {
    //         $role->syncPermissions($request->permissions);
    //     } else {
    //         $role->permissions()->detach();
    //     }

    //     return redirect()->route('roles.index')->with('message', 'Role updated successfully.');
    // }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();

        return to_route('roles.index');
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

        return to_route('roles.index');
    }
}
