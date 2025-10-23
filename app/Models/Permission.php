<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Permission extends SpatiePermission
{
    use HasUuids;
    
    protected $connection = 'db-auth';
    
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->connection = 'db-auth';
    }
}