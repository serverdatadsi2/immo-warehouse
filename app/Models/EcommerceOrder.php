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
}
