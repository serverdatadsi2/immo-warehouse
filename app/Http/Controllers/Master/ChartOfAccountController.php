<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ChartOfAccountController extends Controller
{
    public function index(Request $request)
    {
        // Gate::authorize('master.profit-scenario.read');

        $pagination = ChartOfAccount::query()
            ->paginate(10);

        return Inertia::render('master/chart-of-account/index', [
            'pagination' => $pagination,
        ]);
    }

    public function store(Request $request)
    {
        // Gate::authorize('master.profit-scenario.create');

        $rules = [
            'parent_id' => [
                'numeric',
                'exists:chart_of_accounts,id',
            ],
            'code' => ['string', 'required'],
            'name' => ['string', 'required'],
            'type' => ['in:asset,liability,equity,revenue,expense', 'required'],
            'is_header' => ['boolean', 'nullable'],
        ];

        ChartOfAccount::create($request->validate($rules));
        return to_route('chart-of-accounts.index');
    }

    public function update(Request $request, ChartOfAccount $chartOfAccount)
    {
        // Gate::authorize('master.profit-scenario.update');

        $rules = [
            'parent_id' => [
                'numeric',
                'exists:chart_of_accounts,id',
            ],
            'code' => ['string', 'required'],
            'name' => ['string', 'required'],
            'type' => ['in:asset,liability,equity,revenue,expense', 'required'],
            'is_header' => ['boolean', 'nullable'],
        ];

        $validated = $request->validate($rules);
        $chartOfAccount->update($validated);
        return to_route('chart-of-accounts.index');
    }

    public function destroy(ChartOfAccount $chartOfAccount)
    {
        // Gate::authorize('master.profit-scenario.delete');

        $chartOfAccount->delete();
        return to_route('chart-of-accounts.index');
    }
}
