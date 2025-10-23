<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Role extends SpatieRole
{
    use HasUuids;
    
    protected $connection = 'db-auth';
    
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->connection = 'db-auth';
    }
}