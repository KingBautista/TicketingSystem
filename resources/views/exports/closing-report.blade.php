<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Closing Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #047857;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #047857;
            margin: 0;
            font-size: 24px;
        }
        
        .header p {
            margin: 5px 0;
            color: #666;
        }
        
        .filters {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            border-left: 4px solid #047857;
        }
        
        .filters h3 {
            margin: 0 0 10px 0;
            color: #047857;
            font-size: 14px;
        }
        
        .filters p {
            margin: 2px 0;
            font-size: 11px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th {
            background-color: #047857;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }
        
        td {
            padding: 6px 8px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .summary {
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        
        .summary h3 {
            margin: 0 0 10px 0;
            color: #047857;
            font-size: 14px;
        }
        
        .summary p {
            margin: 5px 0;
            font-size: 11px;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Closing Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
    </div>

    @if(!empty($filters) && array_filter($filters))
    <div class="filters">
        <h3>Applied Filters:</h3>
        @if(!empty($filters['cashier']))
            <p><strong>Cashier:</strong> {{ $filters['cashier'] }}</p>
        @endif
        @if(!empty($filters['startDate']))
            <p><strong>Start Date:</strong> {{ $filters['startDate'] }}</p>
        @endif
        @if(!empty($filters['endDate']))
            <p><strong>End Date:</strong> {{ $filters['endDate'] }}</p>
        @endif
        @if(!empty($filters['status']))
            <p><strong>Status:</strong> {{ ucfirst($filters['status']) }}</p>
        @endif
        @if(!empty($filters['search']))
            <p><strong>Search:</strong> {{ $filters['search'] }}</p>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Session ID</th>
                <th>Cashier</th>
                <th>Opened At</th>
                <th>Closed At</th>
                <th class="text-right">Opening Cash</th>
                <th class="text-right">Closing Cash</th>
                <th class="text-right">Total Sales</th>
                <th class="text-center">Transactions</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($sessions as $session)
                @php
                    // Get cashier full name (matching ClosingReportResource logic)
                    $cashierName = 'Unknown';
                    if ($session->cashier) {
                        $userDetails = $session->cashier->user_details;
                        if (isset($userDetails['first_name']) || isset($userDetails['last_name'])) {
                            $firstName = $userDetails['first_name'] ?? '';
                            $lastName = $userDetails['last_name'] ?? '';
                            $cashierName = trim($firstName . ' ' . $lastName);
                        }
                        
                        // Fallback to user_login if no name is set
                        if (empty($cashierName)) {
                            $cashierName = $session->cashier->user_login;
                        }
                    }
                    
                    $totalSales = $session->transactions->sum('total');
                    $totalTransactions = $session->transactions->count();
                @endphp
                <tr>
                    <td>{{ str_pad($session->id, 10, '0', STR_PAD_LEFT) }}</td>
                    <td>{{ $cashierName }}</td>
                    <td>{{ $session->opened_at ? $session->opened_at->format('Y-m-d H:i:s') : '' }}</td>
                    <td>{{ $session->closed_at ? $session->closed_at->format('Y-m-d H:i:s') : '' }}</td>
                    <td class="text-right">{{ number_format($session->cash_on_hand, 2) }}</td>
                    <td class="text-right">{{ number_format($session->closing_cash ?? 0, 2) }}</td>
                    <td class="text-right">{{ number_format($totalSales, 2) }}</td>
                    <td class="text-center">{{ $totalTransactions }}</td>
                    <td>{{ ucfirst($session->status) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px;">No closing session data found for the specified filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        <h3>Report Summary:</h3>
        <p><strong>Total Sessions:</strong> {{ count($sessions) }}</p>
        @if(count($sessions) > 0)
            @php
                $totalOpeningCash = $sessions->sum('cash_on_hand');
                $totalClosingCash = $sessions->sum('closing_cash');
                $totalSales = $sessions->sum(function($session) {
                    return $session->transactions->sum('total');
                });
                $totalTransactions = $sessions->sum(function($session) {
                    return $session->transactions->count();
                });
            @endphp
            <p><strong>Total Opening Cash:</strong> {{ number_format($totalOpeningCash, 2) }}</p>
            <p><strong>Total Closing Cash:</strong> {{ number_format($totalClosingCash, 2) }}</p>
            <p><strong>Total Sales:</strong> {{ number_format($totalSales, 2) }}</p>
            <p><strong>Total Transactions:</strong> {{ $totalTransactions }}</p>
        @endif
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Ticketing System</p>
    </div>
</body>
</html>
