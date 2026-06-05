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

- Branch roboczy: `feature/frontend-auth`
- Remote: `https://github.com/KrystianZawislak/p-laravel.git`
- Struktura: `main → develop → feature/frontend-auth`
