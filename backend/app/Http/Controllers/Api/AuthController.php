<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|unique:users',
            'password'      => 'required|string|min:8|confirmed',
            'role'          => 'required|in:student,parent',
            'phone'         => 'nullable|string|max:20',
            'address'       => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'parent_id'     => ['nullable', \Illuminate\Validation\Rule::exists('users', 'id')->where(
                fn ($q) => $q->whereIn('role_id', Role::where('name', 'parent')->pluck('id'))
            )],
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();

        $user = User::create([
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'password'      => Hash::make($validated['password']),
            'role_id'       => $role->id,
            'phone'         => $validated['phone'] ?? null,
            'address'       => $validated['address'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'parent_id'     => $role->name === 'student' ? ($validated['parent_id'] ?? null) : null,
        ]);

        $user->load('role');
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Log in and return an API token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->with('role')->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /**
     * Log out (revoke current token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Return the authenticated user profile.
     */
    public function me(Request $request)
    {
        return response()->json($request->user()->load(['role', 'parent', 'children']));
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'phone'         => 'nullable|string|max:20',
            'address'       => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'password'      => 'nullable|string|min:8|confirmed',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->load('role'));
    }

    /**
     * Return all roles (for registration form).
     */
    public function roles()
    {
        return response()->json(Role::whereIn('name', ['student', 'parent'])->get());
    }

    /**
     * Minimal list of parents for the registration form (id + name only).
     */
    public function parents()
    {
        $ids = Role::where('name', 'parent')->pluck('id');

        return response()->json(User::whereIn('role_id', $ids)->orderBy('name')->get(['id', 'name']));
    }
}
