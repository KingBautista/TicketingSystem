<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray($request): array
  {
    return [
      'id' => $this->id,
      'user_login' => $this->user_login,
      'user_email' => $this->user_email,
      'first_name' => (isset($this->user_details['first_name'])) ? $this->user_details['first_name'] : '',
      'last_name' => (isset($this->user_details['last_name'])) ? $this->user_details['last_name'] : '',
      'nickname' => (isset($this->user_details['nickname'])) ? $this->user_details['nickname'] : '',
      'mobile_number' => (isset($this->user_details['mobile_number'])) ? $this->user_details['mobile_number'] : '',
      'contact_number' => (isset($this->user_details['contact_number'])) ? $this->user_details['contact_number'] : '',
      'biography' => (isset($this->user_details['biography'])) ? $this->user_details['biography'] : '',
      'attachment_file' => (isset($this->user_details['attachment_file'])) ? $this->user_details['attachment_file'] : '',
      'attachment_metadata' => (isset($this->user_details['attachment_metadata'])) ? $this->user_details['attachment_metadata'] : '',
      'user_role' => ($this->user_role) ? $this->user_role->name : 'Unassigned',
      'theme' => (isset($this->user_details['theme'])) ? $this->user_details['theme'] : '',
      'user_status' => ($this->user_status) ? 'Active' : 'Inactive',
      'updated_at' => $this->updated_at->format('Y-m-d H:m:s'),
      'deleted_at' => ($this->deleted_at) ? $this->deleted_at->format('Y-m-d H:m:s') : null
    ];
  }
}
