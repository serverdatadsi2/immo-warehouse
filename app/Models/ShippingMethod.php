<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;
    protected $table = "ecommerce_order_shipping_methods";

    protected $guarded = [];

    public $incrementing = false;
    protected $keyType = 'string';

}
