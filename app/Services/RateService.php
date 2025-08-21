<?php

namespace App\Services;

use App\Models\Rate;
use App\Http\Resources\RateResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RateService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new RateResource(new Rate), new Rate());
    }

    public function list($perPage = 10, $trash = false)
    {
        $perPage = request('per_page') ?? $perPage; // Default to 10 if not provided
        $allRates = $this->getTotalCount();
        $trashedRates = $this->getTrashedCount();
        $query = Rate::query();
        if ($trash) {
            $query->onlyTrashed();
        }
        if (request('search')) {
            $query->where(function($q) {
                $q->where('name', 'LIKE', '%' . request('search') . '%')
                  ->orWhere('description', 'LIKE', '%' . request('search') . '%');
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
        return RateResource::collection(
            $query->paginate($perPage)->withQueryString()
        )->additional(['meta' => ['all' => $allRates, 'trashed' => $trashedRates]]);
    }
} 