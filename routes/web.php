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
    PermissionController,
    RoleController,
    MenuController
};

// MAIN AUTH ROUTES
Route::middleware(['auth'])->group(function () {

    Route::get('/', [DashboardController::class, "index"])->name('home')->middleware('permission:dashboard.view');

    Route::prefix('system')->name('system.')->group(function () {
        Route::prefix('roles')->name('roles.')->group(function () {
            Route::get('/list', [RoleController::class, 'roleList'])->name('roleList');
            Route::get('/', [RoleController::class, 'index'])->name('index')->middleware('permission:role.view');
            Route::get('/create', [RoleController::class, 'create'])->name('create')->middleware('permission:role.create');
            Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit')->middleware('permission:role.update');
            Route::post('/', [RoleController::class, 'save'])->middleware('permission:role.create|role.update');
            Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:role.delete');
        });

        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/list', [UserController::class, 'userList'])->name('userList');
            Route::get('/', [UserController::class, 'index'])->name('index')->middleware('permission:user.view');
            Route::post('/', [UserController::class, 'save'])->middleware('permission:user.update|user.create');
            Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:user.delete');
        });
    });

    // Route::resource('permissions', PermissionController::class)->only(['index']);

    /*
    |--------------------------------------------------------------------------
    | Search Product
    |--------------------------------------------------------------------------
    */
    Route::prefix('search-product')->name('search-product.')->middleware('permission:search_product')->group( function () {
        Route::get('/', [SearchProductController::class, "index"])->name('index');
        Route::get('/warehouse', [SearchProductController::class, 'searchLocationProduct']);
    });

    /*
    |--------------------------------------------------------------------------
    | Inbounds
    |--------------------------------------------------------------------------
    */
    Route::prefix('inbounds')->name('inbounds.')->group(function () {
        // Supprier Inbound
        Route::prefix('supplier')->name('supplier.')->middleware('permission:inbound.supplier.view')->group(function () {
            Route::get('/', [InboundController::class, 'index'])->name('index');
            Route::post('/', [InboundController::class, 'saveHeader'])->middleware('permission:inbound.supplier.create|inbound.supplier.update');
            Route::delete('/{header_id}', [InboundController::class, 'deleteHeader'])->middleware('permission:inbound.supplier.delete');

            // Details
            Route::get('/detail', [InboundController::class, 'detail'])->name('detail');
            Route::post('/detail', [InboundController::class, 'saveDetail'])->middleware('permission:inbound.supplier.create|inbound.supplier.update');
            Route::delete('/detail/{detail_id}', [InboundController::class, 'deleteDetail'])->middleware('permission:inbound.supplier.delete');
        });

        // Return Store Inbound
        Route::prefix('return-store')->name('return-store.')->middleware('permission:inbound.return.view')->group(function () {
            Route::get('/history', [ReturnInboundController::class, 'history'])->name('history')->middleware('permission:inbound.return.history');
            Route::get('/', [ReturnInboundController::class, 'index'])->name('index');
            Route::post('/', [ReturnInboundController::class, 'saveHeader'])->middleware('permission:inbound.return.write');
            Route::delete('/{header_id}', [ReturnInboundController::class, 'deleteHeader'])->middleware('permission:inbound.return.write');

            // // Details
            Route::get('/detail', [ReturnInboundController::class, 'detail'])->name('detail');
            Route::post('/detail', [ReturnInboundController::class, 'saveDetail'])->middleware('permission:inbound.return.write');
            Route::post('/compare-return', [ReturnInboundController::class, 'compareMissing'])->middleware('permission:inbound.return.write');
            Route::delete('/detail/{detail_id}', [ReturnInboundController::class, 'deleteDetail'])->middleware('permission:inbound.return.write');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | RFID Tagging
    |--------------------------------------------------------------------------
    */
    Route::prefix('rfid-tagging')->name('rfid-tagging.')->middleware('permission:rfid.tagging')->group(function () {
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
    Route::prefix('remove-rfid')->name('remove-rfid.')->middleware('permission:rfid.remove')->group(function () {
        Route::get("/", [RemoveRFIDController::class, "index"])->name("index");
        Route::get("/check-rfid/{rfidId}", [RemoveRFIDController::class, "checkRfid"])->name('checkRfid');
        Route::post("/remove", [RemoveRFIDController::class, "removeRfid"]);
    });

    /*
    |--------------------------------------------------------------------------
    | Inbound QC
    |--------------------------------------------------------------------------
    */
    Route::prefix('inbound-qc')->name('inbound-qc.')->middleware('permission:inbound_qc.view')->group(function () {
        Route::get('/', [WarehouseQcController::class, "indexInboundQC"])->name('index');
        Route::post('/reject-labelling', [WarehouseQcController::class, "updateRejectLabelInbounQc"])->middleware('permission:inbound_qc.reject');
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
    Route::prefix('storage-warehouse')->name('storage-warehouse.')->middleware('permission:penyimpanan.view')->group(function () {
        Route::get('/', [WarehouseStorageController::class,'index'])->name('index');
        Route::get('/assignment',[WarehouseStorageController::class,'listProductUnsignLocation'])->name('listProductUnsignLocation');
        Route::post('/assignment',[WarehouseStorageController::class,'store'])->middleware('permission:penyimpanan.assign');
    });

    /*
    |--------------------------------------------------------------------------
    | Receiving Order
    |--------------------------------------------------------------------------
    */
    Route::prefix('receiving-order')->name('receiving-order.')->group(function () {
        Route::prefix('store-order')->name('store-order.')->middleware('permission:receiving_order.store.view')->group(function () {
            Route::get('/', [ReceivingOrderStoreController::class, 'index'])->name('index');
            Route::patch('/{header_id}/process', [ReceivingOrderStoreController::class, 'updateHeader'])->name('updateHeader')->middleware('permission:receiving_order.store.process');
            Route::get('/detail', [ReceivingOrderStoreController::class, 'detail'])->name('detail');
        });

        Route::prefix('ecommerce-order')->name('ecommerce-order.')->middleware('permission:receiving_order.ecommerce.view')->group(function () {
            Route::get('/', [ReceivingOrderEcommerceController::class, 'index'])->name('index');
            Route::patch('/{header_id}/process', [ReceivingOrderEcommerceController::class, 'updateHeader'])->name('updateHeader')->middleware('permission:receiving_order.ecommerce.process');
            Route::get('/detail', [ReceivingOrderEcommerceController::class, 'detail'])->name('detail');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Outbound QC
    |--------------------------------------------------------------------------
    */
    Route::prefix('outbound-qc')->name('outbound-qc.')->middleware('permission:outbound_qc.view')->group(function () {
        Route::get('/', [WarehouseQcController::class, 'indexOutboundQC'])->name('index');
        Route::post('/rejected', [WarehouseQcController::class, 'rejectOutboundQC'])->middleware('permission:outbound_qc.reject');
        Route::get('/monitoring-outbound', [WarehouseQcController::class, 'outboundQC'])->name('outboundQC');
    });

    /*
    |--------------------------------------------------------------------------
    | Packing
    |--------------------------------------------------------------------------
    */
    Route::prefix('packing')->name('packing.')->group(function () {
        Route::prefix('store')->name('store.')->middleware('permission:packing.store.view')->group(function () {
            Route::get('/', [PackingController::class, 'index'])->name('index');
            Route::patch('/{order_id}/update-status', [PackingController::class, 'updateStatus'])->name('updateStatus')->middleware('permission:packing.store.process');
            // Route::get('/monitoring-outbound', [PackingController::class, 'outboundQC'])->name('outboundQC');
        });

        Route::prefix('ecommerce')->name('ecommerce.')->middleware('permission:packing.ecommerce.view')->group(function () {
            Route::get('/', [PackingController::class, 'packingEcommerce'])->name('index');
            Route::patch('/{order_id}/update-status', [PackingController::class, 'updateStatusOrderEcommerce'])->name('updateStatus')->middleware('permission:packing.ecommerce.process');
            // Route::get('/monitoring-outbound', [PackingController::class, 'outboundQC'])->name('outboundQC');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Staging Area
    |--------------------------------------------------------------------------
    */
    Route::prefix('staging')->name('staging.')->middleware('permission:staging.view')->group(function () {
        Route::get('/', [StagingController::class, 'index'])->name('index');
        Route::get('/manual-input', [StagingController::class, 'detail'])->name('detail');
        Route::post('/manual-input', [StagingController::class, 'saveHeader'])->middleware('permission:staging.create');
        Route::delete('/manual-input/{header_id}', [StagingController::class, 'deleteHeader'])->middleware('permission:staging.delete');

        Route::put('/release/{header_id}', [StagingController::class, 'release'])->middleware('permission:staging.update');

        // detail
        Route::post('/manual-input/detail', [StagingController::class, 'saveDetail'])->middleware('permission:staging.create|staging.update');
        Route::delete('/manual-input/detail/{detail_id}', [StagingController::class, 'deleteDetail'])->middleware('permission:staging.delete');
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
    Route::prefix('outbound')->name('outbound.')->middleware('permission:outbound.view')->group(function () {
        Route::get('/', [OutboundController::class, 'index'])->name('index');
        Route::post('/', [OutboundController::class, 'saveHeader'])->middleware('permission:outbound.create|outbound.update');
        Route::delete('/{header_id}', [OutboundController::class, 'deleteHeader'])->middleware('permission:outbound.delete');

        // Details
        Route::get('/detail-outbound/{header_id}', [OutboundController::class, 'detailOutbound'])->name('detailOutbound');
        Route::get('/detail', [OutboundController::class, 'detail'])->name('detail');
        Route::post('/detail', [OutboundController::class, 'saveDetail'])->middleware('permission:outbound.update|outbound.create');
        Route::delete('/detail/{detail_id}', [OutboundController::class, 'deleteDetail'])->middleware('permission:outbound.delete');

    });

    /*
    |--------------------------------------------------------------------------
    | Master - Location Suggestions
    |--------------------------------------------------------------------------
    */
    Route::prefix('master')->group(function () {
        Route::prefix('location-suggestions')->name('location-suggestions.')->middleware('permission:location_suggestion.view')->group(function () {
            Route::get('/', [LocationSuggestionController::class, 'index'])->name('index');
            Route::post('/', [LocationSuggestionController::class, 'save'])->middleware('permission:location_suggestion.create|location_suggestion.update');
            Route::delete('/{id}', [LocationSuggestionController::class, 'delete'])->middleware('permission:location_suggestion.delete');
        });
    });
    // get all location
    Route::get('/locations', [LocationSuggestionController::class, 'getLocationByUser'])->name('get-all-location-by-user');
    Route::get('/all-menu-counts', [MenuController::class, 'counts'])->name('counts');

    /*
    |--------------------------------------------------------------------------
    | Stock Opname
    |--------------------------------------------------------------------------
    */
    Route::prefix('stock-opname')->name('stock-opname.')->middleware('permission:stock_opname.view')->group(function () {
        Route::get('/', [StockOpnameController::class, 'index'])->name('index');
        Route::get('/detail', [StockOpnameController::class, 'detail'])->name('detail');
        Route::get('/monitoring', [StockOpnameController::class, 'monitoring'])->name('monitoring')->middleware('permission:stock_opname.monitoring');
        Route::put('/{stockOpnameId}/process', [StockOpnameController::class, 'updateStockOpnameStatus'])->name('updateStockOpnameStatus')->middleware('permission:stock_opname.validate');
        Route::post('/manual-stock-opname', [StockOpnameController::class, 'manualStockOpname'])->name('manualStockOpname')->middleware('permission:stock_opname.manual_stock_opname');
        Route::post('/update-stock', [StockOpnameController::class, 'updateStock'])->name('updateStock')->middleware('permission:stock_opname.approve');
        Route::post('/bad-condition-item', [StockOpnameController::class, 'updateItemCondition'])->name('updateItemCondition')->middleware('permission:stock_opname.bad_labeling');
    });
});


// require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
