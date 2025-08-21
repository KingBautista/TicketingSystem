<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\Auditable;
use Illuminate\Http\Request;
use App\Services\MessageService;

class BaseController extends Controller
{
  use Auditable;

  protected $service;
  protected $messageService;

  // Inject the common services into the BaseController constructor
  public function __construct($service, MessageService $messageService)
  {
    $this->service = $service;
    $this->messageService = $messageService;
  }

  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    // try {
      $items = $this->service->list();
      $this->logAudit('VIEW', 'Viewed list of ' . $this->getModuleName());
      return $items;
    // } catch (\Exception $e) {
    //   return $this->messageService->responseError();
    // }
  }

  // Common method to handle showing resources
  public function show($id)
  {
    try {
      $item = $this->service->show($id);
      $this->logAudit('VIEW', "Viewed {$this->getModuleName()} with ID: {$id}");
      return $item;
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  // Common method to handle destroying resources
  public function destroy($id)
  {
    try {
      $item = $this->service->show($id);
      $this->service->destroy($id);
      $this->logDelete("Deleted {$this->getModuleName()} with ID: {$id}", $item);
      return response(['message' => 'Resource has been moved to trash.'], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  // Common method to handle bulk deleting resources
  public function bulkDelete(Request $request)
  {
    try {
      $count = count($request->ids);
      $this->service->bulkDelete($request->ids);
      $this->logBulkAction('DELETE', "Bulk deleted {$count} {$this->getModuleName()} records", $count);
      return response(['message' => 'Resources have been deleted.'], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  // Common method to handle trashed resources
  public function getTrashed() 
  {
    try {
      $items = $this->service->list(10, true);
      $this->logAudit('VIEW', "Viewed trashed {$this->getModuleName()} records");
      return $items;
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  // Common method to handle restoring resources
  public function restore($id)
  {
    try {
      $item = $this->service->restore($id);
      $this->logRestore("Restored {$this->getModuleName()} with ID: {$id}", $item);
      return response([
        'message' => 'Resource has been restored.',
        'resource' => $item
      ], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  // Common method to handle bulk restoring resources
  public function bulkRestore(Request $request)
  {
    try {
      $count = count($request->ids);
      $this->service->bulkRestore($request->ids);
      $this->logBulkAction('RESTORE', "Bulk restored {$count} {$this->getModuleName()} records", $count);
      return response(['message' => 'Resources have been restored.'], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  // Common method to handle force deleting resources
  public function forceDelete($id)
  {
    try {
      $item = $this->service->show($id);
      $this->service->forceDelete($id);
      $this->logDelete("Permanently deleted {$this->getModuleName()} with ID: {$id}", $item);
      return response(['message' => 'Resource has been permanently deleted.'], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }

  // Common method to handle bulk force deleting resources
  public function bulkForceDelete(Request $request)
  {
    try {
      $count = count($request->ids);
      $this->service->bulkForceDelete($request->ids);
      $this->logBulkAction('FORCE_DELETE', "Bulk permanently deleted {$count} {$this->getModuleName()} records", $count);
      return response(['message' => 'Resources have been permanently deleted.'], 200);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
  }
}
