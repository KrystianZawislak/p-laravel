<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $services = [
            'Terapia jąkania',
            'Wady wymowy',
            'Opóźniony rozwój mowy',
            'Afazja',
            'Terapia głosu',
            'Logopedia dla dzieci',
        ];

        foreach ($services as $name) {
            Service::firstOrCreate(['name' => $name]);
        }
    }
}
