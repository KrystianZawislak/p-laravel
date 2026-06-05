# ARTIKULA — Journal

## Jak odpalić projekt

### Na komputerze (tylko przeglądarka)
```bash
cd pronunciation-laravel/app
php85 artisan serve
# otwórz http://127.0.0.1:8000
```

### Na telefonie / tablecie (ten sam WiFi)
```bash
cd pronunciation-laravel/app
php85 artisan serve --host=0.0.0.0 --port=8000
# na telefonie wejdź na http://<IP-komputera>:8000
# IP znajdziesz przez: ifconfig | grep "inet " (Mac)
```

Safari może pokazać "niezabezpieczone" — to normalne, ignoruj, to tylko lokalne HTTP.

---

## Stack

- **Frontend**: HTML + CSS + vanilla JS + jQuery 3.7.1 (CDN)
- **Backend (Laravel)**: PHP 8.5 przez Herd (`php85`), binarki w `/Users/krystianzawislak/Library/Application Support/Herd/bin/`
- **Composer**: pełna ścieżka `/Users/krystianzawislak/Library/Application Support/Herd/bin/composer`
- **Storage**: `localStorage` (tymczasowo, do backendu)
- **Pliki frontendowe**: `app/public/` (index.html, app.js, styles.css)
- **Routing Laravel**: `app/routes/web.php` serwuje index.html, login.html, register.html

---

## Znane problemy

### Przyciski nawigacyjne — niekończące się poprawki
Trudno ustawić offsety scrollowania żeby działały dobrze na wszystkich urządzeniach jednocześnie (iPhone, iPad pionowo, iPad poziomo, desktop). Szczególnie:
- sekcja "Usługi" — trzeba odejmować wysokość marquee od offsetu
- sekcja "Kontakt" — offset stale do korekty
- karty usług 04–05–06 ucięte na iPad landscape (fix: `rootMargin` w IntersectionObserver)

Breakpointy hamburgera / nav-links zmieniane kilka razy — ostatecznie zostało `≤1080px`.

### Formularz rezerwacji na mobile
Pole data + forma (inline grid) nie łapało iPada portrait (768px > 720px breakpoint). Fix: rozszerzyć media query do `≤900px`.

### Przyciski "Zarezerwuj termin" dla niezalogowanych
**TODO na backend** — w PHP/Blade zamieniać przyciski na "Zaloguj się" gdy user nie jest zalogowany. Nie robić w JS, bo i tak to zostanie przepisane.

---

## Decyzje architektoniczne

- `localStorage` jako mock auth do czasu backendu (`artikula_user`)
- Seed bookings usunięte, jednorazowe czyszczenie przez wersję `artikula_v = '2'`
- Tilt kart (3D mousemove) wyłączony na touch devices — był źródłem lagów na mobile
- Float animation wyłączona na mobile (`≤720px`) — też poprawia płynność
- `IntersectionObserver` threshold `0.06` + `rootMargin: 0px 0px 120px 0px` — żeby sekcje pojawiały się zanim dotrze do nich scroll

---

## Git

- Remote: `https://github.com/KrystianZawislak/p-laravel.git`
- Struktura: `main → develop → feature/frontend-auth`
- Frontend skończony i zmergowany do `develop` (squash commit `2b06ebf`)
- Nowy branch na backend: `feature/backend-api` z developu

---

## Backend — co trzeba zbudować

### Stan obecny
- Laravel 11 zainstalowany, działa, serwuje pliki HTML z `public/`
- Baza danych: MySQL (przez Herd), jeszcze nie skonfigurowana
- Auth: brak — frontend używa `localStorage` jako mocka

### Do zrobienia

#### 1. Konfiguracja
- Ustawić `.env` — połączenie z MySQL (Herd tworzy bazę automatycznie)
- Baza: `artikula` (lub inna nazwa, byle w `.env`)

#### 2. Auth — Laravel Sanctum
- `php85 artisan install:api` (instaluje Sanctum w Laravel 11)
- Endpointy: `POST /api/register`, `POST /api/login`, `POST /api/logout`
- Tabela `users`: `id, name, email, password, timestamps`
- Po zalogowaniu zwraca token (Sanctum SPA lub token-based)
- Frontend: podmienić `localStorage` na prawdziwe wywołania API

#### 3. Rezerwacje (Appointments) — CRUD
- Tabela `appointments`: `id, user_id, service, date, time, mode, timestamps`
- Endpointy (chronione Sanctum `auth:sanctum`):
  - `GET    /api/appointments` — lista wizyt zalogowanego usera
  - `POST   /api/appointments` — utwórz wizytę
  - `PUT    /api/appointments/{id}` — edytuj (tylko własne)
  - `DELETE /api/appointments/{id}` — usuń (tylko własne)
- Walidacja konfliktu terminów (ten sam date+time już zajęty)
- Walidacja: data nie może być z przeszłości

#### 4. OWASP Top 10 2025 — planowane zabezpieczenia
- **Broken Access Control** — policy/gate żeby user widział tylko swoje wizyty
- **Injection** — Eloquent ORM (brak raw SQL)
- **Cryptographic Failures** — bcrypt dla haseł (Laravel default)
- **Rate Limiting** — `throttle:api` na endpointach auth
- **Security Misconfiguration** — `.env` nie w repo, `APP_DEBUG=false` na prod
- **CSRF** — Sanctum obsługuje dla SPA, tokeny dla API
- **Sensitive Data** — nie zwracać `password` w JSON (hidden w modelu)

#### 5. Frontend — zmiany po dodaniu backendu
- `login.html` / `register.html`: fetch do `POST /api/login` i `/api/register` zamiast localStorage
- `app.js`: fetch do `/api/appointments` zamiast localStorage dla bookingów
- Przyciski "Zarezerwuj termin" → "Zaloguj się" gdy brak sesji (robić server-side w Blade lub sprawdzać token w JS)
- Usunąć cały blok `artikula_v` i seed z app.js

### Kolejność pracy
1. `.env` + migracje (`users`, `appointments`)
2. Auth (register/login/logout) + testy w Postmanie
3. CRUD appointments z walidacją
4. Zabezpieczenia OWASP
5. Podpięcie frontendu
