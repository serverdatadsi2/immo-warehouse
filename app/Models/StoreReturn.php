<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class StoreReturn extends Model
{
    use HasUlids;
    protected $guarded = [];
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
    public function details()
    {
        return $this->hasMany(StoreReturnDetail::class, 'store_return_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function approved()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // public function warehouse()
    // {
    //     return $this->belongsTo(Warehouse::class, 'warehouse_id');
    // }
}
