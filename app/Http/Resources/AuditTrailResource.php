<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuditTrailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        // Build full name from first and last name
        $firstName = $this->first_name ?? '';
        $lastName = $this->last_name ?? '';
        $fullName = trim($firstName . ' ' . $lastName);
        
        return [
            'id' => $this->id,
            'created_at' => $this->created_at->format('Y-m-d H:m:s'),
            'user' => [
                'name' => $fullName ?: ($this->user_login ?? 'Unknown'),
                'user_login' => $this->user_login ?? null,
            ],
            'module' => $this->module,
            'action' => $this->action,
            'description' => $this->description,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'old_value' => $this->old_value,
            'new_value' => $this->new_value,
        ];
    }
}
