<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class EcommerceOrder extends Model
{
    use HasUlids;
    protected $guarded = [];

    const UPDATED_AT = null;

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
    public function details()
    {
        return $this->hasMany(EcommerceOrderDetail::class, 'ecommerce_order_id', 'id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }

    public function shippingAddress()
    {
        return $this->belongsTo(ShippingAddress::class, 'shipping_address_id');
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class, 'shipping_method_id');
    }
}
