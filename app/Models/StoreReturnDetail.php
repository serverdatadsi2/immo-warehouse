<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class StoreReturnDetail extends Model
{
    use HasUlids;
    protected $guarded = [];
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
    public function item()
    {
        return $this->hasMany(Item::class, 'item_id');
    }
}
