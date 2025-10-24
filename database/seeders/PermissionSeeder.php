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
            // 📊 DASHBOARD
            'dashboard.view',

            // 🗺️ LOCATION SUGGESTIONS
            'location_suggestion.create',
            'location_suggestion.view',
            'location_suggestion.update',
            'location_suggestion.delete',

            // 🔍 PRODUCT SEARCH
            'search_product',

            // 🚚 INBOUND (SUPPLIER)
            'inbound.supplier.create',
            'inbound.supplier.view',
            'inbound.supplier.update',
            'inbound.supplier.delete',

            // 🔄 INBOUND (RETURN STORE)
            'inbound.return.write',
            'inbound.return.history',
            'inbound.return.view',

            // 🏷️ RFID TAGGING
            'rfid.tagging',

            // ❌ REMOVE RFID
            'rfid.remove',

            // ✅ INBOUND QC
            'inbound_qc.view',
            'inbound_qc.reject',

            // 🏬 STORAGE / PENYIMPANAN
            'penyimpanan.view',
            'penyimpanan.assign',

            // 📦 STOCK OPNAME
            'stock_opname.view',
            'stock_opname.monitoring',
            'stock_opname.manual_stock_opname',
            'stock_opname.validate',
            'stock_opname.approve',
            'stock_opname.bad_labeling',

            // 🧾 RECEIVING ORDER (STORE)
            'receiving_order.store.view',
            'receiving_order.store.process',

            // 💻 RECEIVING ORDER (ECOMMERCE)
            'receiving_order.ecommerce.view',
            'receiving_order.ecommerce.process',

            // 🚛 OUTBOUND QC
            'outbound_qc.view',
            'outbound_qc.reject',

            // 📦 PACKING (STORE)
            'packing.store.view',
            'packing.store.process',

            // 💻 PACKING (ECOMMERCE)
            'packing.ecommerce.view',
            'packing.ecommerce.process',

            // 📤 OUTBOUND
            'outbound.view',
            'outbound.create',
            'outbound.update',
            'outbound.delete',

            // 🏗️ STAGING
            'staging.view',
            'staging.create',
            'staging.update',
            'staging.delete',

            // ⚙️ ROLE MANAGEMENT
            'role.create',
            'role.view',
            'role.update',
            'role.delete',

            // 👤 USER MANAGEMENT
            'user.create',
            'user.view',
            'user.update',
            'user.delete',
        ];


        // Create permissions with web guard
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // Create default roles and assign permissions
        $superAdminRole = Role::firstOrCreate([
            'name' => 'superadmin',
            'guard_name' => 'web'
        ]);

        // Assign all permissions to admin role
        $superAdminRole->syncPermissions($permissions);
    }
}
