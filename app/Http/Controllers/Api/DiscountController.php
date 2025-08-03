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