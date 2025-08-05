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
use App\Traits\Auditable;

class PromoterController extends BaseController
{
    use Auditable;

    public function __construct(PromoterService $service, MessageService $messageService)
    {
        parent::__construct($service, $messageService);
    }

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