<?php

namespace Database\Factories;

use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Unit;

class ProductFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->word(),
            'code' => strtoupper($this->faker->unique()->bothify('PRD###??')),
            'unit_id' => Unit::inRandomOrder()->value('id'),
            'category_id' => ProductCategory::inRandomOrder()->value('id'),
            'description' => $this->faker->sentence(),
        ];
    }
}
