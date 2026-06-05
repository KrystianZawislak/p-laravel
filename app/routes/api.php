<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/services', fn() => \App\Models\Service::all(['id', 'name']));

Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    fn(Request $request) => $request->user());

    Route::get('/appointments',         [AppointmentController::class, 'index']);
    Route::post('/appointments',        [AppointmentController::class, 'store']);
    Route::put('/appointments/{appointment}',    [AppointmentController::class, 'update']);
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
});
