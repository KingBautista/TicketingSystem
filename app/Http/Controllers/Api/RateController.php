<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\RateRequest;
use App\Services\RateService;
use App\Services\MessageService;
use App\Models\Rate;
use App\Models\Discount;
use App\Http\Resources\RateResource;
use App\Http\Resources\DiscountResource;
use App\Traits\Auditable;

class RateController extends BaseController
{
    use Auditable;

    	public function __construct(RateService $rateService, MessageService $messageService)
    {
        parent::__construct($rateService, $messageService);
    }

    /**
     * Display a listing of rates.
     * 
     * @OA\Get(
     *     path="/api/rate-management/rates",
     *     summary="Get list of rates",
     *     tags={"Rate Management"},
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
     * Display the specified rate.
     * 
     * @OA\Get(
     *     path="/api/rate-management/rates/{id}",
     *     summary="Get a specific rate",
     *     tags={"Rate Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Rate ID",
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
     *         description="Rate not found"
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
     * Remove the specified rate from storage (soft delete).
     * 
     * @OA\Delete(
     *     path="/api/rate-management/rates/{id}",
     *     summary="Delete a rate (soft delete)",
     *     tags={"Rate Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Rate ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Rate moved to trash",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Rate has been moved to trash.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Rate not found"
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
     * Store a newly created rate in storage.
     * 
     * @OA\Post(
     *     path="/api/rate-management/rates",
     *     summary="Create a new rate",
     *     tags={"Rate Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "price"},
     *             @OA\Property(property="name", type="string", example="Regular Ticket", description="Rate name"),
     *             @OA\Property(property="description", type="string", example="Standard admission ticket", description="Rate description"),
     *             @OA\Property(property="price", type="number", format="float", example=500.00, description="Rate price"),
     *             @OA\Property(property="status", type="string", example="Active", description="Rate status")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Rate created successfully",
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
    public function store(RateRequest $request)
    {
        try {
            $data = $request->validated();
            $rate = Rate::create($data);
            
            $this->logCreate("Created new rate: {$rate->name} (P{$rate->price})", $rate);
            
            return new RateResource($rate);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function update(RateRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $rate = Rate::findOrFail($id);
            $oldData = $rate->toArray();
            $rate->update($data);
            
            $this->logUpdate("Updated rate: {$rate->name} (P{$rate->price})", $oldData, $rate->toArray());
            
            return new RateResource($rate);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    // Dropdown endpoint for rates and discounts
    public function dropdown()
    {
        try {
            $rates = Rate::where('status', 1)->get();
            $discounts = Discount::where('status', 1)->get();
            
            $this->logAudit('VIEW', 'Viewed rates and discounts dropdown');
            
            return response()->json([
                'rates' => RateResource::collection($rates),
                'discounts' => DiscountResource::collection($discounts),
            ]);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

      /**
   * Get rates for dropdown selection.
   * 
   * @OA\Get(
   *     path="/api/options/rates",
   *     summary="Get active rates for dropdown",
   *     tags={"Rate Management"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Response(
   *         response=200,
   *         description="List of active rates",
   *         @OA\JsonContent(
   *             type="array",
   *             @OA\Items(
   *                 @OA\Property(property="id", type="integer", example=1),
   *                 @OA\Property(property="name", type="string", example="Regular Ticket"),
   *                 @OA\Property(property="price", type="number", format="float", example=500.00)
   *             )
   *         )
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
    public function getRatesForDropdown()
    {
        try {
            $rates = Rate::select('id', 'name', 'price')
                ->where('status', 1)
                ->orderBy('name')
                ->get();
            
            return response()->json($rates);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch rates'], 500);
        }
    }
} 