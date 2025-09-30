<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseInbound extends Model
{
    use HasUlids;
    protected $table = "warehouse_inbounds";

    protected $guarded = [];

    public function inboundDetail()
    {
        return $this->hasMany(WarehouseInboundDetail::class, 'warehouse_inbound_id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
