/* ============ ARTIKULA — app.js (jQuery + vanilla) ============ */

$(async function () {

  /* ---- AUTH STATE ---- */
  let currentUser = null;
  try {
    const r = await fetch('/api/user', { credentials: 'include', headers: { 'Accept': 'application/json' } });
    if (r.ok) currentUser = await r.json();
  } catch(e) {}

  /* ---- CSRF helpers ---- */
  function getXsrf() {
    return decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '');
  }
  async function apiPost(method, url, body) {
    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    return fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getXsrf() },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  async function apiGet(url) {
    return fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json' } });
  }

  function renderNavAuth() {
    if (currentUser) {
      const label = currentUser.email.split('@')[0];
      $('#nav-auth').html(`
        <span style="font-size:14px;font-weight:500;color:var(--ink-soft);margin-right:4px">${label}</span>
        <button class="btn btn-ghost nav-cta" id="btn-logout" style="padding:11px 22px">Wyloguj</button>
      `);
      $('#btn-logout').on('click', async function () {
        await apiPost('POST', '/api/logout');
        window.location.reload();
      });
    } else {
      $('#nav-auth').html(`
        <a href="/login" class="btn btn-ghost nav-cta" style="padding:11px 22px">Zaloguj się</a>
      `);
    }
  }
  renderNavAuth();

  /* ---- DATA ---- */
  const SERVICES = [
    'Diagnoza logopedyczna','Terapia wymowy','Emisja głosu',
    'Trening dykcji','Terapia seplenienia','Logopedia dziecięca'
  ];
  const TIMES = ['09:00','10:00','11:00','13:00','15:00','18:00'];
  const PL_MON = ['STY','LUT','MAR','KWI','MAJ','CZE','LIP','SIE','WRZ','PAŹ','LIS','GRU'];

  const CARDS = [
    {n:'01',t:'Diagnoza logopedyczna',d:'Pełna ocena artykulacji, słuchu fonematycznego i aparatu mowy — z planem terapii na pierwszej wizycie.',tag:'45–60 min'},
    {n:'02',t:'Terapia wymowy',d:'Korekcja seplenienia, rotacyzmu i innych wad. Ćwiczenia dopasowane do wieku i tempa pacjenta.',tag:'Cykl indywidualny'},
    {n:'03',t:'Emisja głosu',d:'Dla nauczycieli, mówców i wokalistów. Oddech, rezonans i higiena głosu bez przeciążeń.',tag:'Grupowo lub 1:1'},
    {n:'04',t:'Trening dykcji',d:'Wyrazista, swobodna mowa do sceny, kamery i prezentacji. Tempo, akcent, intonacja.',tag:'Pakiet 8 spotkań'},
    {n:'05',t:'Terapia seplenienia',d:'Precyzyjna praca nad głoskami sz, ż, cz, dż oraz s, z, c. Od ustawienia języka po automatyzację.',tag:'Dla dzieci i dorosłych'},
    {n:'06',t:'Logopedia dziecięca',d:'Wczesna interwencja i opóźniony rozwój mowy. Terapia w formie zabawy, z udziałem rodzica.',tag:'Od 2. roku życia'},
  ];

  const STATS = [
    {n:'15',e:'lat',l:'doświadczenia w terapii mowy'},
    {n:'4 200',e:'+',l:'pacjentów, którzy mówią pewniej'},
    {n:'96',e:'%',l:'skuteczności ukończonych terapii'},
    {n:'24',e:'h',l:'na potwierdzenie Twojej wizyty'},
  ];

  const STEPS = [
    {k:'I',  t:'Słuchamy',    d:'Konsultacja i diagnoza. Poznajemy Twój głos, cele i historię.'},
    {k:'II', t:'Projektujemy',d:'Indywidualny plan terapii z jasnymi etapami i miarą postępu.'},
    {k:'III',t:'Ćwiczymy',    d:'Regularne spotkania w gabinecie lub online, z materiałami do domu.'},
    {k:'IV', t:'Utrwalamy',   d:'Automatyzacja nawyków, aż poprawna wymowa stanie się naturalna.'},
  ];

  const QUOTES = [
    {q:'Po latach unikania prezentacji wreszcie mówię bez stresu. Głos brzmi pełniej, a ja pewniej.',n:'Joanna R.',r:'menedżerka'},
    {q:'Syn w pół roku pokonał seplenienie. Terapia w formie zabawy — czekał na każde spotkanie.',n:'Tomasz W.',r:'tata Antka, 6 lat'},
    {q:'Jako nauczycielka traciłam głos co semestr. Emisja głosu zmieniła moją pracę o 180 stopni.',n:'Magda K.',r:'nauczycielka'},
    {q:'Rotacyzm mojego syna zniknął w 4 miesiące. Polecam każdemu rodzicowi, który szuka skutecznej pomocy.',n:'Karolina S.',r:'mama Kuby, 8 lat'},
    {q:'Przygotowywałem się do konferencji TED. Trening dykcji dał mi pewność siebie, której brakowało.',n:'Piotr M.',r:'przedsiębiorca'},
    {q:'Trafiłam tu z problemem jąkania. Dziś prowadzę szkolenia bez strachu — to niesamowita zmiana.',n:'Aleksandra W.',r:'trenerka biznesu'},
  ];

  /* ---- HELPERS ---- */
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }
  function todayPlus(n) {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function parseDate(iso) {
    if (!iso) return { d: '—', m: '' };
    const dt = new Date(iso + 'T00:00');
    if (isNaN(dt)) return { d: '—', m: '' };
    return { d: String(dt.getDate()).padStart(2, '0'), m: PL_MON[dt.getMonth()] };
  }

  let toastTimer;
  function showToast(msg) {
    $('#toast-msg').text(msg);
    $('#toast').addClass('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').removeClass('show'), 2400);
  }

  /* ---- NAV scroll ---- */
  $(window).on('scroll', function () {
    $('#nav').toggleClass('scrolled', window.scrollY > 40);
  }).trigger('scroll');

  /* ---- HAMBURGER / MOBILE MENU ---- */
  function renderMobAuth() {
    if (currentUser) {
      const label = currentUser.email.split('@')[0];
      $('#mob-auth').html(`
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:8px">
          <span style="font-size:14px;color:var(--ink-soft);font-weight:500">${label}</span>
          <button class="mob-link mob-cta" id="mob-logout">Wyloguj</button>
        </div>
      `);
      $('#mob-logout').on('click', async function () {
        await apiPost('POST', '/api/logout');
        window.location.reload();
      });
    } else {
      $('#mob-auth').html(`
        <a href="/login" class="mob-link mob-cta" style="margin-top:10px">Zaloguj się</a>
      `);
    }
  }
  renderMobAuth();

  function closeMobileMenu() {
    $('#hamburger').removeClass('open');
    $('#mobile-menu').removeClass('open');
    $('body').css('overflow', '');
  }

  $('#hamburger').on('click', function () {
    const isOpen = $(this).hasClass('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      $(this).addClass('open');
      $('#mobile-menu').addClass('open');
      $('body').css('overflow', 'hidden');
    }
  });

  /* close on any mob-link click, then scroll */
  $(document).on('click', '.mob-link', function (e) {
    const href = $(this).attr('href');
    if (!href || !href.startsWith('#')) { closeMobileMenu(); return; }
    e.preventDefault();
    closeMobileMenu();
    setTimeout(function () {
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      if (href === '#uslugi') {
        const marqueeH = document.querySelector('.marquee')?.offsetHeight || 68;
        scrollToWithOffset(target, 74 + marqueeH);
      } else if (href === '#kontakt') {
        scrollToWithOffset(target, 30);
      } else {
        scrollToWithOffset(target, 74);
      }
    }, 320);
  });

  $('#mob-close').on('click', closeMobileMenu);

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* disable card tilt on touch */
  if ('ontouchstart' in window) {
    $(document).off('mousemove', '.card').off('mouseleave', '.card');
  }

  function scrollToWithOffset(el, offset) {
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  $('#nav-uslugi').on('click', function (e) {
    e.preventDefault();
    const marqueeH = document.querySelector('.marquee')?.offsetHeight || 74;
    scrollToWithOffset(document.getElementById('uslugi'), 74 + marqueeH);
  });

  $('#nav-kontakt').on('click', function (e) {
    e.preventDefault();
    scrollToWithOffset(document.getElementById('kontakt'), 30);
  });

  /* ---- MARQUEE ---- */
  const words = ['Artykulacja','Dykcja','Emisja głosu','Wymowa','Pewność','Oddech','Rezonans','Ekspresja'];
  const row = [...words, ...words];
  $('#marquee-track').html(row.map(w => `<span><span class="star">✦</span>${w}</span>`).join(''));

  /* ---- SERVICE CARDS ---- */
  $('#cards').html(CARDS.map((c, i) => `
    <div class="card reveal" style="transition-delay:${i % 3 * 90}ms" data-idx="${i}">
      <div class="blob" style="animation-delay:${-i * 1.4}s"></div>
      <div class="num">${c.n}</div>
      <h3>${c.t}</h3>
      <p>${c.d}</p>
      <span class="tag">${c.tag} <span class="arrow">→</span></span>
    </div>
  `).join(''));

  /* card tilt */
  $(document).on('mousemove', '.card', function (e) {
    const r = this.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    this.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-8px)`;
  });
  $(document).on('mouseleave', '.card', function () {
    this.style.transform = '';
  });

  $(document).on('click', '.card', function () {
    document.getElementById('rezerwacja').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---- STATS ---- */
  $('#stats').html(STATS.map((s, i) => `
    <div class="stat reveal" style="transition-delay:${i * 80}ms">
      <div class="stat-num">${s.n}<em>${s.e}</em></div>
      <div class="stat-lab">${s.l}</div>
    </div>
  `).join(''));

  /* ---- APPROACH STEPS ---- */
  $('#steps').html(STEPS.map(s => `
    <li class="step">
      <span class="k">${s.k}</span>
      <div><h4>${s.t}</h4><p>${s.d}</p></div>
    </li>
  `).join(''));

  /* ---- QUOTES ---- */
  $('#quotes').html(QUOTES.map((q, i) => `
    <div class="quote reveal" style="transition-delay:${i * 100}ms">
      <div class="stars">★★★★★</div>
      <p>„${q.q}"</p>
      <div class="who">
        <span class="av">${q.n[0]}</span>
        <div><div class="nm">${q.n}</div><div class="rl">${q.r}</div></div>
      </div>
    </div>
  `).join(''));

  /* ---- REVEAL on scroll ---- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px 120px 0px' });

  function bindReveal() {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => revealIO.observe(el));
  }
  bindReveal();

  /* ---- HERO scroll-scrub lips ---- */
  const FRAME_COUNT = 35;
  const canvas = document.getElementById('lips');
  const ctx = canvas.getContext('2d');
  const imgs = [];
  let curFrame = -1;

  function drawFrame(i) {
    const img = imgs[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    if (curFrame === i) return;
    curFrame = i;
    if (canvas.width !== img.naturalWidth) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = 'frames/f' + String(i).padStart(2, '0') + '.jpg';
    img.onload = () => { if (i === 0) drawFrame(0); };
    imgs[i] = img;
  }

  let ticking = false;
  $(window).on('scroll.hero resize.hero', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const hero = document.getElementById('hero');
      const scrollable = hero.offsetHeight - window.innerHeight;
      const top = -hero.getBoundingClientRect().top;
      const p = Math.max(0, Math.min(1, top / scrollable));
      const frame = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
      drawFrame(frame);

      /* fade copy near end */
      const copy = document.getElementById('hero-copy');
      if (copy) {
        const fade = p < 0.82 ? 1 : Math.max(0, 1 - (p - 0.82) / 0.16);
        copy.style.opacity = fade;
      }

      /* fade scroll hint at very end */
      const hint = document.querySelector('.scroll-hint');
      if (hint) hint.style.opacity = p < 0.88 ? 1 : Math.max(0, 1 - (p - 0.88) / 0.10);

      /* subtle zoom */
      canvas.style.transform = 'scale(' + (1 + p * 0.18) + ')';
      ticking = false;
    });
  }).trigger('scroll.hero');

  /* ---- BOOKING CRUD (API) ---- */
  let bookings = [];
  let editId   = null;
  let selTime  = TIMES[0];

  /* time chips */
  function renderChips() {
    $('#time-chips').html(TIMES.map(t =>
      `<div class="chip-sel${t === selTime ? ' on' : ''}" data-time="${t}">${t}</div>`
    ).join(''));
  }

  $(document).on('click', '.chip-sel', function () {
    selTime = $(this).data('time');
    renderChips();
  });

  /* render list */
  function renderList() {
    const sorted = [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const pill = sorted.length;
    $('#count-pill').text(pill + ' ' + (pill === 1 ? 'wizyta' : 'zaplanowane'));

    if (sorted.length === 0) {
      $('#b-list-wrap').html(`
        <div class="b-empty">
          <div class="big">Brak zaplanowanych wizyt</div>
          <div>Umów pierwszą wizytę w formularzu obok.</div>
        </div>
      `);
      return;
    }

    $('#b-list-wrap').html(`<div class="b-list">${sorted.map(b => {
      const { d, m } = parseDate(b.date);
      return `
        <div class="b-item" data-id="${b.id}">
          <div class="b-date"><div class="d">${d}</div><div class="m">${m}</div></div>
          <div class="b-main">
            <div class="svc">${b.service?.name ?? ''}</div>
            <div class="meta">
              <span>◷ ${b.time}</span>
              <span>${b.mode === 'online' ? '⌁ Online' : '⌂ Gabinet'}</span>
              <span>${b.patient_name}</span>
            </div>
          </div>
          <div class="b-actions">
            <button class="icon-btn btn-edit" title="Edytuj" data-id="${b.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn del btn-del" title="Odwołaj" data-id="${b.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('')}</div>`);
  }

  /* validate */
  function validate() {
    let ok = true;
    const name = $('#f-name').val().trim();
    const date = $('#f-date').val();
    $('#err-name, #err-date').hide();
    $('#f-name, #f-date').removeClass('err');
    if (!name || name.length < 2) {
      $('#err-name').text(name ? 'Imię jest za krótkie' : 'Podaj imię i nazwisko').show();
      $('#f-name').addClass('err'); ok = false;
    }
    if (!date || date < todayStr()) {
      $('#err-date').text(!date ? 'Wybierz datę' : 'Data nie może być z przeszłości').show();
      $('#f-date').addClass('err'); ok = false;
    }
    return ok;
  }

  function resetForm() {
    $('#f-name').val('').removeClass('err');
    $('#f-date').val(todayPlus(1)).removeClass('err');
    $('#f-mode').val('stacjonarnie');
    selTime = TIMES[0];
    renderChips();
    $('#err-name, #err-date').hide();
  }

  function cancelEdit() {
    editId = null;
    resetForm();
    $('#form-title').text('Umów wizytę');
    $('#form-sub').text('Wybierz usługę i dogodny termin — potwierdzimy w 24 h.');
    $('#btn-submit').text('Zarezerwuj termin');
    $('#btn-cancel').hide();
  }

  /* submit */
  $('#btn-submit').on('click', async function () {
    if (!validate()) return;
    const $btn = $(this).prop('disabled', true);
    const payload = {
      service_id:   +$('#f-service').val(),
      patient_name: $('#f-name').val().trim(),
      date:         $('#f-date').val(),
      time:         selTime,
      mode:         $('#f-mode').val(),
    };
    let res;
    if (editId) {
      res = await apiPost('PUT', `/api/appointments/${editId}`, payload);
    } else {
      res = await apiPost('POST', '/api/appointments', payload);
    }
    if (res.ok) {
      const saved = await res.json();
      if (editId) {
        bookings = bookings.map(b => b.id === editId ? saved : b);
        showToast('Wizyta zaktualizowana');
        cancelEdit();
      } else {
        bookings.push(saved);
        showToast('Wizyta zarezerwowana');
        resetForm();
      }
      renderList();
    } else {
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) {
        if (data.errors.time)  { showToast(data.errors.time[0]); }
        if (data.errors.date)  { $('#err-date').text(data.errors.date[0]).show(); $('#f-date').addClass('err'); }
        if (data.errors.patient_name) { $('#err-name').text(data.errors.patient_name[0]).show(); $('#f-name').addClass('err'); }
      }
    }
    $btn.prop('disabled', false);
  });

  /* edit */
  $(document).on('click', '.btn-edit', function () {
    const id = +$(this).data('id');
    const b = bookings.find(x => x.id === id);
    if (!b) return;
    editId = id;
    $('#f-name').val(b.patient_name).removeClass('err');
    $('#f-service').val(b.service_id);
    $('#f-date').val(b.date).removeClass('err');
    $('#f-mode').val(b.mode);
    selTime = b.time;
    renderChips();
    $('#err-name, #err-date').hide();
    $('#form-title').text('Edytuj wizytę');
    $('#form-sub').text('Zmień szczegóły i zapisz.');
    $('#btn-submit').text('Zapisz zmiany');
    $('#btn-cancel').show();
    document.getElementById('rezerwacja').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* delete */
  $(document).on('click', '.btn-del', async function () {
    const id = +$(this).data('id');
    const res = await apiPost('DELETE', `/api/appointments/${id}`);
    if (res.ok || res.status === 204) {
      bookings = bookings.filter(b => b.id !== id);
      if (editId === id) cancelEdit();
      renderList();
      showToast('Wizyta odwołana');
    }
  });

  $('#btn-cancel').on('click', cancelEdit);

  /* init booking section */
  if (!currentUser) {
    $('.panel').html(`
      <h3>Umów wizytę</h3>
      <p class="muted" style="margin-bottom:28px">Zaloguj się, żeby umówić wizytę i zarządzać swoim kalendarzem.</p>
      <a href="/login" class="btn btn-rose" style="display:inline-flex;justify-content:center;width:100%;padding:14px">
        Zaloguj się
      </a>
      <div style="text-align:center;margin-top:18px;font-size:14px;color:var(--ink-soft)">
        Nie masz konta? <a href="/register" style="color:var(--rose-deep);font-weight:600">Zarejestruj się</a>
      </div>
    `);
    $('#b-list-wrap').html(`
      <div class="b-empty"><div class="big">Zaloguj się</div><div>żeby zobaczyć swoje wizyty.</div></div>
    `);
  } else {
    /* populate services from API */
    const svcRes = await apiGet('/api/services');
    let services = [];
    if (svcRes.ok) services = await svcRes.json();
    $('#f-service').html(services.map(s => `<option value="${s.id}">${s.name}</option>`).join(''));
    $('#f-date').attr('min', todayStr()).val(todayPlus(1));
    renderChips();

    /* load appointments */
    const aptRes = await apiGet('/api/appointments');
    if (aptRes.ok) bookings = await aptRes.json();
    renderList();
  }

  /* re-bind reveal after dynamic content */
  bindReveal();

});
