<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class LocationSuggestion extends Model
{
    use HasUlids;
    protected $table = "warehouse_item_location_suggestions";

    protected $fillable = [
        'product_id',
        'location_id',
        'warehouse_id',
    ];

    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
