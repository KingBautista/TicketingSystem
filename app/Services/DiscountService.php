<?php

namespace App\Services;

use App\Models\Discount;
use App\Http\Resources\DiscountResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DiscountService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new DiscountResource(new Discount), new Discount());
    }

    public function list($perPage = 10, $trash = false)
    {
        $perPage = request('per_page') ?? $perPage; // Default to 10 if not provided
        $allDiscounts = $this->getTotalCount();
        $trashedDiscounts = $this->getTrashedCount();
        $query = Discount::query();
        if ($trash) {
            $query->onlyTrashed();
        }
        if (request('search')) {
            $query->where(function($q) {
                $q->where('discount_name', 'LIKE', '%' . request('search') . '%');
            });
        }
        if (request('order')) {
            $query->orderBy(request('order'), request('sort'));
        } else {
            $query->orderBy('id', 'desc');
        }
        return DiscountResource::collection(
            $query->paginate($perPage)->withQueryString()
        )->additional(['meta' => ['all' => $allDiscounts, 'trashed' => $trashedDiscounts]]);
    }
} 