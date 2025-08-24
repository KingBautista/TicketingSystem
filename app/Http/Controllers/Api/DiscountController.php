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