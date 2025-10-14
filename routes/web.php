<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    RemoveRFIDController,
    ReceivingOrderController,
    InboundController,
    RFIDTaggingController,
    LocationSuggestionController,
    OutboundController,
    SearchProductController,
    WarehouseQcController,
    WarehouseStorageController,
    PackingController,
    StagingController,
    UserController,
};

// HOME
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('inbound.index')
        : redirect('/login');
})->name('home');

// MAIN AUTH ROUTES
Route::middleware(['auth'])->group(function () {

    // get user for asyncSelectUser component
    Route::get('/users', [UserController::class, "index"])->name('user.index');


    /*
    |--------------------------------------------------------------------------
    | Search Product
    |--------------------------------------------------------------------------
    */
    Route::prefix('search-product')->name('search-product.')->group(function () {
        Route::get('/', [SearchProductController::class, "index"])->name('index');
        Route::get('/warehouse/{rfid}', [SearchProductController::class, 'searchLocationProduct'])->name('searchLocation');
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
    | RFID Tagging
    |--------------------------------------------------------------------------
    */
    Route::prefix('rfid-tagging')->name('rfid-tagging.')->group(function () {
        Route::get('/', [RFIDTaggingController::class, 'index'])->name('index');
        Route::get('/inbound-detail-list', [RFIDTaggingController::class, 'listDetails'])->name('inbound.listDetails');
        Route::post('/', [RFIDTaggingController::class, 'insertItemStock']);
        Route::post('/create-rfid', [RFIDTaggingController::class, 'createRFIDTag']);
        Route::post('/generate-rfid-tag', [RFIDTaggingController::class, 'generateRFIDTagItems']);
        Route::post('/generate-rfid-tag-pdf', [RFIDTaggingController::class, 'generatePdfWithRFID']);
    });

    // Items (by inbound details)
    Route::post('/items/by-inbound-details', [RFIDTaggingController::class, 'getRFIDItems']);

    /*
    |--------------------------------------------------------------------------
    | Remove RFID
    |--------------------------------------------------------------------------
    */
    Route::prefix('remove-rfid')->name('remove-rfid.')->group(function () {
        Route::get("/", [RemoveRFIDController::class, "index"])->name("index");
        Route::get("/check-rfid/{rfidId}", [RemoveRFIDController::class, "checkRfid"])->name('checkRfid');
        Route::post("/remove", [RemoveRFIDController::class, "removeRfid"]);
    });

    /*
    |--------------------------------------------------------------------------
    | Inbound QC
    |--------------------------------------------------------------------------
    */
    Route::prefix('inbound-qc')->name('inbound-qc.')->group(function () {
        Route::get('/', [WarehouseQcController::class, "indexInboundQC"])->name('index');
        Route::post('/reject-labelling', [WarehouseQcController::class, "updateRejectLabelInbounQc"]);
        Route::get('/monitoring-inbound', [WarehouseQcController::class, 'inboundQC'])->name('inboundQC');
    });

    /*
    |--------------------------------------------------------------------------
    | Storage Warehouse
    |--------------------------------------------------------------------------
    */
    Route::prefix('storage-warehouse')->name('storage-warehouse.')->group(function () {
        Route::get('/', [WarehouseStorageController::class,'index'])->name('index');
        Route::get('/assignment',[WarehouseStorageController::class,'listProductUnsignLocation'])->name('listProductUnsignLocation');
        Route::post('/assignment',[WarehouseStorageController::class,'store']);
    });

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
    | Outbound QC
    |--------------------------------------------------------------------------
    */
    Route::prefix('outbound-qc')->name('outbound-qc.')->group(function () {
        Route::get('/', [WarehouseQcController::class, 'indexOutboundQC'])->name('index');
        Route::post('/rejected', [WarehouseQcController::class, 'rejectOutboundQC']);
        Route::get('/monitoring-outbound', [WarehouseQcController::class, 'outboundQC'])->name('outboundQC');
    });

    /*
    |--------------------------------------------------------------------------
    | Packing
    |--------------------------------------------------------------------------
    */
    Route::prefix('packing')->name('packing.')->group(function () {
        Route::get('/', [PackingController::class, 'index'])->name('index');
        Route::patch('/{order_id}/update-status', [PackingController::class, 'updateStatus'])->name('updateStatus');
        // Route::get('/monitoring-outbound', [PackingController::class, 'outboundQC'])->name('outboundQC');
    });

    /*
    |--------------------------------------------------------------------------
    | Staging Area
    |--------------------------------------------------------------------------
    */
    Route::prefix('staging')->name('staging.')->group(function () {
        Route::get('/', [StagingController::class, 'index'])->name('index');
        Route::get('/manual-input', [StagingController::class, 'detail'])->name('detail');
        Route::post('/manual-input', [StagingController::class, 'saveHeader']);
        Route::delete('/manual-input/{header_id}', [StagingController::class, 'deleteHeader']);
        // Route::get('/monitoring-outbound', [PackingController::class, 'outboundQC'])->name('outboundQC');
        Route::post('/manual-input/detail', [StagingController::class, 'saveDetail']);
        Route::delete('/manual-input/detail/{detail_id}', [StagingController::class, 'deleteDetail']);
    });

       // packing orders
    Route::get('/get-all/packing-orders', [OutboundController::class, 'getAllOrderPacking'])->name('getAllOrderPacking');

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
