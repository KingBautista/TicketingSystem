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