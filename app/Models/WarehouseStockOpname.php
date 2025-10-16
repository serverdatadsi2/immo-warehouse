<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class WarehouseStockOpname extends Model
{
    use HasUlids;
    protected $guarded = [];
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
    public function details()
    {
        return $this->hasMany(WarehouseStockOpnameDetail::class, 'warehouse_stock_opname_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
