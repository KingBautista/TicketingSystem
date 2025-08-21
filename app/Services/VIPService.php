<?php

namespace App\Services;

use App\Models\VIP;
use App\Http\Resources\VIPResource;

class VIPService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new VIPResource(new VIP), new VIP());
    }

    public function list($perPage = 10, $trash = false)
    {
        $perPage = request('per_page') ?? $perPage; // Default to 10 if not provided
        $allVIPs = $this->getTotalCount();
        $trashedVIPs = $this->getTrashedCount();
        $query = VIP::query();
        if ($trash) {
            $query->onlyTrashed();
        }
        if (request('search')) {
            $query->where(function($q) {
                $q->where('name', 'LIKE', '%' . request('search') . '%')
                  ->orWhere('card_number', 'LIKE', '%' . request('search') . '%');
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
        
        if (request('validity')) {
            $now = \Carbon\Carbon::now();
            switch (request('validity')) {
                case 'Good':
                    $query->whereDate('validity_end', '>', $now->copy()->addDays(5)->toDateString());
                    break;
                case 'Expiring Soon':
                    $query->whereDate('validity_end', '<=', $now->copy()->addDays(5)->toDateString())
                          ->whereDate('validity_end', '>', $now->copy()->addDays(1)->toDateString());
                    break;
                case 'Expiring':
                    $query->whereDate('validity_end', '<=', $now->copy()->addDays(1)->toDateString())
                          ->whereDate('validity_end', '>', $now->toDateString());
                    break;
                case 'Expired':
                    $query->whereDate('validity_end', '<=', $now->toDateString());
                    break;
            }
        }
        if (request('order')) {
            $query->orderBy(request('order'), request('sort'));
        } else {
            $query->orderBy('id', 'desc');
        }
        return VIPResource::collection(
            $query->paginate($perPage)->withQueryString()
        )->additional(['meta' => ['all' => $allVIPs, 'trashed' => $trashedVIPs]]);
    }

    public function expiring()
    {
        $now = \Carbon\Carbon::now();
        $vips = VIP::whereDate('validity_end', '<=', $now->copy()->addDays(5)->toDateString())
            ->orderBy('validity_end', 'asc')
            ->get();
        return VIPResource::collection($vips);
    }
} 