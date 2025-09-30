<?php

use App\Http\Controllers\InboundController;
use App\Http\Controllers\ReceivingOrderController;
use App\Http\Controllers\RFIDTaggingController;
use App\Http\Controllers\LocationSuggestionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/inbounds');
    } else {
        return redirect('/login');
    }
})->name('home');

// API route untuk mendapatkan data user
Route::middleware(['auth'])->get('/api/user', function (Request $request) {
    return response()->json($request->user());
});

Route::middleware(['auth'])->group(function () {
    Route::get('/inbound-qc', function () {
        return Inertia('inbound-qc/index');
    });
    Route::get('/rfid-tagging/manual-input', function () {
        return Inertia('rfid-tagging/manual-input');
    });

    // Route::resource('/master/transaction-types', TransactionTypeController::class);

    // receiving order
    Route::get('/receiving-order', [ReceivingOrderController::class, 'index'])->name('receiving-order.index');
    Route::get('/receiving-order/detail', [ReceivingOrderController::class, 'detail'])->name('receiving-order.index');

    // Inbound
    Route::get('/inbounds', [InboundController::class, 'index'])->name('inbound.index');
    Route::post('/inbounds', [InboundController::class, 'saveHeader']);
    Route::delete('/inbounds/{header_id}', [InboundController::class, 'deleteHeader']);
    // Inbound Details
    Route::get('/inbounds/detail', [InboundController::class, 'detail'])->name('inbound.detail');
    Route::post('/inbounds/detail', [InboundController::class, 'saveDetail']);
    Route::delete('/inbounds/detail/{detail_id}', [InboundController::class, 'deleteDetail']);

    // RFID Tagging
    Route::post('/rfid-tagging', [RFIDTaggingController::class, 'insertItemStock']);
    Route::post('/items/by-inbound-details', [RFIDTaggingController::class, 'getRFIDItems']);
    Route::post('/rfid-tagging/create-rfid', [RFIDTaggingController::class, 'createRFIDTag']);
    Route::post('/rfid-tagging/generate-rfid-tag', [RFIDTaggingController::class, 'generateRFIDTagItems']);
    Route::get('/rfid-tagging', [RFIDTaggingController::class, 'index'])->name('rfid-tagging.index');
    Route::get('/rfid-tagging/inbound-detail-list', [RFIDTaggingController::class, 'listDetails'])->name('inbound.listDetails');

    // Location Suggestion
    Route::get('/master/location-suggestions', [LocationSuggestionController::class, 'index'])->name('location-suggestions.index');
    Route::post('/master/location-suggestions', [LocationSuggestionController::class, 'save']);
    Route::delete('/master/location-suggestions/{id}', [LocationSuggestionController::class, 'delete']);
});

// require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
