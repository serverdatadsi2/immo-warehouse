<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseStagingOutboundDetail extends Model
{
    use HasUlids;

    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function rfid()
    {
        return $this->belongsTo(RFIDTag::class, 'rfid_tag_id', 'id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
