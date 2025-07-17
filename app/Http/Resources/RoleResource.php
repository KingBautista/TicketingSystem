<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'label' => $this->name,
      'active' => ($this->active) ? 'Active' : 'Inactive',
      'is_super_admin' => $this->is_super_admin,
      'permissions' => $this->permissions,
      'updated_at' => $this->updated_at->format('Y-m-d H:m:s'),
      'deleted_at' => ($this->deleted_at) ? $this->deleted_at->format('Y-m-d H:m:s') : null
    ];
  }
}
