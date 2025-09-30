<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class RFIDTag extends Model
{
    use HasUlids;
    protected $table = "rfid_tags";

    protected $guarded = [];
    const UPDATED_AT = null;

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }
}
