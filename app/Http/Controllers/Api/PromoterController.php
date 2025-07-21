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

class PromoterController extends BaseController
{
    public function __construct(PromoterService $service, MessageService $messageService)
    {
        parent::__construct($service, $messageService);
    }

    public function store(PromoterRequest $request)
    {
        try {
            $data = $request->validated();
            $resource = $this->service->store($data);
            return response($resource, 201);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function update(PromoterRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $resource = $this->service->update($data, $id);
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
            return response()->json(['message' => 'Manual update set successfully.', 'schedule' => $schedule]);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }

    public function getPromoterOfTheDay(Request $request)
    {
        try {
            $date = $request->input('date', date('Y-m-d'));
            $schedule = \App\Models\PromoterSchedule::where('date', $date)
                ->orderByDesc('is_manual') // manual override first
                ->first();
            if ($schedule && $schedule->promoter) {
                return new \App\Http\Resources\PromoterResource($schedule->promoter);
            }
            return response()->json(['data' => null]);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }
} 