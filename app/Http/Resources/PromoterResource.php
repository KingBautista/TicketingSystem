<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromoterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status ? 'Active' : 'Inactive',
            'schedules' => PromoterScheduleResource::collection($this->whenLoaded('schedules')),
            'updated_at' => $this->updated_at->format('Y-m-d H:m:s'),
            'deleted_at' => ($this->deleted_at) ? $this->deleted_at->format('Y-m-d H:m:s') : null,     
        ];
    }
} 