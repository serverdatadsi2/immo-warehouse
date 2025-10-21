<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provincy extends Model
{
    use HasFactory;
    protected $table = "provinces";

    protected $guarded = [];

    public $incrementing = false;
    protected $keyType = 'string';

}
