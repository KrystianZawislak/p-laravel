# ARTIKULA — Atelier Mowy i Dykcji

> Projekt edukacyjny — nauka Laravel, REST API i bezpieczeństwa webowego (OWASP Top 10) od zera.

Strona landing page dla fikcyjnego salonu logopedycznego w Krakowie. Frontend to single-page HTML z animacją ust opartą na scrollu i systemem rezerwacji. Backend to REST API w Laravelu z autentykacją przez Sanctum.

---

## Stack

| Warstwa | Technologia |
|---|---|
| Backend | PHP 8.5 + Laravel 13.14 |
| Baza danych | MySQL (produkcja) · SQLite (testy) |
| Autentykacja | Laravel Sanctum (cookie SPA) |
| ORM | Eloquent |
| Testy | PHPUnit — 13 testów integracyjnych |
| Frontend | HTML · CSS · JavaScript + jQuery · bez build processu |

---

## Uruchomienie

```bash
cd app
composer install

cp .env.example .env
php artisan key:generate
# uzupełnij DB_DATABASE, DB_USERNAME, DB_PASSWORD w .env

php artisan migrate --seed
php artisan serve --host=0.0.0.0
```

Otwórz `http://localhost:8000`

---

## Testowanie na iPhone / iPad

Logowanie przez Wi-Fi wymaga dodania lokalnego IP Maca do `.env`:

```env
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,127.0.0.1:8000,<IP>,<IP>:8000
```

IP znajdziesz przez: `ipconfig getifaddr en0` — zmienia się przy zmianie sieci.

---

## API

Wszystkie endpointy zaczynają się od `/api/`.

**Publiczne**
```
POST  /register      rejestracja (rate limit: 6/min)
POST  /login         logowanie   (rate limit: 6/min)
GET   /services      lista usług
```

**Wymagają zalogowania**
```
POST    /logout
GET     /user
GET     /appointments
POST    /appointments
PUT     /appointments/{id}
DELETE  /appointments/{id}
```

---

## Testy

```bash
php artisan test
```

13 testów w dwóch plikach — `AuthTest.php` (6) i `AppointmentTest.php` (7). Pokrywają rejestrację, logowanie, CRUD wizyt, walidację danych, autoryzację właściciela i limit 3 wizyt na użytkownika.

---

## Bezpieczeństwo — OWASP Top 10

| ID | Zagrożenie | Zabezpieczenie |
|---|---|---|
| A01 | Broken Access Control | Sanctum middleware + sprawdzanie właściciela przy każdej operacji |
| A02 | Cryptographic Failures | Hasła przez bcrypt (`'password' => 'hashed'`) |
| A03 | Injection | Eloquent ORM — zero surowego SQL |
| A04 | Insecure Design | Limit 3 wizyt, walidacja konfliktów slotów |
| A05 | Security Misconfiguration | `.env` w `.gitignore`, debug off w produkcji |
| A06 | Vulnerable Components | `composer.lock` zablokowane wersje |
| A07 | Authentication Failures | Rate limiting na login i register |
| A08 | Software Integrity | `composer.lock` w repozytorium |
| A09 | Logging Failures | Laravel Log aktywny (`LOG_LEVEL=debug` lokalnie) |
| A10 | SSRF | Brak zewnętrznych requestów serwerowych |

---

## Struktura projektu

```
app/
├── app/Http/Controllers/    AuthController.php · AppointmentController.php
├── app/Models/              User.php · Appointment.php · Service.php
├── database/migrations/     users · appointments · services · sessions
├── routes/api.php           definicje wszystkich endpointów
├── tests/Feature/           AuthTest.php · AppointmentTest.php
└── public/                  index.html · app.js · styles.css · frames/

kompendium/                  dokumentacja projektu w HTML (EN + PL)
```
