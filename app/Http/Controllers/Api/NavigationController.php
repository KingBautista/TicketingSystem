<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\NavigationRequest;
use App\Services\MessageService;
use App\Services\NavigationService;

class NavigationController extends BaseController
{
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
      $resource = $this->service->update($data, $id);
      return response($resource, 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getNavigations() 
  {
    try {
			return $this->service->navigations();
		} catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getSubNavigations($id) 
  {
    try {
			return $this->service->subNavigations($id);
		} catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  public function getRoutes() 
  {
    try {
			return $this->service->getRoutes();
		} catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }
}
