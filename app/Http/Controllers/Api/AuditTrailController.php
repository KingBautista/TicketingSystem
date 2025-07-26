<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class AuditTrailController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditTrail::with('user')->latest();

        if ($request->module) {
            $query->where('module', $request->module);
        }

        if ($request->startDate) {
            $query->whereDate('created_at', '>=', $request->startDate);
        }

        if ($request->endDate) {
            $query->whereDate('created_at', '<=', $request->endDate);
        }

        if ($request->user) {
            $query->where('user_id', $request->user);
        }

        return $query->get();
    }

    public function export(Request $request)
    {
        $format = $request->format;
        $data = $request->data;

        if ($format === 'pdf') {
            $pdf = PDF::loadView('exports.audit-trail', ['data' => $data]);
            return $pdf->download('audit-trail.pdf');
        }

        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename=audit-trail.csv',
            ];

            $handle = fopen('php://temp', 'w');
            
            // Add headers
            fputcsv($handle, ['Date/Time', 'User', 'Module', 'Action', 'Description', 'IP Address']);

            // Add data
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row['created_at'],
                    $row['user']['name'],
                    $row['module'],
                    $row['action'],
                    $row['description'],
                    $row['ip_address']
                ]);
            }

            rewind($handle);
            $csv = stream_get_contents($handle);
            fclose($handle);

            return response($csv, 200, $headers);
        }

        return response()->json(['error' => 'Invalid format'], 400);
    }

    public function downloadLogFile(Request $request)
    {
        $date = $request->date ?? now()->format('Y-m-d');
        $logPath = storage_path("logs/audit-{$date}.log");

        if (!file_exists($logPath)) {
            return response()->json(['error' => 'Log file not found'], 404);
        }

        return response()->download($logPath);
    }
}
