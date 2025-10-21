<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseStagingOutboundDetail extends Model
{
    use HasUlids;
    const UPDATED_AT = null;
    const CREATED_AT = null;

    protected $guarded = [];

    public function outbound()
    {
        return $this->belongsTo(WarehouseOutbound::class, 'warehouse_outbound_id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
