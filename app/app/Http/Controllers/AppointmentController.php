<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;

class AppointmentController extends Controller
{
    public function index(): JsonResponse
    {
        $appointments = Appointment::where('user_id', auth()->id())
            ->with('service')
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        return response()->json($appointments);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = Appointment::create([
            ...$request->validated(),
            'user_id' => auth()->id(),
        ]);

        return response()->json($appointment->load('service'), 201);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $this->authorize('update', $appointment);

        $appointment->update($request->validated());

        return response()->json($appointment->load('service'));
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return response()->json(null, 204);
    }
}
