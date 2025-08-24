<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PromoterRequest;
use App\Http\Requests\PromoterScheduleRequest;
use App\Http\Resources\PromoterResource;
use App\Services\PromoterService;
use Illuminate\Http\Request;
use App\Services\MessageService;
use App\Models\Promoter;
use App\Models\PromoterSchedule;
use App\Traits\Auditable;

class PromoterController extends BaseController
{
    use Auditable;

    	public function __construct(PromoterService $service, MessageService $messageService)
    {
        parent::__construct($service, $messageService);
    }

    /**
     * Display a listing of promoters.
     * 
     * @OA\Get(
     *     path="/api/promoter-management/promoters",
     *     summary="Get list of promoters",
     *     tags={"Promoter Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=10)
     *     ),
     *     @OA\Parameter(
     *         name="order",
     *         in="query",
     *         description="Order by field",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort",
     *         in="query",
     *         description="Sort direction (asc/desc)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc", "desc"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error"
     *     )
     * )
     */
    public function index()
    {
        return parent::index();
    }

    /**
     * Display the specified promoter.
     * 
     * @OA\Get(
     *     path="/api/promoter-management/promoters/{id}",
     *     summary="Get a specific promoter",
     *     tags={"Promoter Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Promoter ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Promoter not found"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function show($id)
    {
        return parent::show($id);
    }

    /**
     * Remove the specified promoter from storage (soft delete).
     * 
     * @OA\Delete(
     *     path="/api/promoter-management/promoters/{id}",
     *     summary="Delete a promoter (soft delete)",
     *     tags={"Promoter Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Promoter ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Promoter moved to trash",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Promoter has been moved to trash.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Promoter not found"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function destroy($id)
    {
        return parent::destroy($id);
    }

    /**
     * Store a newly created promoter in storage.
     * 
     * @OA\Post(
     *     path="/api/promoter-management/promoters",
     *     summary="Create a new promoter",
     *     tags={"Promoter Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="John Doe", description="Promoter name"),
     *             @OA\Property(property="description", type="string", example="Event promoter", description="Promoter description"),
     *             @OA\Property(property="status", type="string", example="Active", description="Promoter status")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Promoter created successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function store(PromoterRequest $request)
    {
        try {
            $data = $request->validated();
            $resource = $this->service->store($data);
            
            $this->logCreate("Created new promoter: {$data['name']}", $resource);
            
            return response($resource, 201);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function update(PromoterRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $oldData = $this->service->show($id);
            $resource = $this->service->update($data, $id);
            
            $this->logUpdate("Updated promoter: {$data['name']}", $oldData, $resource);
            
            return response($resource, 200);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function schedule(PromoterScheduleRequest $request)
    {
        try {
            $data = $request->validated();
            $schedule = $this->service->schedule($data['promoter_id'], $data['date'], $data['is_manual'] ?? false);
            
            $this->logAudit('SCHEDULE', "Scheduled promoter for date: {$data['date']}");
            
            return response()->json(['message' => 'Schedule set successfully.', 'schedule' => $schedule]);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function manualUpdate(Request $request)
    {
        try {
            $date = $request->input('date');
            $promoterId = $request->input('promoter_id');
            $schedule = $this->service->manualUpdateForDay($date, $promoterId);
            
            $this->logAudit('MANUAL_UPDATE', "Manual update for promoter on date: {$date}");
            
            return response()->json(['message' => 'Manual update set successfully.', 'schedule' => $schedule]);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function getPromoterOfTheDay(Request $request)
    {
        try {
            $date = $request->input('date', date('Y-m-d'));
            $schedule = PromoterSchedule::where('date', $date)
                ->orderByDesc('is_manual') // manual override first
                ->first();
            if ($schedule && $schedule->promoter) {
                $this->logAudit('VIEW', "Viewed promoter of the day for date: {$date}");
                return new \App\Http\Resources\PromoterResource($schedule->promoter);
            }
            return response()->json(['data' => null]);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

      /**
   * Get promoters for dropdown selection.
   * 
   * @OA\Get(
   *     path="/api/options/promoters",
   *     summary="Get active promoters for dropdown",
   *     tags={"Promoter Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Response(
   *         response=200,
   *         description="List of active promoters",
   *         @OA\JsonContent(
   *             type="array",
   *             @OA\Items(
   *                 @OA\Property(property="id", type="integer", example=1),
   *                 @OA\Property(property="name", type="string", example="John Doe"),
   *                 @OA\Property(property="label", type="string", example="John Doe")
   *             )
   *         )
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
    public function getPromotersForDropdown()
    {
        try {
            $promoters = Promoter::select('id', 'name', 'description')
                ->where('status', 1)
                ->orderBy('name')
                ->get();
            
            return response()->json($promoters);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch promoters'], 500);
        }
    }
} 