<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseInboundDetail extends Model
{
    use HasUlids;

    protected $table = "warehouse_inbound_details";

    protected $guarded = [];

    public function inbound()
    {
        return $this->belongsTo(WarehouseInbound::class, 'warehouse_inbound_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
