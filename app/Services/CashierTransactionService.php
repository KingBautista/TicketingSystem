<?php

namespace App\Services;

use App\Models\CashierTransaction;
use App\Models\CashierTransactionDetail;
use App\Http\Resources\CashierTransactionResource;

class CashierTransactionService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new CashierTransactionResource(new CashierTransaction), new CashierTransaction());
    }

    public function storeWithDetails($data)
    {
        $transaction = CashierTransaction::create([
            'cashier_id' => $data['cashier_id'],
            'promoter_id' => $data['promoter_id'] ?? null,
            'rate_id' => $data['rate_id'],
            'quantity' => $data['quantity'],
            'total' => $data['total'],
            'paid_amount' => $data['paid_amount'],
            'change' => $data['change'],
        ]);
        if (!empty($data['discounts'])) {
            foreach ($data['discounts'] as $discount) {
                $transaction->details()->create([
                    'discount_id' => $discount['discount_id'] ?? null,
                    'discount_value' => $discount['discount_value'] ?? 0,
                ]);
            }
        }
        return $transaction->load(['cashier', 'promoter', 'rate', 'details.discount']);
    }
} 