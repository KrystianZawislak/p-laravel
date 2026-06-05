# ARTIKULA — Plan backendu (OWASP Top 10 2025)

> Stan faktyczny (sprawdzony 2026-06-05): **Laravel 13.14**, PHP 8.5 przez Herd (`php85`),
> baza **MySQL 9.6** (Homebrew), sesje w bazie (`SESSION_DRIVER=database`).
> Branch roboczy: `feature/backend-api`.

---

## Założenia architektoniczne

- **Auth: Laravel Sanctum w trybie SPA (cookie-based)**, nie tokeny Bearer.
  Frontend i API są z tej samej domeny (Laravel serwuje `public/*.html`), więc sesja w cookie + CSRF
  jest prostsza i bezpieczniejsza niż token w `localStorage` (token w JS = podatność na XSS).
- API pod prefiksem `/api/*` — `bootstrap/app.php` już ma `shouldRenderJsonWhen(api/*)`, więc błędy
  na API wracają jako JSON.
- SQLite zostaje (działa, wystarcza). Jeśli kiedyś MySQL — zmiana tylko w `.env`.

---

## Kolejność pracy

- [✅] Instalacja Sanctum (`install:api`), powstał `routes/api.php`
- [✅] Migracje: `users` (bez name), `services`, `appointments` — tabele w MySQL
- [✅] `composer.lock` w repo, `.gitignore` poprawiony
- [  ] Modele: `Service`, `Appointment` + relacje w `User`
- [  ] Seeder: wpisanie 6 usług do tabeli `services`
- [  ] Auth: register / login / logout + walidacja + rate limiting
- [  ] CRUD appointments + Policy (Broken Access Control) + walidacja konfliktów
- [  ] Hardening OWASP (nagłówki, logowanie zdarzeń)
- [  ] Testy (Pest/PHPUnit) — auth + access control
- [  ] Podpięcie frontendu (fetch zamiast localStorage)

---

## Kroki instalacyjne (konkrety)

```bash
cd app
php85 artisan install:api        # instaluje Sanctum, tworzy routes/api.php, migrację personal_access_tokens
php85 artisan make:model Appointment -mfc   # model + migracja + factory + controller
php85 artisan make:policy AppointmentPolicy --model=Appointment
php85 artisan make:request StoreAppointmentRequest
php85 artisan make:request UpdateAppointmentRequest
php85 artisan make:request RegisterRequest
php85 artisan make:request LoginRequest
```

W `bootstrap/app.php` (Laravel 11/13 styl) dodać do `withMiddleware`:
```php
$middleware->statefulApi();   // Sanctum SPA — sesja+cookie dla /api/*
```

---

## Endpointy

### Auth (`routes/api.php`, grupa `web`-stateful)
| Metoda | Ścieżka | Opis | Ochrona |
|---|---|---|---|
| GET  | `/sanctum/csrf-cookie` | pobranie CSRF cookie przed loginem | — |
| POST | `/api/register` | rejestracja | `throttle` |
| POST | `/api/login` | logowanie (regeneracja sesji) | `throttle:login` |
| POST | `/api/logout` | wylogowanie (invalidate sesji) | `auth:sanctum` |
| GET  | `/api/user` | dane zalogowanego | `auth:sanctum` |

### Appointments (wszystkie `auth:sanctum`)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET    | `/api/appointments` | lista TYLKO swoich wizyt |
| POST   | `/api/appointments` | utwórz |
| PUT    | `/api/appointments/{appointment}` | edytuj (tylko własną → Policy) |
| DELETE | `/api/appointments/{appointment}` | usuń (tylko własną → Policy) |

Tabela `appointments`: `id, user_id (FK, indexed), service, date (date), time (string/time), mode, timestamps`.
Unikat na konflikt terminu: `unique(date, time)` lub `unique(user_id, date, time)` — do decyzji
(czy slot globalnie zajęty, czy per user). Rekomendacja: **globalnie zajęty** → `unique(date, time)`.

---

## Mapowanie OWASP Top 10 2025 → implementacja

