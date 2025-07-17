<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NavigationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
	Route::get('/user', [UserController::class, 'getUser']);
	Route::post('/logout', [AuthController::class, 'logout']);

		/*
	|--------------------------------------------------------------------------
	| Options Management Routes
	|--------------------------------------------------------------------------
	*/
	Route::prefix('options')->group(function () {
		// media date folder
		Route::get('/dates', [MediaController::class, 'dateFolder']);
		// navigation-related routes
		Route::get('/navigations', [NavigationController::class, 'getNavigations']);  // Retrieve all categories for dropdown
		Route::get('/navigations/{id}', [NavigationController::class, 'getSubNavigations']);  // Retrieve subcategories for a specific category		
		Route::get('/routes', [NavigationController::class, 'getRoutes']);  // Retrieve all routes
		Route::get('/roles', [RoleController::class, 'getRoles']);  // Retrieve all routes
	});

	// User Management Routes
	Route::prefix('user-management')->group(function () {
		Route::prefix('users')->group(function () {
			Route::get('/', [UserController::class, 'index']);
			Route::get('/{id}', [UserController::class, 'show']);
			Route::post('/', [UserController::class, 'store']);
			Route::put('/{id}', [UserController::class, 'update']);
			Route::delete('/{id}', [UserController::class, 'destroy']);
			Route::post('/bulk/delete', [UserController::class, 'bulkDelete']);
			Route::post('/bulk/restore', [UserController::class, 'bulkRestore']);
			Route::post('/bulk/force-delete', [UserController::class, 'bulkForceDelete']);
			Route::post('/bulk/role', [UserController::class, 'bulkChangeRole']);
		});
		Route::prefix('archived/users')->group(function () {
			Route::get('/', [UserController::class, 'getTrashed']);
			Route::patch('/restore/{id}', [UserController::class, 'restore']);
			Route::delete('/{id}', [UserController::class, 'forceDelete']);
		});
		Route::prefix('roles')->group(function () {
			Route::get('/', [RoleController::class, 'index']);
			Route::get('/{id}', [RoleController::class, 'show']);
			Route::post('/', [RoleController::class, 'store']);
			Route::put('/{id}', [RoleController::class, 'update']);
			Route::delete('/{id}', [RoleController::class, 'destroy']);
			Route::post('/bulk/delete', [RoleController::class, 'bulkDelete']);
			Route::post('/bulk/restore', [RoleController::class, 'bulkRestore']);
			Route::post('/bulk/force-delete', [RoleController::class, 'bulkForceDelete']);
			Route::post('/bulk/role', [RoleController::class, 'bulkChangeRole']);
		});
		Route::prefix('archived/roles')->group(function () {
			Route::get('/', [RoleController::class, 'getTrashed']);
			Route::patch('/restore/{id}', [RoleController::class, 'restore']);
			Route::delete('/{id}', [RoleController::class, 'forceDelete']);
		});
	});

	// Content Management Routes
	Route::prefix('content-management')->group(function () {
		Route::apiResource('/media-library', MediaController::class);
		Route::post('/media-library/bulk/delete', [MediaController::class, 'bulkDelete']);
	});

	// System Settings Routes
	Route::prefix('system-settings')->group(function () {
		Route::prefix('navigation')->group(function () {
			Route::get('/', [NavigationController::class, 'index']);
			Route::get('/{id}', [NavigationController::class, 'show']);
			Route::post('/', [NavigationController::class, 'store']);
			Route::put('/{id}', [NavigationController::class, 'update']);
			Route::delete('/{id}', [NavigationController::class, 'destroy']);
			Route::post('/bulk/delete', [NavigationController::class, 'bulkDelete']);
			Route::post('/bulk/restore', [NavigationController::class, 'bulkRestore']);
			Route::post('/bulk/force-delete', [NavigationController::class, 'bulkForceDelete']);
			Route::post('/bulk/role', [NavigationController::class, 'bulkChangeRole']);
		});
		Route::prefix('archived/navigation')->group(function () {
			Route::get('/', [NavigationController::class, 'getTrashed']);
			Route::patch('/restore/{id}', [NavigationController::class, 'restore']);
			Route::delete('/{id}', [NavigationController::class, 'forceDelete']);
		});
	});

	// PROFILE ROUTES
	Route::post('/profile', [UserController::class, 'updateProfile']);
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/validate', [AuthController::class, 'activateUser']);
Route::post('/generate-password', [AuthController::class, 'genTempPassword']);
Route::post('/login', [AuthController::class, 'login']);