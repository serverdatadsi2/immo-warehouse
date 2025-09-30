<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\AccountMapping;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class AccountMappingController extends Controller
{
    public function index(Request $request)
    {
        // Gate::authorize('master.profit-scenario.read');

        $pagination = AccountMapping::query()
            ->leftJoin("chart_of_accounts as coa", "coa.id", "=", "account_mappings.coa_id")
            ->select([
                'account_mappings.*',
                'coa.name as coa_name',
            ])
            ->paginate(10);

        return Inertia::render('master/account-mapping/index', [
            'pagination' => $pagination,
        ]);
    }

    // public function store(Request $request)
    // {
    //     // Gate::authorize('master.profit-scenario.create');

    //     $rules = [
    //         'code' => ['string', 'required'],
    //         'name' => ['string', 'required'],
    //         'description' => ['string', 'nullable'],
    //     ];

    //     AccountMapping::create($request->validate($rules));
    //     return to_route('account-mappings.index');
    // }

    public function update(Request $request, AccountMapping $accountMapping)
    {
        // Gate::authorize('master.profit-scenario.update');

        $rules = [
            'action' => ['in:debit,credit', 'required'],
            'coa_id' => ['numeric', 'required', 'exists:chart_of_accounts,id'],
            // 'description' => ['string', 'nullable'],
        ];

        $validated = $request->validate($rules);
        $accountMapping->update($validated);
        return to_route('account-mappings.index');
    }

    // public function destroy(AccountMapping $accountMapping)
    // {
    //     // Gate::authorize('master.profit-scenario.delete');

    //     $accountMapping->delete();
    //     return to_route('account-mappings.index');
    // }
}
