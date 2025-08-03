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
   * Store a newly created resource in storage.
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
