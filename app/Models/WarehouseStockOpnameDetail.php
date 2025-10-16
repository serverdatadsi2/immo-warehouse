<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseStockOpnameDetail extends Model
{
    use HasUlids;
    protected $guarded = [];
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }

    public function rfidTag()
    {
        return $this->belongsTo(RFIDTag::class, 'rfid_tag_id');
    }
}
