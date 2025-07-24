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
        return $session;
    }

    public function storeTransaction(array $data)
    {
        $transaction = CashierTransaction::create($data);
        // Generate tickets with unique QR codes
        for ($i = 0; $i < $data['quantity']; $i++) {
            CashierTicket::create([
                'transaction_id' => $transaction->id,
                'qr_code' => $this->generateQrCode(),
                'note' => $data['note'] ?? 'Single use only',
            ]);
        }
        return $transaction;
    }

    public function getTickets($transactionId)
    {
        return CashierTicket::where('transaction_id', $transactionId)->get();
    }

    protected function generateQrCode()
    {
        return strtoupper(Str::random(20));
    }
}
