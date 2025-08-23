<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\Auditable;
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
    use Auditable;

    protected $service;

    public function __construct(CashierService $service)
    {
        $this->service = $service;
    }

    public function openSession(CashierOpenRequest $request)
    {
        $data = $request->validated();
        $session = $this->service->openSession($data);
        
        $this->logCreate("Opened cashier session with cash on hand: ₱{$data['cash_on_hand']}", $session);
        
        return new CashierSessionResource($session);
    }

    public function closeSession(CashierCloseRequest $request)
    {
        $data = $request->validated();
        $session = $this->service->closeSession($data);
        
        $this->logUpdate("Closed cashier session with closing cash: ₱{$data['closing_cash']}", null, $session->toArray());
        
        return new CashierSessionResource($session);
    }

    public function storeTransaction(CashierTransactionRequest $request)
    {
        $data = $request->validated();
        $transaction = $this->service->storeTransaction($data);
        
        $this->logCreate("Created transaction: ₱{$data['total']} for {$data['quantity']} tickets", $transaction);
        
        return new CashierTransactionResource($transaction);
    }

    public function tickets($transactionId)
    {
        $tickets = $this->service->getTickets($transactionId);
        
        $this->logAudit('VIEW', "Viewed tickets for transaction ID: {$transactionId}");
        
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
        
        $this->logAudit('VIEW', "Viewed daily transactions for cashier ID: {$cashierId}, session ID: {$sessionId}, total: ₱{$total}");
        
        return response()->json([
            'transactions' => $transactions,
            'total' => $total,
            'session_id' => $sessionId
        ]);
    }

    /**
     * Get today's transactions for current cashier (for TransactionList component)
     */
    public function getTodayTransactions(Request $request)
    {
        $cashierId = auth()->id();
        $transactions = $this->service->getTodayTransactions($cashierId);
        $total = $transactions->sum('total');
        
        $this->logAudit('VIEW', "Viewed today's transactions for cashier ID: {$cashierId}, total: ₱{$total}");
        
        return response()->json([
            'transactions' => $transactions,
            'total' => $total,
            'date' => now()->format('Y-m-d')
        ]);
    }

    /**
     * Get session details
     */
    public function getSession($id)
    {
        $session = $this->service->getSession($id);
        
        $this->logAudit('VIEW', "Viewed cashier session details for session ID: {$id}");
        
        return new CashierSessionResource($session);
    }

    public function sendToDisplay(Request $request)
    {
        $line1 = substr($request->input('line1', ''), 0, 20);
        $line2 = substr($request->input('line2', ''), 0, 20);

        $batPath = base_path('pd300-display/send-display.bat');
        $line1Escaped = escapeshellarg($line1);
        $line2Escaped = escapeshellarg($line2);
        $command = "\"$batPath\" $line1Escaped $line2Escaped";

        try {
            shell_exec($command);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

}
