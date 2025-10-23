<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all the required permissions based on the features
        $permissions = [
            // Dashboard
            'view-dashboard',
            
            // Location Suggestion
            'create-location-suggestion',
            'view-location-suggestion',
            'update-location-suggestion',
            'delete-location-suggestion',
            
            // Search Product
            'search-product',
            
            // Inbound Supplier
            'create-inbound-supplier',
            'view-inbound-supplier',
            'update-inbound-supplier',
            
            // Inbound Return
            'create-inbound-return',
            'view-inbound-return',
            'update-inbound-return',
            
            // RFID Tagging Inbound Supplier
            'tag-inbound-supplier',
            
            // RFID Tagging Inbound Return
            'tag-inbound-return',
            
            // Remove RFID
            'remove-rfid',
            
            // Inbound QC
            'process-inbound-qc',
            
            // Penyimpanan / Putaway
            'view-putaway',
            'process-putaway',
            
            // Stock Opname
            'view-stock-opname',
            'process-stock-opname',
            
            // Receiving Order Store
            'view-receiving-order-store',
            'process-receiving-order-store',
            
            // Receiving Order Ecommerce
            'view-receiving-order-ecommerce',
            'process-receiving-order-ecommerce',
            
            // Outbound QC
            'process-outbound-qc',
            
            // Packing Order Store
            'view-packing-order-store',
            'process-packing-order-store',
            
            // Packing Order Ecommerce
            'view-packing-order-ecommerce',
            'process-packing-order-ecommerce',
            
            // Outbound
            'view-outbound',
            'process-outbound',
            
            // Staging
            'process-staging',
            
            // Manajemen Role
            'create-role',
            'view-role',
            'update-role',
            'delete-role',
            'assign-permission',
            
            // Manajemen User
            'create-user',
            'view-user',
            'update-user',
            'delete-user',
            'assign-role',
            'assign-warehouse',
        ];

        // Create permissions with web guard
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // Create default roles and assign permissions
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);

        // Assign all permissions to admin role
        $adminRole->syncPermissions($permissions);

        // Create other roles as needed
        $managerRole = Role::firstOrCreate([
            'name' => 'manager',
            'guard_name' => 'web'
        ]);

        // Assign a subset of permissions to manager role
        $managerPermissions = [
            'view-dashboard',
            'view-location-suggestion',
            'search-product',
            'view-inbound-supplier',
            'view-inbound-return',
            'view-putaway',
            'view-stock-opname',
            'view-receiving-order-store',
            'view-receiving-order-ecommerce',
            'process-outbound-qc',
            'view-packing-order-store',
            'view-packing-order-ecommerce',
            'view-outbound',
            'process-staging',
        ];
        $managerRole->syncPermissions($managerPermissions);

        $operatorRole = Role::firstOrCreate([
            'name' => 'operator',
            'guard_name' => 'web'
        ]);

        // Assign a subset of permissions to operator role
        $operatorPermissions = [
            'view-dashboard',
            'search-product',
            'tag-inbound-supplier',
            'tag-inbound-return',
            'remove-rfid',
            'process-inbound-qc',
            'process-putaway',
            'process-stock-opname',
            'process-receiving-order-store',
            'process-receiving-order-ecommerce',
            'process-outbound-qc',
            'process-packing-order-store',
            'process-packing-order-ecommerce',
            'process-outbound',
            'process-staging',
        ];
        $operatorRole->syncPermissions($operatorPermissions);
    }
}