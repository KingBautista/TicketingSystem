<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\VIPRequest;
use App\Services\VIPService;
use App\Services\MessageService;
use App\Models\VIP;
use App\Http\Resources\VIPResource;

class VIPController extends BaseController
{
    public function __construct(VIPService $vipService, MessageService $messageService)
    {
        parent::__construct($vipService, $messageService);
    }

    public function store(VIPRequest $request)
    {
        try {
            $data = $request->validated();
            $vip = VIP::create($data);
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
            $vip->update($data);
            return new VIPResource($vip);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function expiring()
    {
        try {
            return $this->service->expiring();
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }
} 