<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseOutboundDetail extends Model
{
    use HasUlids;

    protected $guarded = [];

    public function header()
    {
        return $this->belongsTo(WarehouseOutbound::class, 'warehouse_outbound_id');
    }

        public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
