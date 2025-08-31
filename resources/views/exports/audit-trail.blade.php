<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Audit Trail Report</title>
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
    </style>
</head>
<body>
    <div class="header">
        <h1>Audit Trail Report</h1>
        <p>Generated on: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
        <p>TicketingSystem - Security & Compliance</p>
    </div>

    @if(!empty($filters))
    <div class="filters">
        <h3>Applied Filters:</h3>
        @if(isset($filters['module']) && $filters['module'])
            <p><strong>Module:</strong> {{ $filters['module'] }}</p>
        @endif
        @if(isset($filters['action']) && $filters['action'])
            <p><strong>Action:</strong> {{ $filters['action'] }}</p>
        @endif
        @if(isset($filters['user_id']) && $filters['user_id'])
            <p><strong>User ID:</strong> {{ $filters['user_id'] }}</p>
        @endif
        @if(isset($filters['start_date']) && $filters['start_date'])
            <p><strong>Start Date:</strong> {{ $filters['start_date'] }}</p>
        @endif
        @if(isset($filters['end_date']) && $filters['end_date'])
            <p><strong>End Date:</strong> {{ $filters['end_date'] }}</p>
        @endif
        @if(isset($filters['search']) && $filters['search'])
            <p><strong>Search:</strong> {{ $filters['search'] }}</p>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Date/Time</th>
                <th>User</th>
                <th>Module</th>
                <th>Action</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>User Agent</th>
            </tr>
        </thead>
        <tbody>
            @forelse($auditTrails as $auditTrail)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($auditTrail->created_at)->format('Y-m-d H:i:s') }}</td>
                    <td>
                        @php
                            $firstName = $auditTrail->first_name ?? '';
                            $lastName = $auditTrail->last_name ?? '';
                            $fullName = trim($firstName . ' ' . $lastName);
                            $userName = $fullName ?: ($auditTrail->user_login ?? 'Unknown');
                        @endphp
                        {{ $userName }}
                    </td>
                    <td>{{ $auditTrail->module }}</td>
                    <td>{{ $auditTrail->action }}</td>
                    <td style="max-width: 200px; word-wrap: break-word;">{{ $auditTrail->description }}</td>
                    <td>{{ $auditTrail->ip_address }}</td>
                    <td style="max-width: 150px; word-wrap: break-word; font-size: 7px;">{{ $auditTrail->user_agent }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">No audit trail data found for the specified filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        <h3>Report Summary:</h3>
        <p><strong>Total Records:</strong> {{ count($auditTrails) }}</p>
        <p><strong>Date Range:</strong> 
            @if(isset($filters['start_date']) && isset($filters['end_date']))
                {{ $filters['start_date'] }} to {{ $filters['end_date'] }}
            @else
                All available records
            @endif
        </p>
        @if(count($auditTrails) > 0)
            <p><strong>First Record:</strong> {{ \Carbon\Carbon::parse($auditTrails->first()->created_at)->format('Y-m-d H:i:s') }}</p>
            <p><strong>Last Record:</strong> {{ \Carbon\Carbon::parse($auditTrails->last()->created_at)->format('Y-m-d H:i:s') }}</p>
        @endif
    </div>
</body>
</html>
