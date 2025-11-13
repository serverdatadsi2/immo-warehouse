<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    WarehouseStorageApiController,
    ReturnInboundApiController,
    StagingApiController,
    ConditionApiController,
    CourierApiController,
    ProductApiController,
    SupplierApiController,
    WarehouseApiController,
    LocationApiController,
    QCApiController
};

Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('/suppliers', SupplierApiController::class);
    Route::apiResource('/warehouses', WarehouseApiController::class);
    Route::apiResource('/products', ProductApiController::class);
    Route::apiResource('/conditions', ConditionApiController::class);
    Route::get('/locations', [LocationApiController::class, 'index']);
    Route::get('/couriers', [CourierApiController::class, 'index']);


    // handheld reader
    Route::post('/storage/assignment', [WarehouseStorageApiController::class, 'assignment']);

    Route::post('/staging-area/header', [StagingApiController::class, 'saveHeader']);
    Route::post('/staging-area/detail', [StagingApiController::class, 'saveDetail']);

    Route::post('/return-inbound/header', [ReturnInboundApiController::class, 'saveHeader']);
    Route::post('/return-inbound/detail', [ReturnInboundApiController::class, 'saveDetail']);
});

// fixed reader el-uhf-rc4-91
Route::post('/inbound-qc', [QCApiController::class, 'inboundQc']);
Route::post('/outbound-qc', [QCApiController::class, 'outboundQc']);
