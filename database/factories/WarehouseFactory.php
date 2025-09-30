<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WarehouseFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => 'Warehouse ' . $this->faker->city(),
            'address' => $this->faker->address(),
            'code' => strtoupper($this->faker->unique()->bothify('G###??')),
        ];
    }
}
