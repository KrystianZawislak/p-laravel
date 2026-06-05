<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id'   => ['required', 'exists:services,id'],
            'patient_name' => ['required', 'string', 'min:2'],
            'date'         => ['required', 'date', 'after_or_equal:today'],
            'time'         => ['required', Rule::in(['09:00', '10:00', '11:00', '13:00', '15:00', '18:00'])],
            'mode'         => ['required', Rule::in(['stacjonarnie', 'online'])],
        ];
    }
}
