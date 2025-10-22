<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    RemoveRFIDController,
    ReceivingOrderStoreController,
    ReceivingOrderEcommerceController,
    InboundController,
    RFIDTaggingController,
    LocationSuggestionController,
    OutboundController,
    SearchProductController,
    WarehouseQcController,
    WarehouseStorageController,
    ReturnInboundController,
    StockOpnameController,
    PackingController,
    StagingController,
    DashboardController,
    UserController,
};

// MAIN AUTH ROUTES
Route::middleware(['auth'])->group(function () {

    Route::get('/', [DashboardController::class, "index"])->name('home');

    // get user for asyncSelectUser component
    Route::get('/users', [UserController::class, "index"])->name('user.index');

    /*
    |--------------------------------------------------------------------------
    | Search Product
    |--------------------------------------------------------------------------
    */
    Route::prefix('search-product')->name('search-product.')->group(function () {
        Route::get('/', [SearchProductController::class, "index"])->name('index');
        Route::get('/warehouse', [SearchProductController::class, 'searchLocationProduct'])->name('searchLocation');
    });

    /*
    |--------------------------------------------------------------------------
    | Inbounds
    |--------------------------------------------------------------------------
    */
    Route::prefix('inbounds')->name('inbounds.')->group(function () {
        // Supprier Inbound
        Route::prefix('supplier')->name('supplier.')->group(function () {
            Route::get('/', [InboundController::class, 'index'])->name('index');
            Route::post('/', [InboundController::class, 'saveHeader']);
            Route::delete('/{header_id}', [InboundController::class, 'deleteHeader']);

            // Details
            Route::get('/detail', [InboundController::class, 'detail'])->name('detail');
            Route::post('/detail', [InboundController::class, 'saveDetail']);
            Route::delete('/detail/{detail_id}', [InboundController::class, 'deleteDetail']);
        });

        // Return Store Inbound
        Route::prefix('return-store')->name('return-store.')->group(function () {
            Route::get('/history', [ReturnInboundController::class, 'history'])->name('history');
            Route::get('/', [ReturnInboundController::class, 'index'])->name('index');
            Route::post('/', [ReturnInboundController::class, 'saveHeader']);
            Route::delete('/{header_id}', [ReturnInboundController::class, 'deleteHeader']);

            // // Details
            Route::get('/detail', [ReturnInboundController::class, 'detail'])->name('detail');
            Route::post('/detail', [ReturnInboundController::class, 'saveDetail']);
            Route::post('/compare-return', [ReturnInboundController::class, 'compareMissing']);
            Route::delete('/detail/{detail_id}', [ReturnInboundController::class, 'deleteDetail']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | RFID Tagging
    |--------------------------------------------------------------------------
    */
    Route::prefix('rfid-tagging')->name('rfid-tagging.')->group(function () {
        Route::get('/', [RFIDTaggingController::class, 'index'])->name('index');
        Route::get('/supplier-inbound-detail-list', [RFIDTaggingController::class, 'supplierInboundDetails'])->name('supplierInboundDetails');
        Route::get('/return-inbound-detail-list', [RFIDTaggingController::class, 'returnInboundDetails'])->name('returnInboundDetails');
        Route::post('/', [RFIDTaggingController::class, 'insertItemStock']);
        Route::post('/create-rfid', [RFIDTaggingController::class, 'createRFIDTag']);
        Route::post('/generate-rfid-tag', [RFIDTaggingController::class, 'generateRFIDTagItems']);
        Route::post('/generate-rfid-tag-pdf', [RFIDTaggingController::class, 'generatePdfWithRFIDInboundSupplier']);
        Route::post('/generate-return-rfid-tag-pdf', [RFIDTaggingController::class, 'generatePdfWithRFIDInboundReturn']);
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
        Route::get('/history-inbound', [WarehouseQcController::class, 'historyInbounQC'])->name('historyInbounQC');
        Route::get('/summary-inbound', [WarehouseQcController::class, 'summaryInboundQC'])->name('summaryInboundQC');
        Route::get('/summary-history-inbound', [WarehouseQcController::class, 'summaryHistoryInboundQC'])->name('summaryHistoryInboundQC');
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
        Route::prefix('store-order')->name('store-order.')->group(function () {
            Route::get('/', [ReceivingOrderStoreController::class, 'index'])->name('index');
            Route::patch('/{header_id}/process', [ReceivingOrderStoreController::class, 'updateHeader'])->name('updateHeader');
            Route::get('/detail', [ReceivingOrderStoreController::class, 'detail'])->name('detail');
        });

        Route::prefix('ecommerce-order')->name('ecommerce-order.')->group(function () {
            Route::get('/', [ReceivingOrderEcommerceController::class, 'index'])->name('index');
            Route::patch('/{header_id}/process', [ReceivingOrderEcommerceController::class, 'updateHeader'])->name('updateHeader');
            Route::get('/detail', [ReceivingOrderEcommerceController::class, 'detail'])->name('detail');
        });
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
        Route::prefix('store')->name('store.')->group(function () {
            Route::get('/', [PackingController::class, 'index'])->name('index');
            Route::patch('/{order_id}/update-status', [PackingController::class, 'updateStatus'])->name('updateStatus');
            // Route::get('/monitoring-outbound', [PackingController::class, 'outboundQC'])->name('outboundQC');
        });

        Route::prefix('ecommerce')->name('ecommerce.')->group(function () {
            Route::get('/', [PackingController::class, 'packingEcommerce'])->name('index');
            Route::patch('/{order_id}/update-status', [PackingController::class, 'updateStatusOrderEcommerce'])->name('updateStatus');
            // Route::get('/monitoring-outbound', [PackingController::class, 'outboundQC'])->name('outboundQC');
        });
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

        Route::put('/release/{header_id}', [StagingController::class, 'release']);

        // detail
        Route::post('/manual-input/detail', [StagingController::class, 'saveDetail']);
        Route::delete('/manual-input/detail/{detail_id}', [StagingController::class, 'deleteDetail']);
    });

    // packing orders
    Route::prefix('get-all')->name('get-all.')->group(function () {
        Route::get('/store-packing-orders', [OutboundController::class, 'getStoreOrderPacking'])->name('getStoreOrderPacking');
        Route::get('/ecommerce-packing-orders', [OutboundController::class, 'getEcommerceOrderPacking'])->name('getEcommerceOrderPacking');
    });

    /*
    |--------------------------------------------------------------------------
    | Outbound
    |--------------------------------------------------------------------------
    */
    Route::prefix('outbound')->name('outbound.')->group(function () {
        Route::get('/', [OutboundController::class, 'index'])->name('index');
        Route::post('/', [OutboundController::class, 'saveHeader']);
        Route::delete('/{header_id}', [OutboundController::class, 'deleteHeader']);

        // Details
        Route::get('/detail-outbound/{header_id}', [OutboundController::class, 'detailOutbound'])->name('detailOutbound');
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
    // get all location
    Route::get('/locations', [LocationSuggestionController::class, 'getLocationByUser'])->name('get-all-location-by-user');

    /*
    |--------------------------------------------------------------------------
    | Stock Opname
    |--------------------------------------------------------------------------
    */
    Route::prefix('stock-opname')->name('stock-opname.')->group(function () {
        Route::get('/', [StockOpnameController::class, 'index'])->name('index');
        Route::get('/detail', [StockOpnameController::class, 'detail'])->name('detail');
        Route::get('/monitoring', [StockOpnameController::class, 'monitoring'])->name('monitoring');
        Route::put('/{stockOpnameId}/process', [StockOpnameController::class, 'updateStockOpnameStatus'])->name('updateStockOpnameStatus');
        Route::post('/manual-stock-opname', [StockOpnameController::class, 'manualStockOpname'])->name('manualStockOpname');
        Route::post('/update-stock', [StockOpnameController::class, 'updateStock'])->name('updateStock');
        Route::post('/bad-condition-item', [StockOpnameController::class, 'updateItemCondition'])->name('updateItemCondition');
    });
});


// require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
