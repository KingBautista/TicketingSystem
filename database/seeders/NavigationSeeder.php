<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Navigation;

class NavigationSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate the table before seeding
        Navigation::truncate();

        // Data from navigation-2.sql (id, name, slug, icon, parent_id, active, show_in_menu)
        $rows = [
            [1, 'User Management', 'user-management', 'cil-group', null, 1, 1],
            [2, 'All Users', 'user-management/users', '', 1, 1, 1],
            [3, 'Permission Settings', 'user-management/roles', '', 1, 1, 1],
            [4, 'Content Management', 'content-management', 'cil-tags', null, 1, 1],
            [5, 'Media Library', 'content-management/media-library', '', 4, 1, 1],
            [6, 'Add Media File', 'content-management/media-library/upload', '', 4, 1, 1],
            [7, 'System Settings', 'system-settings', 'cil-settings', null, 1, 1],
            [8, 'Navigation', 'system-settings/navigation', '', 7, 1, 1],
            [9, 'Profile', 'profile', '', null, 0, 1],
        ];

        // Map old id to new id for parent_id references
        $idMap = [];
        foreach ($rows as $row) {
            [$oldId, $name, $slug, $icon, $parentOldId, $active, $showInMenu] = $row;
            $parentId = $parentOldId ? ($idMap[$parentOldId] ?? null) : null;
            $nav = Navigation::create([
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'parent_id' => $parentId,
                'active' => $active,
                'show_in_menu' => $showInMenu,
            ]);
            $idMap[$oldId] = $nav->id;
        }
    }
} 