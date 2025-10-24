<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #333;
            font-size: 18px;
        }
        .header p {
            margin: 5px 0;
            font-size: 10px;
            color: #666;
        }
        .filters {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .filters h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            color: #333;
        }
        .filters p {
            margin: 2px 0;
            font-size: 9px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 8px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .summary {
            margin-top: 20px;
            padding: 10px;
            background-color: #f0f8ff;
            border-radius: 5px;
        }
        .summary h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            color: #333;
        }
        .summary p {
            margin: 2px 0;
            font-size: 9px;
        }
        .page-break {
            page-break-before: always;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sales Report</h1>
        <p>Generated on: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
        <p>TicketingSystem - Sales Management</p>
    </div>

    @if(!empty($filters))
    <div class="filters">
        <h3>Applied Filters:</h3>
        @if(isset($filters['cashier']) && $filters['cashier'])
            <p><strong>Cashier:</strong> {{ $filters['cashier'] }}</p>
        @endif
        @if(isset($filters['promoter']) && $filters['promoter'])
            <p><strong>Promoter:</strong> {{ $filters['promoter'] }}</p>
        @endif
        @if(isset($filters['rate']) && $filters['rate'])
            <p><strong>Rate:</strong> {{ $filters['rate'] }}</p>
        @endif
        @if(isset($filters['startDate']) && $filters['startDate'])
            <p><strong>Start Date:</strong> {{ $filters['startDate'] }}</p>
        @endif
        @if(isset($filters['endDate']) && $filters['endDate'])
            <p><strong>End Date:</strong> {{ $filters['endDate'] }}</p>
        @endif
        @if(isset($filters['search']) && $filters['search'])
            <p><strong>Search:</strong> {{ $filters['search'] }}</p>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Transaction ID</th>
                <th>Cashier</th>
                <th>Promoter</th>
                <th>Rate</th>
                <th>Quantity</th>
                <th class="text-right">Total Amount</th>
                <th class="text-right">Paid Amount</th>
                <th class="text-right">Change</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $transaction)
                @php
                    // Get cashier full name (matching SalesReportResource logic)
                    $cashierName = 'Unknown';
                    if ($transaction->cashier) {
                        $userDetails = $transaction->cashier->user_details;
                        if (isset($userDetails['first_name']) || isset($userDetails['last_name'])) {
                            $firstName = $userDetails['first_name'] ?? '';
                            $lastName = $userDetails['last_name'] ?? '';
                            $cashierName = trim($firstName . ' ' . $lastName);
                        }
                        
                        // Fallback to user_login if no name is set
                        if (empty($cashierName)) {
                            $cashierName = $transaction->cashier->user_login;
                        }
                    }
                @endphp
                <tr>
                    <td>{{ str_pad($transaction->id, 10, '0', STR_PAD_LEFT) }}</td>
                    <td>{{ $cashierName }}</td>
                    <td>{{ $transaction->promoter_name ?? 'N/A' }}</td>
                    <td>{{ $transaction->rate_name ?? 'N/A' }}</td>
                    <td class="text-center">{{ $transaction->quantity }}</td>
                    <td class="text-right">{{ number_format($transaction->total, 2) }}</td>
                    <td class="text-right">{{ number_format($transaction->paid_amount, 2) }}</td>
                    <td class="text-right">{{ number_format($transaction->change, 2) }}</td>
                    <td>{{ \Carbon\Carbon::parse($transaction->created_at)->format('Y-m-d') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px;">No sales data found for the specified filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        <h3>Report Summary:</h3>
        <p><strong>Total Transactions:</strong> {{ count($transactions) }}</p>
        <p><strong>Total Amount:</strong> {{ number_format($transactions->sum('total'), 2) }}</p>
        <p><strong>Total Quantity:</strong> {{ $transactions->sum('quantity') }}</p>
        <p><strong>Average Transaction:</strong> {{ count($transactions) > 0 ? number_format($transactions->avg('total'), 2) : '0.00' }}</p>
        <p><strong>Date Range:</strong> 
            @if(isset($filters['startDate']) && isset($filters['endDate']))
                {{ $filters['startDate'] }} to {{ $filters['endDate'] }}
            @else
                All available records
            @endif
        </p>
        @if(count($transactions) > 0)
            <p><strong>First Transaction:</strong> {{ \Carbon\Carbon::parse($transactions->first()->created_at)->format('Y-m-d H:i:s') }}</p>
            <p><strong>Last Transaction:</strong> {{ \Carbon\Carbon::parse($transactions->last()->created_at)->format('Y-m-d H:i:s') }}</p>
        @endif
    </div>
</body>
</html> 