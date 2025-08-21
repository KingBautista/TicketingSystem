<?php

namespace App\Services;

use App\Models\Promoter;
use App\Models\PromoterSchedule;
use App\Http\Resources\PromoterResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PromoterService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new PromoterResource(new Promoter), new Promoter());
    }

    public function list($perPage = 10, $trash = false)
    {
        $perPage = request('per_page') ?? $perPage; // Default to 10 if not provided
        $allPromoters = $this->getTotalCount();
        $trashedPromoters = $this->getTrashedCount();
        $query = Promoter::with('schedules');
        if ($trash) {
            $query->onlyTrashed();
        }
        if (request('search')) {
            $query->where(function($q) {
                $q->where('name', 'LIKE', '%' . request('search') . '%');
            });
        }
        
        if (request('status')) {
            $status = request('status');
            if ($status === 'Active') {
                $query->where('status', 1);
            } elseif ($status === 'Inactive') {
                $query->where('status', 0);
            }
        }
        if (request('order')) {
            $query->orderBy(request('order'), request('sort'));
        } else {
            $query->orderBy('id', 'desc');
        }
        return PromoterResource::collection(
            $query->paginate($perPage)->withQueryString()
        )->additional(['meta' => ['all' => $allPromoters, 'trashed' => $trashedPromoters]]);
    }

    public function schedule($promoterId, $date, $isManual = false)
    {
        return PromoterSchedule::create([
            'promoter_id' => $promoterId,
            'date' => $date,
            'is_manual' => $isManual,
        ]);
    }

    public function manualUpdateForDay($date, $promoterId)
    {
        // Remove any previous manual for this date
        PromoterSchedule::where('date', $date)->where('is_manual', true)->delete();
        // Set new manual
        return $this->schedule($promoterId, $date, true);
    }
} 