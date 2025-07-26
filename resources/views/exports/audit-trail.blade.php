<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Audit Trail Report</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
        h1 {
            text-align: center;
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Audit Trail Report</h1>
    <p>Generated on: {{ now()->format('Y-m-d H:i:s') }}</p>
    
    <table>
        <thead>
            <tr>
                <th>Date/Time</th>
                <th>User</th>
                <th>Module</th>
                <th>Action</th>
                <th>Description</th>
                <th>IP Address</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
                <tr>
                    <td>{{ $row['created_at'] }}</td>
                    <td>{{ $row['user']['name'] }}</td>
                    <td>{{ $row['module'] }}</td>
                    <td>{{ $row['action'] }}</td>
                    <td>{{ $row['description'] }}</td>
                    <td>{{ $row['ip_address'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
