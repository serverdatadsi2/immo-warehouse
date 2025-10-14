<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    ConditionApiController,
    CourierApiController,
    ProductApiController,
    SupplierApiController,
    WarehouseApiController,
    LocationApiController
};

Route::apiResource('/suppliers', SupplierApiController::class);
Route::apiResource('/warehouses', WarehouseApiController::class);
Route::apiResource('/products', ProductApiController::class);
Route::apiResource('/conditions', ConditionApiController::class);
Route::get('/locations', [LocationApiController::class, 'index']);
Route::get('/couriers', [CourierApiController::class, 'index']);
