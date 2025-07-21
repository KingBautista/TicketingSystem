<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CashierTransactionRequest;
use App\Services\CashierTransactionService;
use App\Services\MessageService;
use Illuminate\Http\Request;

class CashierTransactionController extends BaseController
{
    public function __construct(CashierTransactionService $service, MessageService $messageService)
    {
        parent::__construct($service, $messageService);
    }

    public function store(CashierTransactionRequest $request)
    {
        try {
            $data = $request->validated();
            $transaction = $this->service->storeWithDetails($data);
            return response()->json(['message' => 'Transaction saved successfully.', 'transaction' => $transaction]);
        } catch (\Exception $e) {
            return $this->messageService->responseError();
        }
    }
} 