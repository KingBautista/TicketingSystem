<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\SalesReportResource;

class SalesReportController extends Controller
{
    public function index(Request $request)
    {
        // Sample data
        $data = [];
        for ($i = 1; $i <= 30; $i++) {
            $data[] = [
                'id' => $i,
                'cashier' => 'Cashier ' . (($i % 3) + 1),
                'transaction_id' => 'TXN' . (1000 + $i),
                'date' => '2024-06-' . str_pad(($i % 30 + 1), 2, '0', STR_PAD_LEFT),
                'amount' => number_format(mt_rand(1000, 10000) / 100, 2),
            ];
        }
        // Filtering
        $filtered = array_filter($data, function($row) use ($request) {
            return
                (!$request->cashier || $row['cashier'] === $request->cashier) &&
                (!$request->startDate || $row['date'] >= $request->startDate) &&
                (!$request->endDate || $row['date'] <= $request->endDate);
        });
        // Pagination
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        $total = count($filtered);
        $paged = array_slice(array_values($filtered), ($page - 1) * $perPage, $perPage);
        return response()->json([
            'data' => SalesReportResource::collection($paged),
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function export(Request $request)
    {
        // Simulate export
        return response()->json(['message' => 'Export simulated.']);
    }
} 