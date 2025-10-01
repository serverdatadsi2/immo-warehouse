<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    ReceivingOrderController,
    InboundController,
    RFIDTaggingController,
    LocationSuggestionController,
    OutboundController
};

// HOME
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('inbound.index')
        : redirect('/login');
})->name('home');

// MAIN AUTH ROUTES
Route::middleware(['auth'])->group(function () {

    // Pages
    Route::get('/inbound-qc', fn () => Inertia::render('inbound-qc/index'));

    /*
    |--------------------------------------------------------------------------
    | Receiving Order
    |--------------------------------------------------------------------------
    */
    Route::prefix('receiving-order')->name('receiving-order.')->group(function () {
        Route::get('/', [ReceivingOrderController::class, 'index'])->name('index');
        Route::patch('/{header_id}/process', [ReceivingOrderController::class, 'updateHeader'])->name('updateHeader');
        Route::get('/detail', [ReceivingOrderController::class, 'detail'])->name('detail');
    });

    /*
    |--------------------------------------------------------------------------
    | Inbounds
    |--------------------------------------------------------------------------
    */
    Route::prefix('inbounds')->name('inbound.')->group(function () {
        Route::get('/', [InboundController::class, 'index'])->name('index');
        Route::post('/', [InboundController::class, 'saveHeader']);
        Route::delete('/{header_id}', [InboundController::class, 'deleteHeader']);

        // Details
        Route::get('/detail', [InboundController::class, 'detail'])->name('detail');
        Route::post('/detail', [InboundController::class, 'saveDetail']);
        Route::delete('/detail/{detail_id}', [InboundController::class, 'deleteDetail']);
    });

    /*
    |--------------------------------------------------------------------------
    | Outbound
    |--------------------------------------------------------------------------
    */
    Route::prefix('outbound')->name('outbound')->group(function () {
        Route::get('/', [OutboundController::class, 'index'])->name('index');
        Route::post('/', [OutboundController::class, 'saveHeader']);
        Route::delete('/{header_id}', [OutboundController::class, 'deleteHeader']);

        // Details
        Route::get('/detail', [OutboundController::class, 'detail'])->name('detail');
        Route::post('/detail', [OutboundController::class, 'saveDetail']);
        Route::delete('/detail/{detail_id}', [OutboundController::class, 'deleteDetail']);
    });

    /*
    |--------------------------------------------------------------------------
    | RFID Tagging
    |--------------------------------------------------------------------------
    */
    Route::prefix('rfid-tagging')->name('rfid-tagging.')->group(function () {
        Route::get('/', [RFIDTaggingController::class, 'index'])->name('index');
        Route::get('/inbound-detail-list', [RFIDTaggingController::class, 'listDetails'])->name('inbound.listDetails');
        Route::post('/', [RFIDTaggingController::class, 'insertItemStock']);
        Route::post('/create-rfid', [RFIDTaggingController::class, 'createRFIDTag']);
        Route::post('/generate-rfid-tag', [RFIDTaggingController::class, 'generateRFIDTagItems']);
    });

    // Items (by inbound details)
    Route::post('/items/by-inbound-details', [RFIDTaggingController::class, 'getRFIDItems']);

    /*
    |--------------------------------------------------------------------------
    | Master - Location Suggestions
    |--------------------------------------------------------------------------
    */
    Route::prefix('master')->group(function () {
        Route::prefix('location-suggestions')->name('location-suggestions.')->group(function () {
            Route::get('/', [LocationSuggestionController::class, 'index'])->name('index');
            Route::post('/', [LocationSuggestionController::class, 'save']);
            Route::delete('/{id}', [LocationSuggestionController::class, 'delete']);
        });
    });
});


// require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
