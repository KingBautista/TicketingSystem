<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Navigation;

class NavigationSeeder extends Seeder
{
    public function run(): void
    {
        // Clear the table before seeding (using delete to avoid foreign key constraints)
        Navigation::query()->delete();

        // Create parent navigations first
        $parents = [
            'user_management' => Navigation::create([
                'name' => 'User Management',
                'slug' => 'user-management',
                'icon' => 'fi-br-user',
                'parent_id' => null,
                'active' => 1,
                'show_in_menu' => 1
            ]),
            // 'content_management' => Navigation::create([
            //     'name' => 'Content Management',
            //     'slug' => 'content-management',
            //     'icon' => 'fi-br-file',
            //     'parent_id' => null,
            //     'active' => 1,
            //     'show_in_menu' => 1
            // ]),
            'vip_management' => Navigation::create([
                'name' => 'VIP Management',
                'slug' => 'vip-management',
                'icon' => 'fi-br-star',
                'parent_id' => null,
                'active' => 1,
                'show_in_menu' => 1
            ]),
            'rate_management' => Navigation::create([
                'name' => 'Rate Management',
                'slug' => 'rate-management',
                'icon' => 'fi-br-dollar',
                'parent_id' => null,
                'active' => 1,
                'show_in_menu' => 1
            ]),
            'promoter_management' => Navigation::create([
                'name' => 'Promoter Management',
                'slug' => 'promoter-management',
                'icon' => 'fi-br-badge',
                'parent_id' => null,
                'active' => 1,
                'show_in_menu' => 1
            ]),
            'reports' => Navigation::create([
                'name' => 'Reports',
                'slug' => 'reports',
                'icon' => 'fi-br-chart-pie',
                'parent_id' => null,
                'active' => 1,
                'show_in_menu' => 1
            ]),
            'system_settings' => Navigation::create([
                'name' => 'System Settings',
                'slug' => 'system-settings',
                'icon' => 'fi-br-settings',
                'parent_id' => null,
                'active' => 1,
                'show_in_menu' => 1
            ])
        ];

        // Create child navigations
        $navigations = [
            // User Management Children
            [
                'name' => 'All Users',
                'slug' => 'user-management/users',
                'icon' => 'fi-br-user',
                'parent_id' => $parents['user_management']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],
            [
                'name' => 'Permission Settings',
                'slug' => 'user-management/roles',
                'icon' => 'fi-br-shield-check',
                'parent_id' => $parents['user_management']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],

            // Content Management Children
            // [
            //     'name' => 'Media Library',
            //     'slug' => 'content-management/media-library',
            //     'icon' => 'fi-br-file',
            //     'parent_id' => $parents['content_management']->id,
            //     'active' => 1,
            //     'show_in_menu' => 1
            // ],

            // VIP Management Children
            [
                'name' => 'All VIPs',
                'slug' => 'vip-management/vips',
                'icon' => 'fi-br-star-octogram',
                'parent_id' => $parents['vip_management']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],

            // Rate Management Children
            [
                'name' => 'All Rates',
                'slug' => 'rate-management/rates',
                'icon' => 'fi-br-hastag',
                'parent_id' => $parents['rate_management']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],
            [
                'name' => 'All Discounts',
                'slug' => 'rate-management/discounts',
                'icon' => 'fi-br-calculator',
                'parent_id' => $parents['rate_management']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],

            // Promoter Management Children
            [
                'name' => 'All Promoters',
                'slug' => 'promoter-management/promoters',
                'icon' => 'fi-br-id-badge',
                'parent_id' => $parents['promoter_management']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],

            // Reports Children
            [
                'name' => 'Sales Reports',
                'slug' => 'reports/sales',
                'icon' => 'fi-br-chart-connected',
                'parent_id' => $parents['reports']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],

            // Cashier Portal (standalone)
            // [
            //     'name' => 'Cashier',
            //     'slug' => 'cashier',
            //     'icon' => 'fi-br-credit-card',
            //     'parent_id' => null,
            //     'active' => 1,
            //     'show_in_menu' => 1
            // ],

            // System Settings Children
            [
                'name' => 'Navigation',
                'slug' => 'system-settings/navigation',
                'icon' => 'fi-br-list',
                'parent_id' => $parents['system_settings']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],
            [
                'name' => 'Audit Trail',
                'slug' => 'system-settings/audit-trail',
                'icon' => 'fi-br-document',
                'parent_id' => $parents['system_settings']->id,
                'active' => 1,
                'show_in_menu' => 1
            ],
        ];

        // Create child navigations
        foreach ($navigations as $navigation) {
            Navigation::create($navigation);
        }
    }
} 