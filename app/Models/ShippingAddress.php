<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class ShippingAddress extends Model
{
    use HasUlids;
    protected $table = "ecommerce_order_shipping_addresses";
    protected $guarded = [];

    const UPDATED_AT = null;

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
    public function provincy()
    {
        return $this->belongsTo(Provincy::class, 'province_code', 'code');
    }

    public function regency()
    {
        return $this->belongsTo(Regency::class, 'regency_code', 'code');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_code', 'code');
    }

    public function village()
    {
        return $this->belongsTo(Village::class, 'village_code', 'code');
    }
}
