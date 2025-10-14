<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Ramsey\Uuid\Uuid;

class Item extends Model
{
    use HasUlids;
    protected $table = "items";

    protected $guarded = [];

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }

    public function rfidTag(): BelongsTo
    {
        return $this->belongsTo(RFIDTag::class, 'rfid_tag_id');
    }

    public function currentCondition(): BelongsTo
    {
        return $this->belongsTo(ItemCondition::class, 'current_condition_id');
    }

    public function warehouse()
    {
        return $this->hasOne(WarehouseStock::class, 'item_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
