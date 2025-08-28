<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NavigationController;
use App\Http\Controllers\Api\AuditTrailController;
use App\Http\Controllers\Api\VIPController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\PromoterController;
use App\Http\Controllers\Api\SalesReportController;
use App\Http\Controllers\Api\CashierTransactionController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\ScanController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PrintController;

// Note: Swagger documentation is available at /docs (handled by L5-Swagger)
// API documentation JSON is available at /docs (L5-Swagger route)

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

// Public Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/activate', [AuthController::class, 'activateUser']);
    Route::post('/forgot-password', [AuthController::class, 'genTempPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
	// Validate password for current authenticated user
	Route::post('/validate-password', [AuthController::class, 'validatePassword']);
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
		// users for dropdowns
		Route::get('/users', [UserController::class, 'getUsersForDropdown']);
		// promoters for dropdowns
		Route::get('/promoters', [PromoterController::class, 'getPromotersForDropdown']);
		// rates for dropdowns
		Route::get('/rates', [RateController::class, 'getRatesForDropdown']);
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
		Route::prefix('audit-trail')->group(function () {
			Route::get('/', [AuditTrailController::class, 'index']);
			Route::post('/export', [AuditTrailController::class, 'export']);
			Route::get('/logs/{date?}', [AuditTrailController::class, 'downloadLogFile']);
			Route::get('/modules', [AuditTrailController::class, 'getModules']);
			Route::get('/actions', [AuditTrailController::class, 'getActions']);
			Route::get('/stats', [AuditTrailController::class, 'getStats']);
		});
	});

	// PROFILE ROUTES
	Route::post('/profile', [UserController::class, 'updateProfile']);

	// VIP Management Routes
	Route::prefix('vip-management')->group(function () {
		Route::prefix('vips')->group(function () {
			Route::get('/', [VIPController::class, 'index']);
			Route::get('/expiring', [VIPController::class, 'expiring']);
			Route::get('/{id}', [VIPController::class, 'show'])->where('id', '[0-9]+');
			Route::post('/', [VIPController::class, 'store']);
			Route::put('/{id}', [VIPController::class, 'update'])->where('id', '[0-9]+');
			Route::delete('/{id}', [VIPController::class, 'destroy'])->where('id', '[0-9]+');
			Route::post('/bulk/delete', [VIPController::class, 'bulkDelete']);
			Route::post('/bulk/restore', [VIPController::class, 'bulkRestore']);
			Route::post('/bulk/force-delete', [VIPController::class, 'bulkForceDelete']);
		});
		Route::prefix('archived/vips')->group(function () {
			Route::get('/', [VIPController::class, 'getTrashed']);
			Route::patch('/restore/{id}', [VIPController::class, 'restore']);
			Route::delete('/{id}', [VIPController::class, 'forceDelete']);
		});
	});

	// Rate Management Routes
	Route::prefix('rate-management')->group(function () {
		Route::prefix('rates')->group(function () {
			Route::get('/', [RateController::class, 'index']);
			Route::get('/{id}', [RateController::class, 'show'])->where('id', '[0-9]+');
			Route::post('/', [RateController::class, 'store']);
			Route::put('/{id}', [RateController::class, 'update'])->where('id', '[0-9]+');
			Route::delete('/{id}', [RateController::class, 'destroy'])->where('id', '[0-9]+');
			Route::post('/bulk/delete', [RateController::class, 'bulkDelete']);
			Route::post('/bulk/restore', [RateController::class, 'bulkRestore']);
			Route::post('/bulk/force-delete', [RateController::class, 'bulkForceDelete']);
			Route::get('/dropdown', [RateController::class, 'dropdown']);
		});
		Route::prefix('archived/rates')->group(function () {
			Route::get('/', [RateController::class, 'getTrashed']);
			Route::patch('/restore/{id}', [RateController::class, 'restore']);
			Route::delete('/{id}', [RateController::class, 'forceDelete']);
		});
		Route::prefix('discounts')->group(function () {
			Route::get('/', [DiscountController::class, 'index']);
			Route::get('/{id}', [DiscountController::class, 'show'])->where('id', '[0-9]+');
			Route::post('/', [DiscountController::class, 'store']);
			Route::put('/{id}', [DiscountController::class, 'update'])->where('id', '[0-9]+');
			Route::delete('/{id}', [DiscountController::class, 'destroy'])->where('id', '[0-9]+');
			Route::post('/bulk/delete', [DiscountController::class, 'bulkDelete']);
			Route::post('/bulk/restore', [DiscountController::class, 'bulkRestore']);
			Route::post('/bulk/force-delete', [DiscountController::class, 'bulkForceDelete']);
		});
		Route::prefix('archived/discounts')->group(function () {
			Route::get('/', [DiscountController::class, 'getTrashed']);
			Route::patch('/restore/{id}', [DiscountController::class, 'restore']);
			Route::delete('/{id}', [DiscountController::class, 'forceDelete']);
		});
	});

	// Promoter Management Routes
	Route::prefix('promoter-management')->group(function () {
		Route::prefix('promoters')->group(function () {
			Route::get('/', [PromoterController::class, 'index']);
			Route::get('/{id}', [PromoterController::class, 'show'])->where('id', '[0-9]+');
			Route::post('/', [PromoterController::class, 'store']);
			Route::put('/{id}', [PromoterController::class, 'update'])->where('id', '[0-9]+');
			Route::delete('/{id}', [PromoterController::class, 'destroy'])->where('id', '[0-9]+');
			Route::post('/schedule', [PromoterController::class, 'schedule']);
			Route::post('/manual-update', [PromoterController::class, 'manualUpdate']);
			Route::post('/bulk/delete', [PromoterController::class, 'bulkDelete']);
			Route::post('/bulk/restore', [PromoterController::class, 'bulkRestore']);
			Route::post('/bulk/force-delete', [PromoterController::class, 'bulkForceDelete']);
			Route::get('/of-the-day', [PromoterController::class, 'getPromoterOfTheDay']);
		});
		Route::prefix('archived/promoters')->group(function () {
			Route::get('/', [PromoterController::class, 'getTrashed']);
			Route::patch('/restore/{id}', [PromoterController::class, 'restore']);
			Route::delete('/{id}', [PromoterController::class, 'forceDelete']);
		});
	});

	// Sales Reports Routes
	Route::prefix('reports')->group(function () {
		Route::get('/sales', [SalesReportController::class, 'index']);
		Route::post('/sales/export', [SalesReportController::class, 'export']);
		Route::get('/sales/statistics', [SalesReportController::class, 'statistics']);
	});

	// Cashier Routes
	Route::prefix('cashier')->group(function () {
		Route::post('/open-session', [CashierController::class, 'openSession']);
		Route::post('/close-session', [CashierController::class, 'closeSession']);
		Route::post('/transactions', [CashierController::class, 'storeTransaction']);
		Route::get('/tickets/{transactionId}', [CashierController::class, 'tickets']);
		Route::get('/transactions/daily', [CashierController::class, 'getDailyTransactions']);
		Route::get('/transactions/today', [CashierController::class, 'getTodayTransactions']);
		Route::get('/sessions/{id}', [CashierController::class, 'getSession']);
		Route::post('/send-to-display', [CashierController::class, 'sendToDisplay']);
	});

	// Dashboard Routes
	Route::prefix('dashboard')->group(function () {
		Route::get('/statistics', [DashboardController::class, 'statistics']);
		Route::get('/cashier-performance', [DashboardController::class, 'cashierPerformance']);
		Route::get('/today-summary', [DashboardController::class, 'todaySummary']);
	});

	// Print Routes
	Route::prefix('print')->group(function () {
		Route::post('/open-cash', [PrintController::class, 'printOpenCash']);
		Route::post('/transaction', [PrintController::class, 'printTransaction']);
	});
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/validate', [AuthController::class, 'activateUser']);
Route::post('/generate-password', [AuthController::class, 'genTempPassword']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/access/validate', [ScanController::class, 'store']);
Route::get('/access/latest', [ScanController::class, 'showLatest']);
