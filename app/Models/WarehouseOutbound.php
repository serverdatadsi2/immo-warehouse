<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseOutbound extends Model
{
    use HasUlids;

    protected $guarded = [];

    public function detail()
    {
        return $this->hasMany(WarehouseOutboundDetail::class, 'warehouse_outbound_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function courier()
    {
        return $this->belongsTo(Courier::class, 'courier_id');
    }

    public function storeOrder()
    {
        return $this->belongsTo(StoreOrder::class, 'order_id');
    }

    public function ecommerceOrder()
    {
        return $this->belongsTo(EcommerceOrder::class, 'order_id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
