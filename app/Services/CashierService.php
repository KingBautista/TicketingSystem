<?php

namespace App\Services;

use App\Models\CashierSession;
use App\Models\CashierTransaction;
use App\Models\CashierTicket;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CashierService
{
    public function openSession(array $data)
    {
        $session = CashierSession::create([
            'cashier_id' => $data['cashier_id'],
            'cash_on_hand' => $data['cash_on_hand'],
            'opened_at' => Carbon::now(),
            'status' => 'open',
        ]);
        return $session;
    }

    public function closeSession(array $data)
    {
        $session = CashierSession::findOrFail($data['session_id']);
        $session->update([
            'closed_at' => Carbon::now(),
            'closing_cash' => $data['closing_cash'],
            'status' => 'closed',
        ]);
        
        // Refresh the session to get updated data
        $session->refresh();
        
        return $session;
    }

    public function storeTransaction(array $data)
    {
        // Create the transaction
        $transaction = CashierTransaction::create([
            'cashier_id' => $data['cashier_id'],
            'promoter_id' => $data['promoter_id'],
            'rate_id' => $data['rate_id'],
            'quantity' => $data['quantity'],
            'total' => $data['total'],
            'paid_amount' => $data['paid_amount'],
            'change' => $data['change'],
            'session_id' => $data['session_id']
        ]);

        // Attach discounts if any
        if (!empty($data['discounts'])) {
            foreach ($data['discounts'] as $discount) {
                $transaction->discounts()->attach($discount['discount_id'], [
                    'discount_value' => $discount['discount_value']
                ]);
            }
        }

        // Generate tickets with unique QR codes
        for ($i = 0; $i < $data['quantity']; $i++) {
            CashierTicket::create([
                'transaction_id' => $transaction->id,
                'qr_code' => $this->generateQrCode(),
                'note' => $data['note'] ?? 'Single use only',
            ]);
        }

        // Load the discounts relationship before returning
        return $transaction->load('discounts');
    }

    public function getTickets($transactionId)
    {
        return CashierTicket::where('transaction_id', $transactionId)->get();
    }

    protected function generateQrCode()
    {
        return strtoupper(Str::random(20));
    }

    public function getDailyTransactions($cashierId, $sessionId = null)
    {
        $query = CashierTransaction::with(['rate:id,name', 'discounts'])
            ->where('cashier_id', $cashierId)
            ->whereDate('created_at', Carbon::today());
            
        if ($sessionId) {
            $query->where('session_id', $sessionId);
        }
        
        return $query->orderBy('created_at', 'asc')
            ->get();
    }

    public function getTodayTransactions($cashierId)
    {
        return CashierTransaction::with(['rate:id,name', 'promoter:id,name'])
            ->where('cashier_id', $cashierId)
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getSession($id)
    {
        return CashierSession::findOrFail($id);
    }
}
