<?php

namespace Database\Seeders;

use App\Models\AccountMapping;
use App\Models\ChartOfAccount;
use App\Models\TransactionType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SalesInvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // $salesInvoiceTransaction = TransactionType::create([
        //     'code' => 'sales_invoice',
        //     'name' => 'Sales Invoice',
        // ]);

        $salesHeaderCoa = ChartOfAccount::create([
            'code' => '400-000',
            'name' => 'Piutang Penjualan',
            'type' => 'revenue',
            'is_header' => true,
        ]);

        $penjualanCoa = ChartOfAccount::create([
            'code' => '401-000',
            'name' => 'Penjualan',
            'type' => 'revenue',
            'parent_id' => $salesHeaderCoa->id,
            // 'is_header' => true,
        ]);

        // $penjualanCoa = ChartOfAccount::create([
        //     'code' => '100-000',
        //     'name' => 'Penjualan',
        //     'type' => 'revenue',
        // ]);

        $piutangCoa = ChartOfAccount::create([
            'code' => '101-000',
            'name' => 'Piutang Penjualan',
            'type' => 'revenue',
        ]);

        $diskonCoa = ChartOfAccount::create([
            'code' => '102-000',
            'name' => 'Diskon Penjualan',
            'type' => 'revenue',
        ]);

        $ppnCoa = ChartOfAccount::create([
            'code' => '103-000',
            'name' => 'PPn Keluaran',
            'type' => 'revenue',
        ]);

        $uangMukaCoa = ChartOfAccount::create([
            'code' => '104-000',
            'name' => 'Uang Muka Penjualan',
            'type' => 'revenue',
        ]);

        AccountMapping::create([
            'transaction_type' => 'sales_invoice',
            'coa_id' => $piutangCoa->id,
            'action' => 'debit',
            'purpose' => 'Piutang Penjualan',
        ]);

        AccountMapping::create([
            'transaction_type' => 'sales_invoice',
            'coa_id' => $diskonCoa->id,
            'action' => 'debit',
            'purpose' => 'Diskon Penjualan',
        ]);

        AccountMapping::create([
            'transaction_type' => 'sales_invoice',
            'coa_id' => $ppnCoa->id,
            'action' => 'credit',
            'purpose' => 'PPn Keluaran',
        ]);

        AccountMapping::create([
            'transaction_type' => 'sales_invoice',
            'coa_id' => $uangMukaCoa->id,
            'action' => 'credit',
            'purpose' => 'Uang Muka Penjualan',
        ]);

        AccountMapping::create([
            'transaction_type' => 'sales_invoice',
            'coa_id' => $penjualanCoa->id,
            'action' => 'credit',
            'purpose' => 'Penjualan',
        ]);
    }
}