### A01:2025 — Broken Access Control
- **`AppointmentPolicy`**: `view`, `update`, `delete` zwracają `$user->id === $appointment->user_id`.
- W kontrolerze `$this->authorize('update', $appointment)` — NIGDY nie ufać `id` z requestu.
- Listowanie: `Appointment::where('user_id', auth()->id())` — nigdy `Appointment::all()`.
- **Route model binding** (`{appointment}`) + Policy = brak IDOR (numerowanie cudzych ID nic nie da).
- Brak roli „admin" na razie → zero ścieżek omijających własność.

### A02:2025 — Security Misconfiguration
- `.env`: na produkcji `APP_DEBUG=false`, `APP_ENV=production` (teraz `true`/`local` — OK dla dev,
  ale **wpisać do README że na prod musi być false**).
- `.env` poza repo (sprawdzić `.gitignore` — Laravel domyślnie ignoruje).
- `SESSION_ENCRYPT=true` na produkcji + `SESSION_SECURE_COOKIE=true` (cookie tylko po HTTPS).
- Nie eksponować `/storage`, `/vendor`, `.env` przez serwer WWW (Laravel: docroot = `public/`).
- Usunąć nieużywane route'y, wyłączyć `/up` health jeśli nie potrzebne publicznie.
- Nagłówki bezpieczeństwa (middleware): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, CSP (uwaga: jQuery z CDN — CSP musi dopuścić CDN albo zhostować lokalnie).

### A03:2025 — Software Supply Chain Failures
- `composer.lock` w repo (jest) → deterministyczne wersje.
- `php85 artisan about` + `composer audit` — sprawdzać znane CVE w zależnościach.
- **jQuery z CDN**: dodać atrybut `integrity` (SRI hash) + `crossorigin` w `<script>`,
  albo zhostować lokalnie w `public/`. Teraz brak SRI = ryzyko podmiany CDN.
- Minimalizować dev-dependencies na produkcji: `composer install --no-dev --optimize-autoloader`.
- Pinować wersje (już `^` — rozważyć dokładniejsze pinowanie krytycznych pakietów).

### A04:2025 — Cryptographic Failures
- Hasła: bcrypt `BCRYPT_ROUNDS=12` (już ustawione) — `Hash::make()` / `Hashable` cast w modelu User.
- `APP_KEY` ustawiony (jest) — szyfruje sesje/cookie.
- Produkcja: **wymusić HTTPS** (`URL::forceScheme('https')` albo na poziomie serwera) +
  `SESSION_SECURE_COOKIE=true`, `SESSION_HTTP_ONLY=true` (domyślnie true).
- Nie logować haseł / tokenów (patrz A09).
- Email jako unikalny, ale nie traktować jako sekret.

### A05:2025 — Injection
- **Eloquent ORM / Query Builder** wszędzie — zero `DB::raw` z konkatenacją inputu.
- **Form Requests** (`StoreAppointmentRequest` itd.) walidują KAŻDY input zanim dotrze do logiki.
- Walidacja `service` i `time` przez `Rule::in([...])` — tylko wartości z dozwolonej listy
  (jak `SERVICES` / `TIMES` z frontendu), nie dowolny string.
- `date` → reguła `date|after_or_equal:today`.
- Escapowanie wyjścia: API zwraca JSON (auto-escape), Blade `{{ }}` auto-escapuje gdyby był używany.
- Brak `eval`, brak budowania zapytań ze stringów.

### A06:2025 — Insecure Design
- **Walidacja konfliktu terminów po stronie serwera** (nie tylko front): unikat `(date,time)`
  + sprawdzenie w `StoreAppointmentRequest` (`Rule::unique`) → czytelny błąd zamiast wyjątku SQL.
- **Data z przeszłości**: reguła `after_or_equal:today` — egzekwowana na backendzie (front można obejść).
- Rate limiting jako element designu (logowanie, rejestracja) — patrz A07.
- Zasada najmniejszego ujawnienia: API zwraca tylko potrzebne pola (API Resource:
  `AppointmentResource`, `UserResource`) — nie cały model.
