<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class Location extends Model
{
    use HasUlids;
    protected $table = "locations";

    protected $fillable = [
        'location_parent_id',
        'name',
        'type',
        'code',
    ];

    protected $guarded = [];

    public function parent()
    {
        return $this->belongsTo(Location::class, 'location_parent_id');
    }

    public function children()
    {
        return $this->hasMany(Location::class, 'location_parent_id');
    }

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
