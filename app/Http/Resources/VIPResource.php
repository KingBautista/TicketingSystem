<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class VIPResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $validity = $this->getValidityStatus();
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'contact_number' => $this->contact_number,
            'other_info' => $this->other_info,
            'card_number' => $this->card_number,
            'validity_start' => $this->validity_start,
            'validity_end' => $this->validity_end,
            'validity_days' => $this->getValidityDays(),
            'validity' => $validity,
            'status' => $this->status ? 'Active' : 'Inactive',
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $this->deleted_at ? $this->deleted_at->format('Y-m-d H:i:s') : null,
        ];
    }

    private function getValidityStatus()
    {
        $now = Carbon::now()->startOfDay();
        $end = $this->validity_end ? Carbon::parse($this->validity_end)->startOfDay() : null;
        if (!$end) return 'Unknown';
        $diff = $now->diffInDays($end, false);
        if ($diff > 5) return 'Good';
        if ($diff <= 5 && $diff > 1) return 'Expiring Soon';
        if ($diff == 1) return 'Expiring';
        if ($diff <= 0) return 'Expired';
        return 'Unknown';
    }

    private function getValidityDays()
    {
        if (!$this->validity_start || !$this->validity_end) return null;
        $start = Carbon::parse($this->validity_start);
        $end = Carbon::parse($this->validity_end);
        return $start->diffInDays($end) + 1;
    }
} 