<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PrintController extends Controller
{
    /**
     * Print Open Cash Receipt
     */
    public function printOpenCash(Request $request)
    {
        try {
            $request->validate([
                'cashierName' => 'required|string',
                'cashOnHand' => 'required|numeric',
                'sessionId' => 'required|string'
            ]);

            $cashierName = $request->input('cashierName');
            $cashOnHand = $request->input('cashOnHand');
            $sessionId = $request->input('sessionId');

            // Path to the printer script - check if it exists
            $printerScript = base_path('pd300-display/star-final-printer.js');
            
            if (!file_exists($printerScript)) {
                Log::error('Printer script not found', ['path' => $printerScript]);
                return response()->json([
                    'success' => false,
                    'message' => 'Printer script not found',
                    'error' => 'Printer script not found at: ' . $printerScript
                ], 500);
            }
            
            // Try to use Node.js from PATH first, then fallback to full path
            $nodePath = 'node';
            $fullNodePath = 'C:\Program Files\nodejs\node.exe';
            
            // Test if node is available in PATH
            $testOutput = shell_exec('node --version 2>&1');
            if ($testOutput === null || strpos($testOutput, 'not recognized') !== false) {
                // Node.js not in PATH, use full path
                if (!file_exists($fullNodePath)) {
                    Log::error('Node.js not found at expected path', ['path' => $fullNodePath]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Node.js not found',
                        'error' => 'Node.js not found at: ' . $fullNodePath
                    ], 500);
                }
                $nodePath = $fullNodePath;
            }
            
            // Get the directory containing the printer script
            $scriptDir = dirname($printerScript);
            
            // Build the command
            $command = "{$nodePath} \"{$printerScript}\" opencash \"{$cashierName},{$cashOnHand},{$sessionId}\"";
            
            Log::info('Executing printer command', ['command' => $command]);
            
            // Execute the command using shell_exec (similar to CashierController)
            $output = shell_exec($command . ' 2>&1');
            $returnCode = $output !== null ? 0 : 1;

            if ($returnCode === 0 && $output !== null) {
                Log::info('Open cash receipt printed successfully', [
                    'cashierName' => $cashierName,
                    'cashOnHand' => $cashOnHand,
                    'sessionId' => $sessionId,
                    'output' => $output
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Open cash receipt printed successfully',
                    'data' => [
                        'cashierName' => $cashierName,
                        'cashOnHand' => $cashOnHand,
                        'sessionId' => $sessionId
                    ]
                ]);
            } else {
                Log::error('Failed to print open cash receipt', [
                    'cashierName' => $cashierName,
                    'cashOnHand' => $cashOnHand,
                    'sessionId' => $sessionId,
                    'returnCode' => $returnCode,
                    'output' => $output
                ]);

                $errorMessage = $output ?: 'Unknown error occurred';
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to print open cash receipt',
                    'error' => $errorMessage
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Exception while printing open cash receipt', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error printing open cash receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Print Transaction Receipt
     */
    public function printTransaction(Request $request)
    {
        try {
            $request->validate([
                'transactionId' => 'required|integer|exists:cashier_transactions,id',
            ]);

            $transactionId = $request->input('transactionId');

            // Get transaction with all related data
            $transaction = \App\Models\CashierTransaction::with([
                'cashier:id,user_login',
                'promoter:id,name',
                'rate:id,name',
                'discounts',
                'session:id,session_id'
            ])->findOrFail($transactionId);

            // Get tickets for this transaction
            $tickets = \App\Models\CashierTicket::where('transaction_id', $transactionId)
                ->pluck('qr_code')
                ->toArray();

            // Prepare transaction data for printing
            $transactionData = [
                'transactionId' => $transaction->id,
                'promoterName' => $transaction->promoter->name ?? 'N/A',
                'rateName' => $transaction->rate->name ?? 'N/A',
                'quantity' => $transaction->quantity,
                'total' => $transaction->total,
                'paidAmount' => $transaction->paid_amount,
                'change' => $transaction->change,
                'cashierName' => $transaction->cashier->user_login ?? 'N/A',
                'sessionId' => $transaction->session->id ?? 'N/A',
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

            // Path to the printer script - check if it exists
            $printerScript = base_path('pd300-display/star-final-printer.js');
            
            if (!file_exists($printerScript)) {
                Log::error('Printer script not found', ['path' => $printerScript]);
                return response()->json([
                    'success' => false,
                    'message' => 'Printer script not found',
                    'error' => 'Printer script not found at: ' . $printerScript
                ], 500);
            }
            
            // Try to use Node.js from PATH first, then fallback to full path
            $nodePath = 'node';
            $fullNodePath = 'C:\Program Files\nodejs\node.exe';
            
            // Test if node is available in PATH
            $testOutput = shell_exec('node --version 2>&1');
            if ($testOutput === null || strpos($testOutput, 'not recognized') !== false) {
                // Node.js not in PATH, use full path
                if (!file_exists($fullNodePath)) {
                    Log::error('Node.js not found at expected path', ['path' => $fullNodePath]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Node.js not found',
                        'error' => 'Node.js not found at: ' . $fullNodePath
                    ], 500);
                }
                $nodePath = $fullNodePath;
            }
            
            // Write JSON data to a temporary file to avoid command line parsing issues
            $tempJsonFile = base_path('pd300-display/temp_transaction.json');
            file_put_contents($tempJsonFile, json_encode($transactionData));
            
            // Build the command using the temp file
            $command = "{$nodePath} \"{$printerScript}\" transactionfile \"{$tempJsonFile}\"";
            
            Log::info('Executing transaction print command', ['command' => $command]);
            
            // Execute the command using shell_exec
            $output = shell_exec($command . ' 2>&1');
            $returnCode = $output !== null ? 0 : 1;

            if ($returnCode === 0 && $output !== null) {
                Log::info('Transaction printed successfully', [
                    'transactionId' => $transactionId,
                    'output' => $output
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Transaction printed successfully',
                    'data' => [
                        'transactionId' => $transactionId,
                        'ticketsPrinted' => count($tickets)
                    ]
                ]);
            } else {
                Log::error('Failed to print transaction', [
                    'transactionId' => $transactionId,
                    'returnCode' => $returnCode,
                    'output' => $output
                ]);

                $errorMessage = $output ?: 'Unknown error occurred';
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to print transaction',
                    'error' => $errorMessage
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Exception while printing transaction', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error printing transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
