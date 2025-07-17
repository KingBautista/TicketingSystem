<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\RateRequest;
use App\Services\RateService;
use App\Services\MessageService;
use App\Models\Rate;
use App\Http\Resources\RateResource;

class RateController extends BaseController
{
    public function __construct(RateService $rateService, MessageService $messageService)
    {
        parent::__construct($rateService, $messageService);
    }

    public function store(RateRequest $request)
    {
        try {
            $data = $request->validated();
            $rate = Rate::create($data);
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
            $rate->update($data);
            return new RateResource($rate);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }
} 