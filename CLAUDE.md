# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ARTIKULA** is a landing page website for a speech therapy salon in Kraków, Poland. It's a client-side only single-page application with no backend, build process, or dependencies beyond CDN-loaded jQuery.

The site is hosted as static HTML and features:
- Animated hero section with scroll-driven canvas animation (lips frames)
- Service cards showcase with 3D tilt effects
- Testimonials, stats, and methodology sections
- Booking system (appointments) with CRUD operations
- Polish language content

## Stack & Dependencies

- **HTML5** — semantic markup, no frameworks
- **CSS3** — vanilla, no preprocessor (see `styles.css` for design tokens and layout)
- **JavaScript** — vanilla JS + jQuery 3.7.1 (CDN)
- **Storage** — browser `localStorage` (bookings persist client-side only)
- **Design System** — CSS custom properties (see `:root` in `styles.css`), warm beige/rose color palette, Cormorant Garamond (serif) + Hanken Grotesk (sans-serif) fonts

## How to Run

No build step required. Simply open `index.html` in a browser or serve the directory with any static file server:

```bash
# Option 1: Open directly (limited to file:// protocol)
open pronunciation-laravel-blade/index.html

# Option 2: Serve via Python
python3 -m http.server 8000 --directory pronunciation-laravel-blade/

# Option 3: Serve via Node (if http-server installed)
npx http-server pronunciation-laravel-blade/ -p 8000
```

Then visit `http://localhost:8000` (or `file://` path).

## File Structure

```
pronunciation-laravel-blade/
├── index.html          # Single-page HTML with semantic sections
├── app.js              # jQuery + vanilla JS (630 lines, all interactivity)
├── styles.css          # Complete styling, animations, responsive layout
├── frames/             # 35 sequential JPG frames (f00.jpg—f34.jpg) for hero lips animation
├── uploads/            # (empty, reserved for future media)
└── screenshots/        # (reference images, not used in live site)
```

## Architecture & Key Features

### 1. **Hero Section — Scroll-Driven Canvas Animation**
- **File:** `app.js:137–187`
- 35 frames preloaded and sequentially drawn to canvas based on scroll position
- Frames are fetched from `frames/` directory
- Canvas is masked with radial gradient for soft ellipse effect
- Copy fades out as user scrolls down hero

### 2. **Dynamic Content Rendering**
- **Services Cards** (app.js:75–84): Generated from `CARDS` data array, each card gets staggered entrance animation
- **Stats** (app.js:97–103): Counter-style stats from `STATS` data
- **Approach Steps** (app.js:105–111): Numbered 4-step methodology
- **Testimonials** (app.js:113–123): 5-star quotes with author avatars (initials)
- **Marquee** (app.js:70–73): Infinite scrolling text loop with keywords

### 3. **Scroll-Triggered Reveal Animations**
- **File:** `app.js:125–135`
- Uses IntersectionObserver with 16% threshold
- Elements with `.reveal` class animate in when scrolling into view
- Animations defined in CSS (`.reveal.in` class), with staggered `transition-delay` per element

### 4. **Booking System — CRUD with localStorage**
- **Storage:** Browser `localStorage` (key: `artikula_bookings`)
- **Seed Data:** Two default bookings included (app.js:190–193)
- **Operations:**
  - **Create:** Form validates name (min 3 chars) and date (not in past), then pushes to array
  - **Read:** List rendered sorted by date+time; count pill updates
  - **Update:** Edit mode fetches booking, pre-fills form, updates array on submit
  - **Delete:** Confirmation via toast; filters out matching ID
- **Time Slots:** Fixed 6 times (9:00–18:00) as chips; user selects one
- **Form Validation:** Name and date are required; date must not be before today

### 5. **Navigation & Smooth Scroll**
- Fixed navbar with backdrop blur when scrolled
- Anchor links (`#uslugi`, `#metoda`, etc.) trigger native smooth scroll behavior
- Nav sections match HTML IDs for deep linking

### 6. **Toast Notifications**
- Brief (2.4s) feedback messages for booking actions (create, update, delete)
- Styled with rose accent and fade animation

## CSS Key Notes

- **Color Palette:** Defined in `:root` — warm beiges, rose accent, soft shadows
- **Typography:** Serif headers (Cormorant Garamond), sans-serif body (Hanken Grotesk)
- **Responsive:** Mobile breakpoint at 720px; `clamp()` for fluid sizing
- **Grain Overlay:** Subtle SVG-based texture (`.grain` class) for warmth
- **Easing Functions:** Custom cubic-bezier curves (`--ease`, `--ease-out`) for consistent motion

## Data Structure

All dynamic content is hardcoded in `app.js` as data objects:
- `SERVICES` (array of 6 service names)
- `TIMES` (array of 6 available booking times)
- `CARDS` (service cards with number, title, description, tag)
- `STATS` (4 statistics objects)
- `STEPS` (4-step methodology)
- `QUOTES` (3 testimonials)
- `PL_MON` (Polish month abbreviations)

To change content, edit these arrays in `app.js` lines 6–40.

## Browser Support

- Modern browsers with ES6 support
- Canvas API (hero animation)
- IntersectionObserver (scroll reveals)
- localStorage (bookings)
- CSS Grid, Flexbox, CSS custom properties (all CSS-in-one file, no IE11 support)

## Common Tasks

**Add a new service:**
1. Add entry to `SERVICES` array (line 6)
2. Add entry to `CARDS` array (line 13) with matching order

**Change booking times:**
1. Edit `TIMES` array (line 10)
2. Chips will auto-regenerate

**Update color palette:**
1. Edit CSS custom properties in `styles.css:4–18` (`:root`)
2. All colors are scoped via `var(--colorName)`

**Modify booking validation:**
1. Edit `validate()` function (app.js:268–289)
2. Show/hide error messages as needed

**Add new section:**
1. Add HTML section with `.reveal` elements (if you want animation)
2. Ensure IDs match nav links for anchor navigation
3. Create data in `app.js` and render with template literals
4. Add CSS styling

## Performance Notes

- All 35 frame JPGs preload synchronously (no lazy load) for hero animation — fine for desktop, may impact mobile if bandwidth-constrained
- localStorage writes wrapped in try/catch for safety (quota issues)
- Event handlers use event delegation (jQuery `.on()`) for dynamically added booking list items
- Marquee uses simple DOM-based loop with CSS animation (no canvas overhead)

## Testing / Validation

No automated tests. To validate changes:
1. Serve locally and test in browser
2. Check booking CRUD flow (add, edit, delete, persistence across reload)
3. Scroll hero section and observe lips frame progression
4. Resize viewport and verify responsive layout
5. Test date picker — ensure past dates are rejected
6. Open DevTools and check `localStorage` for `artikula_bookings` key
