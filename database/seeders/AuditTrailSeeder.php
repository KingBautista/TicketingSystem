<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AuditTrail;
use App\Models\User;
use Carbon\Carbon;

class AuditTrailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $modules = [
            'User Management',
            'Cashier',
            'Rate Management',
            'Promoter Management',
            'VIP Management',
            'Sales Report',
            'System Settings'
        ];
        
        $actions = [
            'CREATE',
            'UPDATE',
            'DELETE',
            'RESTORE',
            'VIEW',
            'LOGIN',
            'LOGOUT',
            'EXPORT',
            'BULK_DELETE',
            'BULK_RESTORE',
            'PASSWORD_RESET',
            'PASSWORD_VALIDATION'
        ];

        $descriptions = [
            'Created new user account',
            'Updated user profile information',
            'Deleted user account',
            'Restored deleted user account',
            'Viewed user list',
            'User logged in successfully',
            'User logged out',
            'Exported user data to CSV',
            'Bulk deleted multiple users',
            'Bulk restored multiple users',
            'Password reset requested',
            'Password validation performed',
            'Opened cashier session',
            'Closed cashier session',
            'Created new transaction',
            'Viewed transaction details',
            'Updated rate information',
            'Created new discount',
            'Updated promoter schedule',
            'Viewed sales report',
            'Exported audit trail',
            'Viewed system settings'
        ];

        $ipAddresses = [
            '192.168.1.100',
            '192.168.1.101',
            '192.168.1.102',
            '10.0.0.50',
            '10.0.0.51',
            '172.16.0.10',
            '172.16.0.11'
        ];

        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
        ];

        // Generate audit trail records for the last 30 days
        for ($i = 0; $i < 500; $i++) {
            $user = $users->random();
            $module = $modules[array_rand($modules)];
            $action = $actions[array_rand($actions)];
            $description = $descriptions[array_rand($descriptions)];
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $userAgent = $userAgents[array_rand($userAgents)];
            
            // Generate random date within last 30 days
            $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            AuditTrail::create([
                'user_id' => $user->id,
                'module' => $module,
                'action' => $action,
                'description' => $description,
                'old_value' => null,
                'new_value' => null,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);
        }

        // Add some specific audit records for better testing
        $this->createSpecificAuditRecords($users);
    }

    private function createSpecificAuditRecords($users)
    {
        $specificRecords = [
            [
                'user_id' => $users->first()->id,
                'module' => 'User Management',
                'action' => 'CREATE',
                'description' => 'Created new user: admin (admin@example.com)',
                'old_value' => null,
                'new_value' => ['user_login' => 'admin', 'user_email' => 'admin@example.com'],
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subDays(5)->subHours(2)
            ],
            [
                'user_id' => $users->first()->id,
                'module' => 'Cashier',
                'action' => 'CREATE',
                'description' => 'Created transaction: P500.00 for 2 tickets',
                'old_value' => null,
                'new_value' => ['total' => 500.00, 'quantity' => 2],
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subDays(3)->subHours(1)
            ],
            [
                'user_id' => $users->first()->id,
                'module' => 'Rate Management',
                'action' => 'UPDATE',
                'description' => 'Updated rate: Regular Ticket from P200 to P250',
                'old_value' => ['name' => 'Regular Ticket', 'price' => 200.00],
                'new_value' => ['name' => 'Regular Ticket', 'price' => 250.00],
                'ip_address' => '192.168.1.102',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subDays(2)->subHours(3)
            ],
            [
                'user_id' => $users->first()->id,
                'module' => 'VIP Management',
                'action' => 'CREATE',
                'description' => 'Created new VIP member: John Doe',
                'old_value' => null,
                'new_value' => ['name' => 'John Doe', 'membership_type' => 'Premium'],
                'ip_address' => '10.0.0.50',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subDays(1)->subHours(4)
            ],
            [
                'user_id' => $users->first()->id,
                'module' => 'System Settings',
                'action' => 'EXPORT',
                'description' => 'Exported audit trail as PDF (150 items as PDF)',
                'old_value' => null,
                'new_value' => ['format' => 'PDF', 'count' => 150],
                'ip_address' => '10.0.0.51',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(2)
            ]
        ];

        foreach ($specificRecords as $record) {
            AuditTrail::create($record);
        }
    }
} 