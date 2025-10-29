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

    /**
     * Open a new cashier session.
     * 
     * @OA\Post(
     *     path="/api/cashier/open-session",
     *     summary="Open a new cashier session",
     *     tags={"Cashier Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"cash_on_hand"},
     *             @OA\Property(property="cash_on_hand", type="number", format="float", example=1000.00, description="Starting cash amount"),
     *             @OA\Property(property="notes", type="string", example="Morning shift", description="Session notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Cashier session opened successfully",
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
    public function openSession(CashierOpenRequest $request)
    {
        $data = $request->validated();
        $session = $this->service->openSession($data);
        
        $this->logCreate("Opened cashier session with cash on hand: P{$data['cash_on_hand']}", $session);
        
        return new CashierSessionResource($session);
    }

    /**
     * Close the current cashier session.
     * 
     * @OA\Post(
     *     path="/api/cashier/close-session",
     *     summary="Close the current cashier session",
     *     tags={"Cashier Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"closing_cash"},
     *             @OA\Property(property="closing_cash", type="number", format="float", example=1500.00, description="Closing cash amount"),
     *             @OA\Property(property="notes", type="string", example="End of shift", description="Closing notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cashier session closed successfully",
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
    public function closeSession(CashierCloseRequest $request)
    {
        $data = $request->validated();
        $session = $this->service->closeSession($data);
        
        $this->logUpdate("Closed cashier session with closing cash: P{$data['closing_cash']}", null, $session->toArray());
        
        return new CashierSessionResource($session);
    }

    /**
     * Create a new cashier transaction.
     * 
     * @OA\Post(
     *     path="/api/cashier/transactions",
     *     summary="Create a new cashier transaction",
     *     tags={"Cashier Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"quantity", "rate_id", "total"},
     *             @OA\Property(property="quantity", type="integer", example=2, description="Number of tickets"),
     *             @OA\Property(property="rate_id", type="integer", example=1, description="Rate ID"),
     *             @OA\Property(property="discount_id", type="integer", example=1, description="Discount ID (optional)"),
     *             @OA\Property(property="promoter_id", type="integer", example=1, description="Promoter ID (optional)"),
     *             @OA\Property(property="total", type="number", format="float", example=1000.00, description="Total amount"),
     *             @OA\Property(property="payment_method", type="string", example="cash", description="Payment method"),
     *             @OA\Property(property="notes", type="string", example="Customer request", description="Transaction notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Transaction created successfully",
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
    public function storeTransaction(CashierTransactionRequest $request)
    {
        $data = $request->validated();
        $transaction = $this->service->storeTransaction($data);
        
        $this->logCreate("Created transaction: P{$data['total']} for {$data['quantity']} tickets", $transaction);
        
        // Return transaction with all related data for frontend printing
        $transactionWithData = \App\Models\CashierTransaction::with([
            'cashier:id,user_login',
            'promoter:id,name',
            'rate:id,name',
            'discounts'
        ])->find($transaction->id);

        // Get tickets for this transaction
        $tickets = \App\Models\CashierTicket::where('transaction_id', $transaction->id)
            ->pluck('qr_code')
            ->toArray();

        // Prepare transaction data for frontend printing
        $transactionData = [
            'transactionId' => $transactionWithData->id,
            'promoterName' => $transactionWithData->promoter->name ?? 'N/A',
            'rateName' => $transactionWithData->rate->name ?? 'N/A',
            'quantity' => $transactionWithData->quantity,
            'total' => $transactionWithData->total,
            'paidAmount' => $transactionWithData->paid_amount,
            'change' => $transactionWithData->change,
            'cashierName' => $transactionWithData->cashier->user_login ?? 'N/A',
            'sessionId' => $transactionWithData->session_id ?? 'N/A',
            'discounts' => $transactionWithData->discounts->map(function($discount) {
                return [
                    'discount_name' => $discount->discount_name,
                    'discount_value' => $discount->pivot->discount_value,
                    'discount_value_type' => $discount->discount_value_type ?? 'fixed'
                ];
            })->toArray(),
            'tickets' => $tickets,
            'createdAt' => $transactionWithData->created_at->toISOString()
        ];
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'transaction' => new CashierTransactionResource($transaction),
            'printData' => $transactionData
        ]);
    }

    /**
     * Get tickets for a specific transaction.
     * 
     * @OA\Get(
     *     path="/api/cashier/transactions/{transactionId}/tickets",
     *     summary="Get tickets for a transaction",
     *     tags={"Cashier Management"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="transactionId",
     *         in="path",
     *         description="Transaction ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of tickets for the transaction",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Transaction not found"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
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
        
        $this->logAudit('VIEW', "Viewed daily transactions for cashier ID: {$cashierId}, session ID: {$sessionId}, total: P{$total}");
        
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
        
        $this->logAudit('VIEW', "Viewed today's transactions for cashier ID: {$cashierId}, total: P{$total}");
        
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

    /**
     * Re-print Transaction Receipt
     * 
     * @OA\Post(
     *     path="/api/cashier/transactions/{transactionId}/reprint",
     *     summary="Re-print a transaction receipt",
     *     tags={"Cashier"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="transactionId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="Transaction ID"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction data for printing",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Transaction data prepared for printing"),
     *             @OA\Property(property="printData", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Transaction not found"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function reprintTransaction($transactionId)
    {
        try {
            // Get transaction with all related data (same logic as storeTransaction)
            $transaction = \App\Models\CashierTransaction::with([
                'cashier:id,user_login',
                'promoter:id,name',
                'rate:id,name',
                'discounts'
            ])->findOrFail($transactionId);

            // Get tickets for this transaction
            $tickets = \App\Models\CashierTicket::where('transaction_id', $transactionId)
                ->pluck('qr_code')
                ->toArray();

            // Prepare transaction data for frontend printing (same format as storeTransaction)
            $transactionData = [
                'transactionId' => $transaction->id,
                'promoterName' => $transaction->promoter->name ?? 'N/A',
                'rateName' => $transaction->rate->name ?? 'N/A',
                'quantity' => $transaction->quantity,
                'total' => $transaction->total,
                'paidAmount' => $transaction->paid_amount,
                'change' => $transaction->change,
                'cashierName' => $transaction->cashier->user_login ?? 'N/A',
                'sessionId' => $transaction->session_id ?? 'N/A',
                'discounts' => $transaction->discounts->map(function($discount) {
                    return [
                        'discount_name' => $discount->discount_name,
                        'discount_value' => $discount->pivot->discount_value,
                        'discount_value_type' => $discount->discount_value_type ?? 'fixed'
                    ];
                })->toArray(),
                'tickets' => $tickets,
                'createdAt' => $transaction->created_at->toISOString()
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Transaction data prepared for printing',
                'printData' => $transactionData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error preparing transaction for printing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
