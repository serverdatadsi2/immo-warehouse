<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseStagingOutbound extends Model
{
    use HasUlids;

    protected $guarded = [];

    public function detail()
    {
        return $this->hasMany(WarehouseStagingOutboundDetail::class, 'warehouse_staging_outbound_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
