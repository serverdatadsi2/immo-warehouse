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

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
