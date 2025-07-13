<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\UserMeta;

class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array<int, string>
	 */
	protected $fillable = [
		'user_login',
		'user_email',
		'user_pass',
		'user_salt',
		'user_status',
		'user_activation_key',
		'remember_token',
		'user_role_id',
	];

	/**
	 * The attributes that should be hidden for serialization.
	 *
	 * @var array<int, string>
	 */
	protected $hidden = [
		'user_pass',
		'user_salt',
		'user_activation_key',
		'remember_token',
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array<string, string>
	 */
	protected $casts = [
		'created_at' => 'datetime',
		'updated_at' => 'datetime',
		'deleted_at' => 'datetime',
	];

	/**
	 * The table associated with the model.
	 *
	 * @var string
	*/
	protected $table = 'users';

	public function saveUserMeta($metaData) 
	{
		foreach ($metaData as $key => $data) {
			UserMeta::updateOrCreate(
			[
				'user_id' => $this->id,
				'meta_key' => $key
			],
			[
				'meta_value' => $data,
			]);
		}
	}

	/**
	 * Append additiona info to the return data
	 *
	 * @var string
	 */
	public $appends = [
		'user_details',
		'user_role',
	];

	public function getUserMetas()
	{   
		return $this->hasMany('App\Models\UserMeta', 'user_id', 'id');
	}

	public function getUserRole($role_id)
	{   
		return Role::find($role_id);
	}

	/**
	 * Get the user's role relationship
	 */
	public function userRole()
	{
		return $this->belongsTo(Role::class, 'user_role_id');
	}

	/****************************************
	*           ATTRIBUTES PARTS            *
	****************************************/
	public function getUserDetailsAttribute()
	{
		return $this->getUserMetas()->pluck('meta_value', 'meta_key')->toArray();
	}

	public function getUserRoleAttribute()
	{
		// First try to get role from direct relationship
		if ($this->user_role_id && $role = $this->getUserRole($this->user_role_id)) {
			return $role;
		}
		
		// Fallback to user meta if direct relationship is not set
		$user_role = json_decode($this->user_details['user_role'] ?? 'null');
		return $user_role && ($role = $this->getUserRole($user_role->id)) ? $role : null;
	}
}
