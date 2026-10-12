<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * List all users (admin only).
     */
    public function index(Request $request)
    {
        $users = User::with('role')
            ->when($request->role, fn($q) => $q->whereHas('role', fn($r) => $r->where('name', $request->role)))
            ->when($request->search, fn($q) => $q->where(fn($r) =>
                $r->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('email', 'like', '%'.$request->search.'%')
            ))
            ->get();

        return response()->json($users);
    }

    /**
     * Create a user (admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users',
            'password'      => 'required|string|min:8',
            'role_id'       => 'required|exists:roles,id',
            'phone'         => 'nullable|string|max:20',
            'address'       => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'parent_id'     => 'nullable|exists:users,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json($user->load('role'), 201);
    }

    /**
     * Show a single user.
     */
    public function show(Request $request, User $user)
    {
        $authUser = $request->user()->loadMissing('role');

        // Only admin or the user themselves (or their parent) may view
        if (! $authUser->isAdmin()
            && $authUser->id !== $user->id
            && $user->parent_id !== $authUser->id
        ) {
            abort(403);
        }

        return response()->json($user->load(['role', 'parent', 'children', 'enrollments.course.category']));
    }

    /**
     * Update a user (admin can update anyone; users update themselves only).
     */
    public function update(Request $request, User $user)
    {
        $authUser = $request->user()->loadMissing('role');

        if (! $authUser->isAdmin() && $authUser->id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'email'         => 'sometimes|required|email|unique:users,email,'.$user->id,
            'password'      => 'nullable|string|min:8',
            'role_id'       => 'sometimes|exists:roles,id',  // only admin should change role
            'phone'         => 'nullable|string|max:20',
            'address'       => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'parent_id'     => 'nullable|exists:users,id',
        ]);

        // Non-admins may not change their own role or parent link
        if (! $authUser->isAdmin()) {
            unset($validated['role_id'], $validated['parent_id']);
        } elseif (isset($validated['role_id']) && $authUser->id === $user->id
            && $validated['role_id'] != $user->role_id) {
            return response()->json(['message' => 'You cannot change your own role.'], 422);
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->load('role'));
    }

    /**
     * Delete a user (admin only).
     */
    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
