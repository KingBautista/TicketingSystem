<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MediaLibrary;

class MediaLibrarySeeder extends Seeder
{
    public function run(): void
    {
        // Clear the table before seeding (using delete to avoid foreign key constraints)
        MediaLibrary::query()->delete();

        $mediaItems = [
            [
                'name' => 'Default Banner',
                'file_name' => 'default-banner.jpg',
                'file_type' => 'image/jpeg',
                'file_size' => 0,
                'path' => 'media/default-banner.jpg',
                'description' => 'Default banner image',
                'active' => true
            ],
            [
                'name' => 'Default Logo',
                'file_name' => 'default-logo.png',
                'file_type' => 'image/png',
                'file_size' => 0,
                'path' => 'media/default-logo.png',
                'description' => 'Default logo image',
                'active' => true
            ]
        ];

        foreach ($mediaItems as $item) {
            MediaLibrary::create($item);
        }
    }
}
