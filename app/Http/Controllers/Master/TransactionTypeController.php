<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\TransactionType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class TransactionTypeController extends Controller
{
    public function index(Request $request)
    {
        // Gate::authorize('master.profit-scenario.read');

        $pagination = TransactionType::query()
            ->paginate(10);

        return Inertia::render('master/transaction-type/index', [
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

    //     TransactionType::create($request->validate($rules));
    //     return to_route('transaction-types.index');
    // }

    public function update(Request $request, TransactionType $transactionType)
    {
        // Gate::authorize('master.profit-scenario.update');

        $rules = [
            'code' => ['string', 'required'],
            'name' => ['string', 'required'],
            'description' => ['string', 'nullable'],
        ];

        $validated = $request->validate($rules);
        $transactionType->update($validated);
        return to_route('transaction-types.index');
    }

    // public function destroy(TransactionType $transactionType)
    // {
    //     // Gate::authorize('master.profit-scenario.delete');

    //     $transactionType->delete();
    //     return to_route('transaction-types.index');
    // }
}
