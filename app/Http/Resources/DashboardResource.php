<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'statistics' => [
                'total_transactions' => $this->resource['statistics']['total_transactions'] ?? 0,
                'total_sales' => $this->resource['statistics']['total_sales'] ?? 0,
                'today_transactions' => $this->resource['statistics']['today_transactions'] ?? 0,
                'today_sales' => $this->resource['statistics']['today_sales'] ?? 0,
                'active_sessions' => $this->resource['statistics']['active_sessions'] ?? 0,
                'expiring_vips' => $this->resource['statistics']['expiring_vips'] ?? 0,
            ],
            'cashier_performance' => $this->resource['cashier_performance'] ?? [],
            'today_summary' => $this->resource['today_summary'] ?? [],
        ];
    }
}
