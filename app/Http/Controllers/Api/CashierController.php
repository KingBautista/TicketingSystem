<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CashierOpenRequest;
use App\Http\Requests\CashierCloseRequest;
use App\Http\Requests\CashierTransactionRequest;
use App\Http\Resources\CashierSessionResource;
use App\Http\Resources\CashierTransactionResource;
use App\Http\Resources\CashierTicketResource;
use App\Services\CashierService;
use Illuminate\Http\Request;

class CashierController extends Controller
{
    protected $service;

    public function __construct(CashierService $service)
    {
        $this->service = $service;
    }

    public function openSession(CashierOpenRequest $request)
    {
        $data = $request->validated();
        $session = $this->service->openSession($data);
        return new CashierSessionResource($session);
    }

    public function closeSession(CashierCloseRequest $request)
    {
        $data = $request->validated();
        $session = $this->service->closeSession($data);
        return new CashierSessionResource($session);
    }

    public function storeTransaction(CashierTransactionRequest $request)
    {
        $data = $request->validated();
        $transaction = $this->service->storeTransaction($data);
        return new CashierTransactionResource($transaction);
    }

    public function tickets($transactionId)
    {
        $tickets = $this->service->getTickets($transactionId);
        return CashierTicketResource::collection($tickets);
    }

    /**
     * Get daily transactions for current cashier and session
     */
    public function getDailyTransactions(Request $request)
    {
        $cashierId = auth()->id();
        $sessionId = $request->query('session_id');
        $transactions = $this->service->getDailyTransactions($cashierId, $sessionId);
        $total = $transactions->sum('total');
        return response()->json([
            'transactions' => $transactions,
            'total' => $total,
            'session_id' => $sessionId
        ]);
    }

    /**
     * Get session details
     */
    public function getSession($id)
    {
        $session = $this->service->getSession($id);
        return new CashierSessionResource($session);
    }
}
