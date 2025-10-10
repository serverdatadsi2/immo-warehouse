<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class LocationHistory extends Model
{
    use HasFactory;
    protected $table = "item_location_histories";

    protected $guarded = [];
    const UPDATED_AT = null;

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }

}