- Threat model spisany w tym pliku = świadomy design, nie ad-hoc.

### A07:2025 — Authentication Failures
- Sanctum SPA + regeneracja sesji po logowaniu (`$request->session()->regenerate()`)
  i unieważnienie po wylogowaniu (`invalidate()` + `regenerateToken()`) → ochrona przed session fixation.
- **Rate limiting**: `RateLimiter::for('login', ...)` np. 5 prób / min / (email+IP);
  `throttle:6,1` na register.
- Walidacja hasła: min. długość (np. `Password::min(8)` z `Illuminate\Validation\Rules\Password`),
  rozważyć `->uncompromised()` (sprawdzenie w bazie wycieków HIBP).
- Generyczne komunikaty błędów logowania („Nieprawidłowe dane") — nie zdradzać czy email istnieje.
- `password` w modelu User: w `$hidden` (domyślnie jest) + cast `hashed`.

### A08:2025 — Software or Data Integrity Failures
- CSRF: Sanctum stateful + `/sanctum/csrf-cookie` → każdy POST/PUT/DELETE wymaga `X-XSRF-TOKEN`.
- SRI dla zasobów z CDN (jak w A03).
- `composer.lock` + `composer audit` zapewniają integralność zależności.
- Walidacja danych wejściowych (Form Requests) = brak „zatrutych" danych w bazie.
- Brak deserializacji niezaufanych danych (nie używamy `unserialize` na input).

### A09:2025 — Security Logging and Alerting Failures
- Logowanie zdarzeń bezpieczeństwa: nieudane logowania, przekroczenie throttle,
  odmowy Policy (`AuthorizationException`) — przez `Log::warning(...)` w odpowiednich miejscach
  lub nasłuch eventów `Illuminate\Auth\Events\Failed` / `Lockout`.
- **NIE logować** haseł, tokenów, pełnych danych osobowych.
- `LOG_LEVEL` na produkcji `warning`/`error` (teraz `debug` — OK dla dev).
- Logi z timestampem, IP, user_id (jeśli znany) — by dało się odtworzyć incydent.
- Rozważyć kanał logów oddzielny dla security (`config/logging.php`).

### A10:2025 — Mishandling of Exceptional Conditions
- `bootstrap/app.php` już zwraca JSON dla `api/*` — dopracować handlery:
  - `ModelNotFoundException` / 404 → `{ "message": "Nie znaleziono" }` (nie stacktrace).
  - `ValidationException` → 422 z polami błędów (Laravel robi domyślnie).
  - `AuthorizationException` → 403 generyczny.
  - `AuthenticationException` → 401.
- **`APP_DEBUG=false` na produkcji** → brak wycieku stacktrace/ścieżek/configu w odpowiedzi.
- Try/catch tylko tam gdzie potrafimy sensownie obsłużyć; reszta → globalny handler (fail closed:
  błąd = odmowa dostępu, nie „przepuść").
- Nie zwracać surowych komunikatów SQL/exception userowi.

---

## Frontend — zmiany po backendzie (osobny etap)
- `register.html` / `login.html`: najpierw `GET /sanctum/csrf-cookie`, potem `fetch` POST z `credentials: 'include'`.
- `app.js`: bookingi przez `/api/appointments` zamiast `localStorage`; usunąć blok `artikula_v` + seed.
- Przyciski „Zarezerwuj termin" → „Zaloguj się" gdy brak sesji (sprawdzać `GET /api/user` → 401).
- jQuery z CDN: dodać `integrity`/`crossorigin` (A03/A08) lub zhostować lokalnie.

## Testy (minimalne, do nauki)
- `test_user_can_register`, `test_login_throttled_after_5_attempts`
- `test_user_sees_only_own_appointments` (A01)
- `test_cannot_update_others_appointment_returns_403` (A01)
- `test_cannot_book_past_date_422`, `test_cannot_double_book_slot_422` (A06)
</content>
</invoke>
