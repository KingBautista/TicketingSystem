<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DiscountRequest;
use App\Http\Resources\DiscountResource;
use App\Services\DiscountService;
use Illuminate\Http\Request;
use App\Services\MessageService;
use App\Models\Discount;
use App\Traits\Auditable;

class DiscountController extends BaseController
{
    use Auditable;

    protected $service;
    protected $messageService;

    	public function __construct(DiscountService $service, MessageService $messageService)
    {
        $this->service = $service;
        $this->messageService = $messageService;
    }

    /**
     * Display a listing of discounts.
     * 
     * @OA\Get(
     *     path="/api/rate-management/discounts",
     *     summary="Get list of discounts",
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
     * Display the specified discount.
     * 
     * @OA\Get(
     *     path="/api/rate-management/discounts/{id}",
     *     summary="Get a specific discount",
     *     tags={"Rate Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Discount ID",
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
     *         description="Discount not found"
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
     * Remove the specified discount from storage (soft delete).
     * 
     * @OA\Delete(
     *     path="/api/rate-management/discounts/{id}",
     *     summary="Delete a discount (soft delete)",
     *     tags={"Rate Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Discount ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Discount moved to trash",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Discount has been moved to trash.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Discount not found"
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
     * Store a newly created discount in storage.
     * 
     * @OA\Post(
     *     path="/api/rate-management/discounts",
     *     summary="Create a new discount",
     *     tags={"Rate Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"discount_name", "discount_value", "discount_value_type"},
     *             @OA\Property(property="discount_name", type="string", example="Student Discount", description="Discount name"),
     *             @OA\Property(property="discount_value", type="number", format="float", example=20.00, description="Discount value"),
     *             @OA\Property(property="discount_value_type", type="string", enum={"percentage", "fixed"}, example="percentage", description="Discount type"),
     *             @OA\Property(property="description", type="string", example="Discount for students", description="Discount description"),
     *             @OA\Property(property="status", type="string", example="Active", description="Discount status")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Discount created successfully",
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
    public function store(DiscountRequest $request)
    {
        try {
            $data = $request->validated();
            $discount = Discount::create($data);
            
            $this->logCreate("Created new discount: {$discount->discount_name} ({$discount->discount_value_type})", $discount);
            
            return new DiscountResource($discount);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function update(DiscountRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $discount = Discount::findOrFail($id);
            $oldData = $discount->toArray();
            $discount->update($data);
            
            $this->logUpdate("Updated discount: {$discount->discount_name} ({$discount->discount_value_type})", $oldData, $discount->toArray());
            
            return new DiscountResource($discount);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }
} 