<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\VIPRequest;
use App\Services\VIPService;
use App\Services\MessageService;
use App\Models\VIP;
use App\Http\Resources\VIPResource;
use App\Traits\Auditable;

class VIPController extends BaseController
{
    use Auditable;

    public function __construct(VIPService $vipService, MessageService $messageService)
    {
        parent::__construct($vipService, $messageService);
    }

    /**
     * Store a newly created VIP member in storage.
     * 
     * @OA\Post(
     *     path="/api/vip-management/vips",
     *     summary="Create a new VIP member",
     *     tags={"VIP Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"card_number", "name", "validity_start", "validity_end"},
     *             @OA\Property(property="card_number", type="string", example="1234567890", description="VIP card number (max 10 digits)"),
     *             @OA\Property(property="name", type="string", example="John Doe", description="VIP member name"),
     *             @OA\Property(property="validity_start", type="string", format="date", example="2024-01-01", description="Validity start date"),
     *             @OA\Property(property="validity_end", type="string", format="date", example="2024-12-31", description="Validity end date"),
     *             @OA\Property(property="status", type="string", example="Active", description="VIP status")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="VIP member created successfully",
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
    public function store(VIPRequest $request)
    {
        try {
            $data = $request->validated();
            $vip = VIP::create($data);
            
            $this->logCreate("Created new VIP member: {$vip->name} ({$vip->membership_type})", $vip);
            
            return new VIPResource($vip);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    /**
     * Update the specified VIP member in storage.
     * 
     * @OA\Put(
     *     path="/api/vip-management/vips/{id}",
     *     summary="Update an existing VIP member",
     *     tags={"VIP Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="VIP member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"card_number", "name", "validity_start", "validity_end"},
     *             @OA\Property(property="card_number", type="string", example="1234567890", description="VIP card number (max 10 digits)"),
     *             @OA\Property(property="name", type="string", example="John Doe", description="VIP member name"),
     *             @OA\Property(property="validity_start", type="string", format="date", example="2024-01-01", description="Validity start date"),
     *             @OA\Property(property="validity_end", type="string", format="date", example="2024-12-31", description="Validity end date"),
     *             @OA\Property(property="status", type="string", example="Active", description="VIP status")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="VIP member updated successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="VIP member not found"
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
    public function update(VIPRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $vip = VIP::findOrFail($id);
            $oldData = $vip->toArray();
            $vip->update($data);
            
            $this->logUpdate("Updated VIP member: {$vip->name} ({$vip->membership_type})", $oldData, $vip->toArray());
            
            return new VIPResource($vip);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    /**
     * Get expiring VIP members.
     * 
     * @OA\Get(
     *     path="/api/vip-management/vips/expiring",
     *     summary="Get VIP members expiring soon",
     *     tags={"VIP Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of expiring VIP members",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function expiring()
    {
        try {
            $expiringVips = $this->service->expiring();
            
            $this->logAudit('VIEW', 'Viewed expiring VIP members');
            
            return $expiringVips;
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }
} 