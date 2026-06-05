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
            'patient_name' => ['sometimes', 'string', 'min:2'],
            'date'         => ['sometimes', 'date', 'after_or_equal:today'],
            'time'         => ['sometimes', Rule::in(['09:00', '10:00', '11:00', '13:00', '15:00', '18:00'])],
            'mode'         => ['sometimes', Rule::in(['stacjonarnie', 'online'])],
        ];
    }
}
