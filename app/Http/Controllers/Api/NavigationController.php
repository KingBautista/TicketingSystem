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
   * Display a listing of navigation items.
   * 
   * @OA\Get(
   *     path="/api/system-settings/navigation",
   *     summary="Get list of navigation items",
   *     tags={"System Settings"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="search",
   *         in="query",
   *         description="Search term",
   *         required=false,
   *         @OA\Schema(type="string")
   *     ),
   *     @OA\Parameter(
   *         name="per_page",
   *         in="query",
   *         description="Number of items per page",
   *         required=false,
   *         @OA\Schema(type="integer", default=10)
   *     ),
   *     @OA\Parameter(
   *         name="order",
   *         in="query",
   *         description="Order by field",
   *         required=false,
   *         @OA\Schema(type="string")
   *     ),
   *     @OA\Parameter(
   *         name="sort",
   *         in="query",
   *         description="Sort direction (asc/desc)",
   *         required=false,
   *         @OA\Schema(type="string", enum={"asc", "desc"})
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Successful operation",
   *         @OA\JsonContent(
   *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
   *             @OA\Property(property="meta", type="object")
   *         )
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     ),
   *     @OA\Response(
   *         response=500,
   *         description="Server error"
   *     )
   * )
   */
  public function index()
  {
    return parent::index();
  }

  /**
   * Display the specified navigation item.
   * 
   * @OA\Get(
   *     path="/api/system-settings/navigation/{id}",
   *     summary="Get a specific navigation item",
   *     tags={"System Settings"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="Navigation ID",
   *         required=true,
   *         @OA\Schema(type="integer")
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Successful operation",
   *         @OA\JsonContent(type="object")
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="Navigation item not found"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function show($id)
  {
    return parent::show($id);
  }

  /**
   * Remove the specified navigation item from storage (soft delete).
   * 
   * @OA\Delete(
   *     path="/api/system-settings/navigation/{id}",
   *     summary="Delete a navigation item (soft delete)",
   *     tags={"System Settings"},
   *     security={{"bearerAuth": {}}},
   *     @OA\Parameter(
   *         name="id",
   *         in="path",
   *         description="Navigation ID",
   *         required=true,
   *         @OA\Schema(type="integer")
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Navigation item moved to trash",
   *         @OA\JsonContent(
   *             @OA\Property(property="message", type="string", example="Navigation item has been moved to trash.")
   *         )
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="Navigation item not found"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Unauthenticated"
   *     )
   * )
   */
  public function destroy($id)
  {
    return parent::destroy($id);
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
   *     tags={"System Settings"},
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
