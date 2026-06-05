/* ============ ARTIKULA — app.js (jQuery + vanilla) ============ */

$(function () {

  /* ---- AUTH STATE ---- */
  let currentUser = null;
  try { currentUser = JSON.parse(localStorage.getItem('artikula_user')); } catch(e) {}

  function renderNavAuth() {
    if (currentUser) {
      $('#nav-auth').html(`
        <span style="font-size:14px;font-weight:500;color:var(--ink-soft);margin-right:4px">
          ${currentUser.name.split(' ')[0]}
        </span>
        <button class="btn btn-ghost nav-cta" id="btn-logout" style="padding:11px 22px">Wyloguj</button>
      `);
      $('#btn-logout').on('click', function () {
        localStorage.removeItem('artikula_user');
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
  const TIMES = ['09:00','10:30','12:00','15:00','16:30','18:00'];
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

  function scrollToWithOffset(el, offset) {
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  $('#nav-uslugi').on('click', function (e) {
    e.preventDefault();
    scrollToWithOffset(document.getElementById('uslugi'), 80);
  });

  $('#nav-kontakt').on('click', function (e) {
    e.preventDefault();
    scrollToWithOffset(document.getElementById('kontakt'), 0);
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
  }, { threshold: 0.16 });

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

  /* ---- BOOKING CRUD (localStorage) ---- */
  const seed = [
    {id:1, name:'Anna Kowalska',    service:'Trening dykcji', date:todayPlus(2), time:'10:30', mode:'Gabinet'},
    {id:2, name:'Marek Zieliński', service:'Emisja głosu',    date:todayPlus(5), time:'16:30', mode:'Online'},
  ];

  let bookings = [];
  try { bookings = JSON.parse(localStorage.getItem('artikula_bookings')) || seed; } catch(e) { bookings = seed; }

  let editId    = null;
  let selTime   = '10:30';
  const emptyForm = () => ({ name: '', service: SERVICES[0], date: todayPlus(1), time: '10:30', mode: 'Gabinet' });

  /* populate selects */
  $('#f-service').html(SERVICES.map(s => `<option>${s}</option>`).join(''));
  $('#f-date').attr('min', todayStr()).val(todayPlus(1));

  /* time chips */
  function renderChips() {
    $('#time-chips').html(TIMES.map(t =>
      `<div class="chip-sel${t === selTime ? ' on' : ''}" data-time="${t}">${t}</div>`
    ).join(''));
  }
  renderChips();

  $(document).on('click', '.chip-sel', function () {
    selTime = $(this).data('time');
    renderChips();
  });

  /* save to localStorage */
  function saveBookings() {
    try { localStorage.setItem('artikula_bookings', JSON.stringify(bookings)); } catch(e) {}
  }

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
            <div class="svc">${b.service}</div>
            <div class="meta">
              <span>◷ ${b.time}</span>
              <span>${b.mode === 'Online' ? '⌁ Online' : '⌂ Gabinet'}</span>
              <span>${b.name}</span>
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
  renderList();

  /* validate */
  function validate() {
    let ok = true;
    const name = $('#f-name').val().trim();
    const date = $('#f-date').val();

    $('#err-name').hide();
    $('#err-date').hide();
    $('#f-name').removeClass('err');
    $('#f-date').removeClass('err');

    if (!name || name.length < 3) {
      $('#err-name').text(name ? 'Imię jest za krótkie' : 'Podaj imię i nazwisko').show();
      $('#f-name').addClass('err');
      ok = false;
    }
    if (!date || date < todayStr()) {
      $('#err-date').text(!date ? 'Wybierz datę' : 'Data nie może być z przeszłości').show();
      $('#f-date').addClass('err');
      ok = false;
    }
    return ok;
  }

  /* submit */
  $('#btn-submit').on('click', function () {
    if (!validate()) return;
    const entry = {
      name:    $('#f-name').val().trim(),
      service: $('#f-service').val(),
      date:    $('#f-date').val(),
      time:    selTime,
      mode:    $('#f-mode').val(),
    };
    if (editId) {
      bookings = bookings.map(b => b.id === editId ? { ...entry, id: editId } : b);
      showToast('Wizyta zaktualizowana');
      cancelEdit();
    } else {
      entry.id = Date.now();
      bookings.push(entry);
      showToast('Wizyta zarezerwowana');
      resetForm();
    }
    saveBookings();
    renderList();
  });

  /* edit */
  $(document).on('click', '.btn-edit', function () {
    const id = +$(this).data('id');
    const b = bookings.find(x => x.id === id);
    if (!b) return;
    editId = id;
    $('#f-name').val(b.name).removeClass('err');
    $('#f-service').val(b.service);
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
  $(document).on('click', '.btn-del', function () {
    const id = +$(this).data('id');
    bookings = bookings.filter(b => b.id !== id);
    if (editId === id) cancelEdit();
    saveBookings();
    renderList();
    showToast('Wizyta odwołana');
  });

  /* cancel edit */
  $('#btn-cancel').on('click', cancelEdit);

  function cancelEdit() {
    editId = null;
    resetForm();
    $('#form-title').text('Umów wizytę');
    $('#form-sub').text('Wybierz usługę i dogodny termin — potwierdzimy w 24 h.');
    $('#btn-submit').text('Zarezerwuj termin');
    $('#btn-cancel').hide();
  }

  function resetForm() {
    const f = emptyForm();
    $('#f-name').val('').removeClass('err');
    $('#f-service').val(f.service);
    $('#f-date').val(f.date).removeClass('err');
    $('#f-mode').val(f.mode);
    selTime = f.time;
    renderChips();
    $('#err-name, #err-date').hide();
  }

  /* re-bind reveal after dynamic content */
  bindReveal();

});
