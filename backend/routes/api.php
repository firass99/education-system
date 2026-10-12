<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseCategoryController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::get('roles',     [AuthController::class, 'roles']);
    Route::get('parents',   [AuthController::class, 'parents']);
});

// Public course browsing (user resolved optionally via the bearer token)
Route::get('courses',          [CourseController::class, 'index']);
Route::get('courses/{course}', [CourseController::class, 'show']);
Route::get('categories',       [CourseCategoryController::class, 'index']);
Route::get('categories/{courseCategory}', [CourseCategoryController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::get('me',       [AuthController::class, 'me']);
        Route::put('profile',  [AuthController::class, 'updateProfile']);
    });

    Route::get('dashboard', [DashboardController::class, 'index']);

    // Users: self-view/update handled in controller, rest admin only
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::put('users/{user}', [UserController::class, 'update']);

    Route::middleware('role:admin')->group(function () {
        Route::get('users',            [UserController::class, 'index']);
        Route::post('users',           [UserController::class, 'store']);
        Route::delete('users/{user}',  [UserController::class, 'destroy']);

        Route::post('courses',               [CourseController::class, 'store']);
        Route::put('courses/{course}',       [CourseController::class, 'update']);
        Route::delete('courses/{course}',    [CourseController::class, 'destroy']);

        Route::post('categories',                         [CourseCategoryController::class, 'store']);
        Route::put('categories/{courseCategory}',         [CourseCategoryController::class, 'update']);
        Route::delete('categories/{courseCategory}',      [CourseCategoryController::class, 'destroy']);
    });

    // Enrollments (per-record authorization in controller)
    Route::apiResource('enrollments', EnrollmentController::class);
});
