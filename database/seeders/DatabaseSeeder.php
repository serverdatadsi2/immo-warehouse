<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    // public function run(): void
    // {
    //     $this->call(SalesInvoiceSeeder::class);
    // }

        public function run()
    {
        $this->call(PermissionSeeder::class);

        // User::factory(10)->create();
        // Supplier::factory(5)->create();
        // Warehouse::factory(3)->create();

        // // Seed units & categories terlebih dahulu
        // Unit::factory(5)->create();
        // ProductCategory::factory(5)->create();

        // Product::factory(20)->create();
    }
}
