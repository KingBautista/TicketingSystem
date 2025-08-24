<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\NavigationRequest;
use App\Services\MessageService;
use App\Services\NavigationService;
use App\Traits\Auditable;

class NavigationController extends BaseController
{
  use Auditable;

  public function __construct(NavigationService $navigationService, MessageService $messageService)
  {
    // Call the parent constructor to initialize services
    parent::__construct($navigationService, $messageService);
  }

  /**
   * Store a newly created navigation in storage.
   * 
   * @OA\Post(
   *     path="/api/system-settings/navigation",
   *     summary="Create a new navigation item",
   *     tags={"System Settings"},
   *     security={{"bearerAuth": {}}},
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(
   *             required={"name", "slug"},
   *             @OA\Property(property="name", type="string", example="User Management", description="Navigation name"),
   *             @OA\Property(property="slug", type="string", example="user-management", description="Navigation slug"),
   *             @OA\Property(property="parent_id", type="integer", example=1, description="Parent navigation ID"),
   *             @OA\Property(property="active", type="boolean", example=true, description="Navigation status"),
   *             @OA\Property(property="show_in_menu", type="boolean", example=true, description="Show in menu")
   *         )
   *     ),
   *     @OA\Response(
   *         response=201,
   *         description="Navigation created successfully",
   *         @OA\JsonContent(type="object")
   *     ),
   *     @OA\Response(
   *         response=422,
   *         description="Validation error"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function store(NavigationRequest $request)
  {
    try {
      $data = $request->all();
      $resource = $this->service->store($data);
      
      $this->logCreate("Created new navigation: {$data['name']}", $resource);
      
      return response($resource, 201);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  /**
   * Update a resource in storage.
   */
  public function update(NavigationRequest $request, $id)
  {
    try {
      $data = $request->all();
      $oldData = $this->service->show($id);
      $resource = $this->service->update($data, $id);
      
      $this->logUpdate("Updated navigation: {$data['name']}", $oldData, $resource);
      
      return response($resource, 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  /**
   * Get all navigations for dropdown selection.
   * 
   * @OA\Get(
   *     path="/api/options/navigations",
   *     summary="Get all navigations for dropdown",
   *     tags={"Options"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Response(
   *         response=200,
   *         description="List of navigations",
   *         @OA\JsonContent(type="array", @OA\Items(type="object"))
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function getNavigations() 
  {
    try {
      $navigations = $this->service->navigations();
      
      $this->logAudit('VIEW', 'Viewed navigation list');
      
      return $navigations;
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getSubNavigations($id) 
  {
    try {
      $subNavigations = $this->service->subNavigations($id);
      
      $this->logAudit('VIEW', "Viewed sub-navigations for navigation ID: {$id}");
      
      return $subNavigations;
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getRoutes() 
  {
    try {
      $routes = $this->service->getRoutes();
      
      $this->logAudit('VIEW', 'Viewed system routes');
      
      return $routes;
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }
}
