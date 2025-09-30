<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class UnitFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->word(),
        ];
    }
}
