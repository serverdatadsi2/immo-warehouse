<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
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
            ->whereNull('users.deleted_at')
            ->whereIn('wu.warehouse_id', $warehouseUserIds)
            ->when($search, function ($query, $search) {
                return $query->where('name', 'ILIKE', "%{$search}%");
            })
            ->offset($offset)
            ->limit(30)->get();

        return response()->json($data);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $pagination = User::with(['roles', 'warehouses'])
            ->whereNull('deleted_at')
            ->where('wms_access', true)
            ->orderBy('name')
            ->simplePaginate(10)
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first(),
                    'warehouse' => $user->warehouses->first(),
                    'created_at' => $user->created_at,
                ];
            });


        return Inertia::render('system/users/index', [
            'pagination' => $pagination
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // $user->delete();
        User::where('id', $user->id)->update([
            'deleted_at' => now(),
        ]);

        return redirect()->route('system.users.index')->with('message', 'User deleted successfully.');
    }

    public function save(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($request->id),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($request->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'exists:db-auth.roles,name'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
        ]);

        \DB::transaction(function () use ($validated) {
            // 🔁 Buat atau update user
            $user = User::updateOrCreate(
        ['id' => $validated['id'] ?? null],
                    array_merge(
                        [
                            'name' => $validated['name'],
                            'username' => $validated['username'],
                            'email' => $validated['email'],
                            'wms_access' => $validated['warehouse_id'] ? true : false,
                        ],
                        // Tambahkan password hanya saat create
                        empty($validated['id']) && !empty($validated['password'])
                            ? ['password' => \Hash::make($validated['password'])]
                            : []
                    )
            );

            // 🔐 Update password hanya kalau diisi
            if (!empty($validated['password'])) {
                $user->update([
                    'password' => \Hash::make($validated['password']),
                ]);
            }

            // 🎭 Sinkronisasi roles
            if (!empty($validated['role'])) {
                $user->syncRoles($validated['role']);
            } else {
                $user->roles()->detach();
            }

            // 🏢 Sinkronisasi warehouses
            if (!empty($validated['warehouse_id'])) {
                $user->warehouses()->sync($validated['warehouse_id']);
            } else {
                $user->warehouses()->detach();
            }
        });

        return to_route('system.users.index');
    }
}
