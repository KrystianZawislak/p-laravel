<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id'   => ['sometimes', 'exists:services,id'],
            'patient_name' => ['sometimes', 'string', 'min:2', 'max:100'],
            'date'         => ['sometimes', 'date', 'after_or_equal:today'],
            'time'         => ['sometimes', Rule::in(['09:00', '10:00', '11:00', '13:00', '15:00', '18:00'])],
            'mode'         => ['sometimes', Rule::in(['stacjonarnie', 'online'])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $date = $this->date ?? $this->route('appointment')->date;
            $time = $this->time ?? $this->route('appointment')->time;

            $taken = \App\Models\Appointment::where('date', $date)
                ->where('time', $time)
                ->where('id', '!=', $this->route('appointment')->id)
                ->exists();

            if ($taken) {
                $validator->errors()->add('time', 'Ten termin jest już zajęty.');
            }
        });
    }
}
