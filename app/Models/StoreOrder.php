<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class StoreOrder extends Model
{
    use HasUlids;
    protected $guarded = [];
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
