<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EcommercePayment extends Model
{
    use HasFactory;
    // protected $table = "ecomerce_payments";

    protected $guarded = [];

    public $incrementing = false;
    protected $keyType = 'string';

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }

}
