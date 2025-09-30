<?php

use App\Http\Controllers\InboundController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\Master\AccountMappingController;
use App\Http\Controllers\Master\ChartOfAccountController;
use App\Http\Controllers\Master\TransactionTypeController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\RFIDTaggingController;
use App\Http\Controllers\SalesInvoiceController;
use App\Http\Controllers\LocationSuggestionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/inbounds');
})->name('home');

Route::get('/inbound-qc', function () {return Inertia('inbound-qc/index');});
Route::get('/rfid-tagging/manual-input', function () {return Inertia('rfid-tagging/manual-input');});


// Route::resource('/master/transaction-types', TransactionTypeController::class);
// Route::resource('/master/chart-of-accounts', ChartOfAccountController::class);
// Route::resource('/master/account-mappings', AccountMappingController::class);

// RFID Tagging
// Route::get('/rfid-tagging', [RFIDTaggingController::class, 'index'])->name('purchases.index');
// Route::get('/purchases/manual-input', [PurchaseController::class, 'manualInput'])->name('purchases.manual-input');
// Route::post('/purchases/manual-input', [PurchaseController::class, 'storeManualInput']);
// Route::delete('/purchases/{journal_id}', [PurchaseController::class, 'deleteJournal']);
// Route::get('/purchases/manual-input/{journal_id}', [PurchaseController::class, 'detailManualInput']);
// Route::delete('/purchases/manual-input/{journal_id}', [PurchaseController::class, 'deleteManualInput']);

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
Route::get('/rfid-tagging', [RFIDTaggingController::class, 'index' ])->name('rfid-tagging.index');
Route::get('/rfid-tagging/inbound-detail-list', [RFIDTaggingController::class, 'listDetails'])->name('inbound.listDetails');
// Route::get('/journals', [JournalController::class, 'index'])->name('journal.index');

// require __DIR__ . '/settings.php';
// require __DIR__ . '/auth.php';

// Location Suggestion

Route::get('/master/location-suggestions', [LocationSuggestionController::class, 'index'])->name('location-suggestions.index');
Route::post('/master/location-suggestions', [LocationSuggestionController::class, 'save']);
Route::delete('/master/location-suggestions/{id}', [LocationSuggestionController::class, 'delete']);
