<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class StoreOrderDetail extends Model
{
    use HasUlids;
    protected $guarded = [];
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

}
