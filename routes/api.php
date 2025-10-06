<?php

use App\Http\Controllers\Api\ConditionApiController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Controllers\Api\SupplierApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\WarehouseApiController;
use App\Http\Controllers\Api\LocationApiController;
use Illuminate\Support\Facades\Route;

Route::apiResource('/suppliers', SupplierApiController::class);
Route::apiResource('/users', UserApiController::class);
Route::apiResource('/warehouses', WarehouseApiController::class);
Route::apiResource('/products', ProductApiController::class);
Route::apiResource('/conditions', ConditionApiController::class);
Route::get('/locations', [LocationApiController::class, 'index']);
