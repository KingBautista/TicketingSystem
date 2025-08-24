<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaLibrary;
use Illuminate\Http\Request;
use App\Services\MediaService;
use App\Services\MessageService;

class MediaController extends Controller
{
	protected $mediaService;
  protected $messageService;

	public function __construct(MediaService $mediaService, MessageService $messageService)
  {
    $this->mediaService = $mediaService;
    $this->messageService = $messageService;
  }
	/**
	 * Display a listing of media files.
	 * 
	 * @OA\Get(
	 *     path="/api/content-management/media-library",
	 *     summary="Get list of media files",
	 *     tags={"Content Management"},
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
	 *     @OA\Response(
	 *         response=200,
	 *         description="List of media files",
	 *         @OA\JsonContent(
	 *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
	 *             @OA\Property(property="meta", type="object")
	 *         )
	 *     ),
	 *     @OA\Response(
	 *         response=401,
	 *         description="Unauthenticated"
	 *     )
	 * )
	 */
	public function index()
	{
		try {
			return $this->mediaService->list();
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}

	/**
	 * Upload media files.
	 * 
	 * @OA\Post(
	 *     path="/api/content-management/media-library",
	 *     summary="Upload media files",
	 *     tags={"Content Management"},
	 *     security={{"bearerAuth": {}}},
	 *     @OA\RequestBody(
	 *         required=true,
	 *         @OA\MediaType(
	 *             mediaType="multipart/form-data",
	 *             @OA\Schema(
	 *                 @OA\Property(
	 *                     property="files",
	 *                     type="array",
	 *                     @OA\Items(type="string", format="binary"),
	 *                     description="Media files to upload"
	 *                 )
	 *             )
	 *         )
	 *     ),
	 *     @OA\Response(
	 *         response=201,
	 *         description="Media files uploaded successfully",
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
	public function store(Request $request)
	{
		try {
			$user = $request->user();
			$files = $request->file('files');

			$media = $this->mediaService->uploadFiles($files, $user);
			return response($media, 201);

		} catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}

	/**
	 * Display the specified resource.
	 */
	public function show($id)
	{
		try {
			return $this->mediaService->show($id);
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update($id, Request $request)
	{
		try {
			$mediaLibrary = $this->mediaService->update($request->all(), $id);
			return response($mediaLibrary, 201);
		} catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy($id)
	{
		try {
			$this->mediaService->destroy($id);
			$message = 'Media has been deleted permanently.';
      return response(compact('message'));
    } catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}

	/**
	 * Bulk delete media files.
	 * 
	 * @OA\Post(
	 *     path="/api/content-management/media-library/bulk/delete",
	 *     summary="Bulk delete media files",
	 *     tags={"Content Management"},
	 *     security={{"bearerAuth": {}}},
	 *     @OA\RequestBody(
	 *         required=true,
	 *         @OA\JsonContent(
	 *             required={"ids"},
	 *             @OA\Property(
	 *                 property="ids",
	 *                 type="array",
	 *                 @OA\Items(type="integer"),
	 *                 example={1, 2, 3},
	 *                 description="Array of media file IDs to delete"
	 *             )
	 *         )
	 *     ),
	 *     @OA\Response(
	 *         response=200,
	 *         description="Media files deleted successfully",
	 *         @OA\JsonContent(
	 *             @OA\Property(property="message", type="string", example="Media/s has been deleted permanently.")
	 *         )
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
	public function bulkDelete(Request $request) 
	{
		try {
			$this->mediaService->bulkDelete($request->ids);
			$message = 'Media/s has been deleted permanently.';
      return response(compact('message'));
		} catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}

	public function dateFolder() 
	{
		try {
			return $this->mediaService->folderList();
		} catch (\Exception $e) {
      return $this->messageService->responseError();
    }
	}
}
