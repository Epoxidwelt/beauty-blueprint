document.getElementById('year').textContent = new Date().getFullYear();

// progress bar + header state
const progressBar = document.getElementById('progressBar');
const header = document.getElementById('siteHeader');
function onScroll(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  header.classList.toggle('scrolled', scrollTop > 40);
}
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// mobile nav
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// active nav link — highlights the current page (or section) in the main nav
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const inTreatmentSubpage = window.location.pathname.indexOf('/behandlungen/') !== -1;
mainNav.querySelectorAll('a[href]').forEach(a => {
  const href = a.getAttribute('href');
  if (!href || href.startsWith('http')) return;
  const hrefFile = href.split('/').pop();
  const isMatch = hrefFile === currentPage || (inTreatmentSubpage && hrefFile === 'behandlungen.html');
  if (isMatch) a.classList.add('current');
});

// reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// animated stat counters (e.g. "seit 2004", "100 m²") — count up once when scrolled into view
const countEls = document.querySelectorAll('[data-count-to]');
if (countEls.length) {
  const reduceMotionCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count-to'), 10);
      countObserver.unobserve(el);
      if (reduceMotionCount || !target) {
        el.textContent = target;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  countEls.forEach(el => countObserver.observe(el));
}

// testimonial carousel — single quote, crossfade
const quoteViewport = document.getElementById('quoteViewport');
const dotsWrap = document.getElementById('testimonialDots');
const quotePrev = document.getElementById('quotePrev');
const quoteNext = document.getElementById('quoteNext');
if (quoteViewport && dotsWrap) {
  const slides = Array.from(quoteViewport.children);
  let current = slides.findIndex(s => s.classList.contains('active'));
  if (current < 0) current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Zu Bewertung ' + (i + 1));
    if (i === current) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  quotePrev.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
  quoteNext.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoplayId = null;
  function startAutoplay() {
    if (reduceMotion) return;
    autoplayId = window.setInterval(() => goTo(current + 1), 7000);
  }
  function resetAutoplay() {
    if (autoplayId) window.clearInterval(autoplayId);
    startAutoplay();
  }
  const stage = quoteViewport.closest('.quote-stage');
  stage.addEventListener('mouseenter', () => autoplayId && window.clearInterval(autoplayId));
  stage.addEventListener('mouseleave', startAutoplay);
  startAutoplay();
}

// contact form (kontakt.html only) — no backend, so it hands off to the visitor's own
// mail client via mailto: (same pattern as the Behandlungsfinder result screen) instead of
// silently discarding the message with a fake "submitted" confirmation.
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const subject = 'Nachricht von der Website — ' + name;
    const body =
      'Name: ' + name + '\n' +
      'E-Mail: ' + email + '\n\n' +
      message;
    const mailtoHref = 'mailto:info@beautylounge-neuss.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = mailtoHref;
    formSuccess.hidden = false;
    form.reset();
  });
}

// Google Maps — Zwei-Klick-Lösung (kontakt.html): der iframe wird erst nach
// ausdrücklichem Klick eingesetzt, vorher geht keine Anfrage an Google raus.
const mapFrame = document.getElementById('mapFrame');
const mapLoadBtn = document.getElementById('mapLoadBtn');
if (mapFrame && mapLoadBtn) {
  mapLoadBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = 'Anfahrt Beauty Lounge Neuss';
    iframe.src = mapFrame.getAttribute('data-map-src');
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapFrame.innerHTML = '';
    mapFrame.appendChild(iframe);
  });
}

// FAQ accordion (treatment landing pages)
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach((openItem) => {
      if (openItem !== item) openItem.classList.remove('open');
    });
    item.classList.toggle('open', !isOpen);
  });
});

// Schnellleiste (nur Handy, per CSS): Anrufen und Termin buchen
if (!document.querySelector('.quickbar')) {
  const bar = document.createElement('div');
  bar.className = 'quickbar';
  bar.innerHTML = '<a class="btn btn-ghost" href="tel:+4921314506806">Anrufen</a>' +
    '<a class="btn btn-primary" href="https://www.studiobookr.com/beauty-lounge-66137" target="_blank" rel="noopener">Termin buchen</a>';
  document.body.appendChild(bar);
}

// Filter auf der Behandlungsübersicht
const filterBar = document.querySelector('.filter-bar');
if (filterBar) {
  const rows = Array.from(document.querySelectorAll('.showcase-row[data-cat]'));
  filterBar.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.getAttribute('data-filter');
      filterBar.querySelectorAll('.chip').forEach((c) => {
        const on = c === chip;
        c.classList.toggle('active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      rows.forEach((row) => { row.hidden = f !== 'alle' && row.getAttribute('data-cat') !== f; });
    });
  });
}

// lokale Navigation (Behandlungsseiten): den Abschnitt hervorheben, in dem man gerade liest
const localNav = document.querySelector('.local-nav');
if (localNav) {
  const navLinks = Array.from(localNav.querySelectorAll('a[href^="#"]'));
  const byTarget = new Map();
  navLinks.forEach((a) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) byTarget.set(target, a);
  });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = byTarget.get(entry.target);
      navLinks.forEach((l) => l.classList.toggle('active', l === active));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  byTarget.forEach((_, target) => spy.observe(target));
}

// selbsttest (früher "Behandlungsfinder") — geführte Behandlungsempfehlung.
// Fünf Fragen: Bereich -> Anliegen -> zwei Vertiefungsfragen (je nach Anliegen) -> Zeitrahmen.
// Das Ergebnis nennt neben der Behandlungsgruppe die konkrete Leistung mit Dauer und Preis.
(function () {
  const TREATMENTS = {
    gesicht: {
      name: 'Gesichtsbehandlungen',
      desc: 'Individuell abgestimmte Pflege für strahlende, gesunde Haut.',
      page: 'behandlungen/gesichtsbehandlungen.html'
    },
    forma: {
      name: 'FORMA Hautstraffung',
      desc: 'Radiofrequenz-Kollagenaufbau für straffere Haut — ohne OP, ohne Filler.',
      page: 'behandlungen/forma-hautstraffung.html',
      secondary: 'gesicht'
    },
    wimpern: {
      name: 'Wimpernlifting & Browlift',
      desc: 'Ein offener Blick: Wimpernlifting für einen natürlichen Schwung (4–8 Wochen) und Browlift für voller wirkende Brauen.',
      page: 'behandlungen/wimpernlifting.html'
    },
    haende: {
      name: 'Hand & Nagelpflege',
      desc: 'Maniküre und Nageldesign mit hochwertigen Alessandro-Produkten.',
      page: 'behandlungen/hand-nagelpflege.html'
    },
    fuesse: {
      name: 'Fußpflege',
      desc: 'Wohltuende medizinische und kosmetische Fußpflege mit Gehwol.',
      page: 'behandlungen/fusspflege.html'
    },
    diolaze: {
      name: 'DIOLAZE Haarentfernung',
      desc: 'Dauerhafte Haarentfernung mit dem InMode Alexandrit-Dioden-Laser — für Damen und Herren.',
      page: 'behandlungen/diolaze-haarentfernung.html'
    }
  };

  const ROOT_PREFIX = window.location.pathname.indexOf('/behandlungen/') !== -1 ? '../' : '';

  // Bildmaße je Behandlung — dieselben Dateien wie in behandlungen.html/index.html,
  // hier klein für die Ergebniskarte im Finder-Modal.
  const TREATMENT_IMG_DIMS = {
    gesicht: { w: 1400, h: 933 },
    forma: { w: 1400, h: 933 },
    fuesse: { w: 1400, h: 933 },
    haende: { w: 1400, h: 933 },
    diolaze: { w: 1400, h: 933 },
    wimpern: { w: 1400, h: 933 }
  };

  function treatmentPictureHtml(key, name) {
    const dims = TREATMENT_IMG_DIMS[key];
    if (!dims) return '';
    const base = ROOT_PREFIX + 'assets/img/treatments/' + key;
    return '<div class="finder-treatment-media"><picture>' +
      '<source type="image/webp" srcset="' + base + '-760.webp 760w, ' + base + '-1400.webp 1400w" sizes="(max-width:640px) 92vw, 540px">' +
      '<img src="' + base + '-760.jpg" srcset="' + base + '-760.jpg 760w, ' + base + '-1400.jpg 1400w" sizes="(max-width:640px) 92vw, 540px" width="' + dims.w + '" height="' + dims.h + '" alt="' + name + '" loading="lazy" decoding="async">' +
      '</picture></div>';
  }

  // Leistungen mit Dauer (Min.), Preis (EUR) und Online-Buchbarkeit.
  // Quelle: docs/knowledge-base/exports/Beauty_Lounge_Behandlungskatalog.xlsx (Studiolution-Export, Stand 23.08.2026).
  // Bei Preisänderungen zusätzlich preise.html (und ggf. die Behandlungsseiten) anpassen.
  const PRICE_STAND = '08/2026';
  const SVC = {
    startup: { name: 'Start Up Behandlung', min: 90, price: 149, online: true },
    clean: { name: 'Clean & Activ Behandlung', min: 50, price: 93, online: true },
    relax: { name: 'Relax Behandlung', min: 70, price: 129, online: true },
    aquaderm: { name: 'AquaDerm', min: 60, price: 159, online: true },
    asa: { name: 'ASA PEEL Fruchtsäure', min: 50, price: 149, online: true },
    asakur: { name: 'ASA Fruchtsäure KUR', min: 50, price: 447, online: true, meta: '3 Sitzungen · je 50 Min.' },
    softneedling: { name: 'Soft Needling', min: 60, price: 149, online: true },
    microneedling: { name: 'Micro Needling', min: 60, price: 149, online: true },
    microderm: { name: 'MicroDerm', min: 60, price: 149, online: true },
    hyaluron: { name: 'Soft Needling meets Hyaluron', min: 90, price: 239, online: true },
    glow: { name: 'MicroDerm meets AquaDerm', min: 80, price: 199, online: true },
    deluxe: { name: 'Deluxe Treatments', min: 90, price: 205, online: true },
    forma_beratung: { name: 'FORMA GRATIS Beratungsgespräch', min: 20, price: 0, online: true },
    forma_augen: { name: 'FORMA Augen', min: 40, price: 129, online: true },
    forma_jaw: { name: 'FORMA Jawline inkl. unteren Wangenbereich', min: 45, price: 129, online: true },
    forma_hals: { name: 'FORMA Hals', min: 40, price: 129, online: true },
    forma_lippen: { name: 'FORMA Lippen', min: 40, price: 129, online: false },
    forma2: { name: 'FORMA 2 Zonen', min: 75, price: 219, online: true },
    forma3: { name: 'FORMA 3 Zonen', min: 105, price: 319, online: true },
    forma4: { name: 'FORMA 4 Zonen', min: 110, price: 399, online: false },
    lash_lift: { name: 'Wimpernlifting inkl. Keratin Versiegelung', min: 50, price: 80, online: true },
    browlift: { name: 'Browlift inkl. Keratin Versiegelung', min: 35, price: 59, online: true },
    lash_tint_add: { name: '+ Wimpern färben Lifting/ Welle', min: 10, price: 19, online: true },
    brow_tint_add: { name: '+ Augenbrauen färben Browlift', min: 5, price: 15, online: true },
    brow_pluck: { name: 'Augenbrauen zupfen', min: 10, price: 18, online: true },
    brow_wax: { name: 'Augenbrauen Wachsen', min: 10, price: 18, online: true },
    brow_tint: { name: 'Augenbrauen färben', min: 10, price: 18, online: true },
    mani: { name: 'Wellness Maniküre', min: 30, price: 50, online: true },
    spa_hand: { name: '+ SPA Hand', min: 20, price: 33, online: true },
    polish: { name: '+ Nagellack Maniküre', min: 10, price: 16, online: true },
    uvpolish: { name: '+ UV-Nagellack Maniküre', min: 15, price: 27, online: false },
    nail_strength: { name: 'Natur Nagel Verstärkung NEU', min: 60, price: 94, online: true },
    gel_new: { name: 'Neue Gel Modellage mit Verlängerung Tips/Schablone', min: 80, price: 125, online: true },
    farbgel: { name: '+ Farbgel / French/ Babyboomer', min: 10, price: 18, online: true },
    pedi: { name: 'Wellness Fußpflege', min: 40, price: 63, online: true },
    spa_foot: { name: '+ SPA Fuß', min: 20, price: 33, online: true },
    foot_peel: { name: '+ Fußpeeling GEHWOL Fuß', min: 5, price: 10, online: true },
    foot_massage: { name: '+ Fußmassage', min: 5, price: 12, online: true },
    foot_polish: { name: '+ Nagellack Fuß', min: 10, price: 16, online: true },
    foot_uvpolish: { name: '+ UV-Nagellack Fuß', min: 20, price: 31, online: true },
    hand_foot: { name: 'Beautiful Hand & Fuß', min: 110, price: 169, online: false },
    hair_consult: { name: 'GRATIS Beratungsgespräch Inkl. Haar- & Hautanalyse', min: 30, price: 0, online: true },
    lipchin: { name: 'Oberlippe + Kinn', min: 30, price: 79, online: true },
    lip: { name: 'Oberlippe', min: 20, price: 49, online: true },
    chin: { name: 'Kinn', min: 20, price: 49, online: true },
    armpit: { name: 'Achseln', min: 30, price: 89, online: true },
    bikini: { name: 'Bikini Zone', min: 20, price: 85, online: true },
    intim: { name: 'Intim Bereich', min: 30, price: 139, online: true },
    legs: { name: 'Beine Komplett', min: 50, price: 275, online: true },
    lowerleg: { name: 'Bein Unterschenkel', min: 30, price: 149, online: true },
    upperleg: { name: 'Bein Oberschenkel', min: 40, price: 159, online: true },
    arms: { name: 'Arme Komplett', min: 45, price: 199, online: true },
    forearm: { name: 'Unterarme', min: 30, price: 109, online: true },
    upperarm: { name: 'Oberarm', min: 35, price: 119, online: true },
    pkg_ab: { name: 'MUST HAVE Achseln + Bikini', min: 40, price: 155, online: true },
    pkg_ai: { name: 'MUST HAVE Achseln + Intim Bereich', min: 45, price: 199, online: true },
    pkg_aib: { name: 'MUST HAVE Achseln + Intim Bereich + Beine Komplett', min: 80, price: 439, online: true },
    h_chest: { name: 'Herren Brust', min: 30, price: 115, online: true },
    h_belly: { name: 'Herren Bauch', min: 30, price: 129, online: true },
    h_neck: { name: 'Herren Nacken', min: 20, price: 69, online: true },
    h_shoulders: { name: 'Herren Schultern', min: 20, price: 89, online: true },
    h_back: { name: 'Herren Rücken', min: 40, price: 169, online: true },
    h_partback: { name: 'Herren Teilrücken', min: 20, price: 79, online: true },
    h_armpit: { name: 'Herren Achseln', min: 30, price: 95, online: true },
    h_chest_belly: { name: 'Herren Brust + Bauch', min: 50, price: 199, online: true },
    h_back_shoulder: { name: 'Herren Rücken + Schulter', min: 50, price: 229, online: true },
    h_neck_shoulder: { name: 'Herren Nacken + Schulter', min: 30, price: 135, online: true },
    h_bsn: { name: 'Herren Rücken + Schulter + Nacken', min: 60, price: 259, online: true },
    h_all3: { name: 'Herren Brust + Bauch + Rücken', min: 75, price: 329, online: true },
    h_arms: { name: 'Herren Arme Komplett', min: 45, price: 219, online: true },
    h_legs: { name: 'Herren Beine Komplett', min: 50, price: 295, online: true }
  };

  const fmtMin = (m) => m + '\u00a0Min.';
  const fmtPrice = (p) => (p === 0 ? 'kostenlos' : (Number.isInteger(p) ? String(p) : p.toFixed(2).replace('.', ',')) + '\u00a0€');
  const plain = (t) => t.replace(/\u00a0/g, ' ');
  const L = (id, tag, later) => ({ id: id, tag: tag, later: !!later });
  const joinList = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' und ' + arr[arr.length - 1]);
  // ASA Peel ist wegen der UV-Strahlung nur von Herbst (Sep./Okt.) bis März buchbar.
  const asaSeason = () => { const m = new Date().getMonth(); return m >= 8 || m <= 2; };

  // ---- Antwortmöglichkeiten
  const TINT_OPTIONS = [
    { id: 'ja', label: 'Ja, gern gefärbt', short: 'Mit Färben' },
    { id: 'nein', label: 'Nein, natürlich belassen', short: 'Ohne Färben' },
    { id: 'vorort', label: 'Das besprechen wir vor Ort', short: 'Färben: vor Ort klären' }
  ];

  const QUESTIONS = {
    skin: {
      text: 'Und wie fühlt sich Ihre Haut meistens an?',
      options: [
        { id: 'eher-trocken', label: 'Eher trocken' },
        { id: 'eher-fettig', label: 'Eher fettig oder glänzend' },
        { id: 'mischhaut', label: 'Mischhaut — je nach Zone' },
        { id: 'empfindlich', label: 'Schnell gereizt und empfindlich' },
        { id: 'unsicher', label: 'Das weiß ich nicht genau' }
      ]
    },
    client: {
      text: 'Waren Sie schon einmal bei uns?',
      options: [
        { id: 'neu', label: 'Nein, ich bin zum ersten Mal hier', short: 'Erster Besuch' },
        { id: 'bekannt', label: 'Ja, ich war schon einmal da', short: 'Schon bei uns gewesen' }
      ]
    },
    forma_zone: {
      text: 'Welche Partie möchten Sie straffen?',
      options: [
        { id: 'augen', label: 'Die Augenpartie' },
        { id: 'jawline', label: 'Jawline und unterer Wangenbereich' },
        { id: 'hals', label: 'Den Hals' },
        { id: 'lippen', label: 'Lippen und Mundpartie' },
        { id: 'mehrere', label: 'Mehrere Partien' }
      ]
    },
    lash_focus: {
      text: 'Was soll behandelt werden?',
      options: [
        { id: 'wimpern', label: 'Vor allem die Wimpern' },
        { id: 'beides', label: 'Wimpern und Brauen zusammen' }
      ]
    },
    brow_how: {
      text: 'Was schwebt Ihnen bei den Brauen vor?',
      options: [
        { id: 'zupfen', label: 'Zupfen für eine saubere Form' },
        { id: 'wachsen', label: 'Wachsen für eine saubere Form' },
        { id: 'lift', label: 'Browlift — voller und dichter wirken' },
        { id: 'beraten', label: 'Beraten Sie mich gern' }
      ]
    },
    tint_lash: { text: 'Sollen die Wimpern (und Brauen) zusätzlich gefärbt werden?', options: TINT_OPTIONS },
    tint_brow: { text: 'Sollen die Brauen zusätzlich gefärbt werden?', options: TINT_OPTIONS },
    hand_wish: {
      text: 'Was schwebt Ihnen vor?',
      options: [
        { id: 'natur', label: 'Gepflegter Naturnagel' },
        { id: 'gel', label: 'Gel — Verstärkung oder Modellage' },
        { id: 'pflege', label: 'Vor allem Pflege und Entspannung' },
        { id: 'beraten', label: 'Beraten Sie mich gern' }
      ]
    },
    color: {
      text: 'Soll eine Farbe dazu?',
      options: [
        { id: 'ohne', label: 'Nein, ohne Farbe', short: 'Ohne Farbe' },
        { id: 'lack', label: 'Ja, mit Nagellack', short: 'Mit Nagellack' },
        { id: 'lange', label: 'Ja, mit Farbe, die lange hält', short: 'Mit langanhaltender Farbe' }
      ]
    },
    foot_priority: {
      text: 'Was ist Ihnen dabei am wichtigsten?',
      options: [
        { id: 'pflege', label: 'Gründliche Pflege' },
        { id: 'entspannung', label: 'Entspannung und Wohlgefühl' },
        { id: 'optik', label: 'Gepflegte Optik' }
      ]
    },
    hair_who: {
      text: 'Für wen ist die Behandlung?',
      options: [
        { id: 'frau', label: 'Für eine Frau', short: 'Für eine Frau' },
        { id: 'mann', label: 'Für einen Mann', short: 'Für einen Mann' }
      ]
    },
    hair_zone_f: {
      text: 'Welche Zone soll behandelt werden?',
      options: [
        { id: 'gesicht', label: 'Gesicht (Oberlippe, Kinn)' },
        { id: 'achseln', label: 'Achseln' },
        { id: 'bikini', label: 'Bikinizone oder Intimbereich' },
        { id: 'beine', label: 'Beine' },
        { id: 'arme', label: 'Arme' },
        { id: 'mehrere', label: 'Mehrere Zonen' }
      ]
    },
    hair_zone_m: {
      text: 'Welche Zone soll behandelt werden?',
      options: [
        { id: 'brustbauch', label: 'Brust und Bauch' },
        { id: 'ruecken', label: 'Rücken' },
        { id: 'nackenschulter', label: 'Nacken und Schultern' },
        { id: 'achseln', label: 'Achseln' },
        { id: 'armebeine', label: 'Arme oder Beine' },
        { id: 'mehrere', label: 'Mehrere Zonen' }
      ]
    },
    relax_type: {
      text: 'Wobei entspannen Sie am besten?',
      options: [
        { id: 'gesicht', label: 'Bei einer Gesichtsbehandlung' },
        { id: 'fuss', label: 'Bei einer Fußpflege mit SPA' },
        { id: 'beides', label: 'Am liebsten beides an einem Tag' }
      ]
    },
    relax_time: {
      text: 'Wie viel Zeit möchten Sie sich nehmen?',
      options: [
        { id: 'std', label: 'Etwa eine Stunde', short: 'Etwa eine Stunde' },
        { id: 'lang', label: 'Anderthalb Stunden oder mehr', short: 'Anderthalb Stunden und mehr' }
      ]
    }
  };

  // ---- Ergebnislogik je Anliegen-Typ ("Flow"). Jeder Flow stellt zwei Vertiefungsfragen
  // und leitet daraus konkrete Leistungen ab. `later` = Folgetermin, wird nicht mitgerechnet.
  const SKIN_NOTES = {
    'eher-trocken': 'Wir setzen den Schwerpunkt auf Feuchtigkeit und eine reichhaltige Pflege.',
    'eher-fettig': 'Wir arbeiten klärend und porenverfeinernd, ohne die Haut auszutrocknen.',
    'mischhaut': 'Wir behandeln die Zonen unterschiedlich — klärend in der T-Zone, pflegend an den Wangen.',
    'empfindlich': 'Wir wählen besonders milde Wirkstoffe und arbeiten behutsam.',
    'unsicher': 'Kein Problem — wir starten mit einer kurzen Hautanalyse vor Ort.'
  };

  function resolveFace(sel) {
    const c = sel.concern.id;
    const skin = sel.a1.id;
    const neu = sel.a2.id === 'neu';
    const anlass = sel.occasion.id === 'anlass';
    const notes = [];
    let main;
    let alts = [];
    let anlassNote = null;

    if (c === 'fahl') {
      if (skin === 'empfindlich' || skin === 'eher-trocken') {
        main = 'aquaderm';
        alts = [{ id: 'glow', text: 'Intensiver' }];
        notes.push('AquaDerm reinigt die Haut per Vakuum in der Tiefe und versorgt sie intensiv mit Wirkstoffen — für ein gepflegtes, aufgepolstertes Ergebnis.');
      } else {
        main = 'glow';
        alts = [{ id: 'aquaderm', text: 'Kompakter' }];
        notes.push('MicroDerm meets AquaDerm trägt abgestorbene Hautzellen ab und schleust Wirkstoffe tief ein — für ein samtweiches, strahlendes Hautbild.');
      }
      anlassNote = 'Der Glow ist schon nach einer einzigen Behandlung sichtbar — ideal kurz vor dem Anlass.';
    } else if (c === 'trocken') {
      if (skin === 'empfindlich') {
        main = 'relax';
        alts = [{ id: 'softneedling', text: 'Für die Hautbarriere' }];
        notes.push('Die Relax Behandlung verwöhnt Gesicht, Hals und Dekolleté mit Massage, Maske und Wirkstoff-Ampulle — sanft und beruhigend.');
      } else if (anlass) {
        main = 'hyaluron';
        alts = [{ id: 'softneedling', text: 'Kompakter' }];
        notes.push('Soft Needling mit dreifacher Hyaluronsäure versorgt die Haut in der Tiefe mit Feuchtigkeit — ganz ohne Ausfallzeit.');
        anlassNote = 'Glow und aufgepolsterte Haut sind sofort sichtbar, ohne Ausfallzeit — ideal kurz vor dem Anlass.';
      } else {
        main = 'softneedling';
        alts = [{ id: 'hyaluron', text: 'Intensiver' }];
        notes.push('Soft Needling stärkt die Hautbarriere und aktiviert die Haut in der Tiefe — ganz ohne Ausfallzeit.');
      }
    } else if (c === 'unrein') {
      main = 'clean';
      notes.push('Die Clean & Activ Behandlung reinigt intensiv aus — ideal bei tiefliegenden Unreinheiten.');
      anlassNote = 'Bei einer tiefen Ausreinigung planen wir ausreichend Abstand zu Ihrem Anlass ein.';
    } else if (c === 'pigment') {
      if (asaSeason()) {
        main = 'asa';
        alts = [{ id: 'asakur', text: 'Empfohlen als Kur' }];
        notes.push('ASA ist eine Fruchtsäure-Kombination, die die Hautoberfläche verfeinert — für ein ebenmäßigeres Hautbild mit weniger Pigmenten.');
        notes.push('Wir empfehlen die 3er-Kur — mit Heimpflege im Wert von 30 € gratis dazu.');
      } else {
        main = 'microderm';
        notes.push('ASA Peel (Fruchtsäure) ist wegen der UV-Strahlung nur von Herbst bis März buchbar. Bis dahin verfeinert MicroDerm das Hautbild sanft.');
      }
    } else {
      main = 'microneedling';
      notes.push('Micro Needling regt die Selbstheilung der Haut an — bei Narben und Unebenheiten wirkt es am besten als Kur. Bitte eine kurze Ausfallzeit einplanen.');
      anlassNote = 'Micro Needling hat eine Ausfallzeit — planen Sie ausreichend Abstand zu Ihrem Anlass ein.';
    }

    const lines = [];
    if (neu) {
      lines.push(L('startup', 'Einstieg'));
      lines.push(L(main, 'Danach passend', true));
      notes.unshift('Für den Einstieg empfehlen wir die Start Up Behandlung: Nach einer digitalen Hautanalyse erstellen wir Ihren individuellen Pflege- und Behandlungsplan.');
    } else {
      lines.push(L(main, 'Behandlung'));
    }
    notes.push(SKIN_NOTES[skin]);
    return { treatment: 'gesicht', lines: lines, alts: neu ? [] : alts, notes: notes, anlass: anlassNote };
  }

  function resolveForma(sel) {
    const zone = sel.a1.id;
    const neu = sel.a2.id === 'neu';
    const svc = { augen: 'forma_augen', jawline: 'forma_jaw', hals: 'forma_hals', lippen: 'forma_lippen', mehrere: 'forma2' }[zone];
    const zoneNotes = {
      augen: 'FORMA strafft gezielt den Augenbereich — oberes Augenlid und unter dem Auge.',
      jawline: 'Auch Doppelkinn und unterer Wangenbereich werden gezielt gestrafft.',
      hals: 'FORMA aktiviert Kollagen in der Tiefe und baut über Wärme neue Kollagenstrukturen auf.',
      lippen: 'FORMA strafft gezielt Lippenfältchen und die umliegende Partie.',
      mehrere: 'Bei mehreren Partien planen wir gemeinsam, welche Zonen in welcher Reihenfolge behandelt werden.'
    };
    const lines = neu ? [L('forma_beratung', 'Einstieg'), L(svc, 'Behandlung')] : [L(svc, 'Behandlung')];
    const notes = [zoneNotes[zone], 'FORMA wirkt als Kur: Für ein sichtbares, langfristiges Ergebnis empfehlen wir in der Regel eine 6er-Kur.'];
    notes.push(neu
      ? 'Im kostenlosen Beratungsgespräch prüfen wir gemeinsam, ob FORMA für Sie das Richtige ist.'
      : 'Kur-Angebote besprechen wir gern persönlich.');
    const alts = zone === 'mehrere' ? [{ id: 'forma3', text: 'Drei Zonen' }, { id: 'forma4', text: 'Vier Zonen' }] : [];
    return {
      treatment: 'forma', lines: lines, alts: alts, notes: notes,
      anlass: 'FORMA wirkt als Kur — starten Sie frühzeitig, damit das Ergebnis bis zum Anlass sichtbar wird.'
    };
  }

  function resolveLash(sel) {
    const both = sel.a1.id === 'beides';
    const tint = sel.a2.id === 'ja';
    const lines = [L('lash_lift', 'Behandlung')];
    if (both) lines.push(L('browlift', 'Behandlung'));
    if (tint) {
      lines.push(L('lash_tint_add', 'Dazu'));
      if (both) lines.push(L('brow_tint_add', 'Dazu'));
    }
    const notes = ['Das Ergebnis hält je nach Wimper etwa 4–8 Wochen.'];
    if (both) notes.push('Wimpernlifting und Browlift lassen sich gut in einem Termin kombinieren.');
    if (sel.concern.id === 'mascara') notes.push('Mit Lifting und Färben kommen Sie im Alltag oft ganz ohne Mascara aus.');
    if (!tint) notes.push('Färben lässt sich jederzeit als Extra zum Termin dazu buchen.');
    return {
      treatment: 'wimpern', lines: lines, alts: [], notes: notes,
      anlass: 'Das Ergebnis hält etwa 4–8 Wochen — ein Termin kurz vor dem Anlass passt gut.'
    };
  }

  function resolveBrow(sel) {
    const how = sel.a1.id;
    const tint = sel.a2.id === 'ja';
    const main = { zupfen: 'brow_pluck', wachsen: 'brow_wax', lift: 'browlift', beraten: 'brow_pluck' }[how];
    const lines = [L(main, 'Behandlung')];
    if (tint) lines.push(L(how === 'lift' ? 'brow_tint_add' : 'brow_tint', 'Dazu'));
    const notes = [];
    if (how === 'lift') notes.push('Der Browlift lässt Ihre Augenbrauen voller und dichter erscheinen.');
    else if (how === 'beraten') notes.push('Vor Ort besprechen wir gemeinsam Form und Farbe Ihrer Brauen.');
    else notes.push('Für eine saubere, gepflegte Form — schnell und unkompliziert.');
    if (!tint) notes.push('Brauen färben lässt sich jederzeit als Extra dazu buchen.');
    return { treatment: 'wimpern', lines: lines, alts: [], notes: notes, anlass: null };
  }

  function resolveHands(sel) {
    const c = sel.concern.id;
    const wish = sel.a1.id;
    const color = sel.a2.id;
    const gel = wish === 'gel';
    const notes = [];
    let main = 'mani';
    if (gel) main = c === 'brueckig' ? 'nail_strength' : 'gel_new';
    const lines = [L(main, 'Behandlung')];
    if (!gel && (wish === 'pflege' || c === 'rau')) lines.push(L('spa_hand', 'Dazu'));
    if (gel) lines.push(L('farbgel', 'Dazu'));
    else if (color === 'lack') lines.push(L('polish', 'Dazu'));
    else if (color === 'lange') lines.push(L('uvpolish', 'Dazu'));

    if (gel && main === 'nail_strength') notes.push('Die Natur Nagel Verstärkung stärkt Ihre eigenen Nägel mit Gel — ganz ohne Verlängerung.');
    else if (gel) notes.push('Die Gel Modellage kann mit Tips oder Schablone verlängert werden.');
    else if (wish === 'natur') notes.push('Wir pflegen Ihren Naturnagel und bringen ihn in Form.');
    else if (wish === 'beraten') notes.push('Wir schauen vor Ort gemeinsam, was zu Ihren Nägeln passt.');
    if (!gel && (wish === 'pflege' || c === 'rau')) notes.push('Das SPA Hand bringt Peeling, Serum, Handpackung und Handmassage — pure Pflege für trockene, raue Hände.');
    if (gel) notes.push('Bei Gel gehört Farbe oder French immer dazu.');
    if (!gel && color === 'lange') notes.push('Der UV-Nagellack hält etwa 14 Tage und ist nur zusammen mit der Wellness Maniküre buchbar.');
    return { treatment: 'haende', lines: lines, alts: [], notes: notes, anlass: null };
  }

  function resolveFeet(sel) {
    const c = sel.concern.id;
    const priority = sel.a1.id;
    const color = sel.a2.id;
    const lines = [L('pedi', 'Behandlung')];
    const notes = ['Die Wellness Fußpflege umfasst Fußbad, Behandlung von Nägeln, Nagelhaut und Hornhaut sowie eine Fußmassage.'];
    if (priority === 'entspannung') {
      lines.push(L('spa_foot', 'Dazu'));
      notes.push('Das SPA Fuß bringt Peeling, Serum, Fußpackung und eine zusätzliche Fußmassage — Wohlgefühl für müde, schwere Füße.');
    } else if (c === 'muede-fuesse') {
      lines.push(L('foot_massage', 'Dazu'));
      notes.push('Die zusätzliche Fußmassage aktiviert das Nervensystem — wohltuend bei müden, schweren Füßen.');
    } else if (c === 'hornhaut' || priority === 'pflege') {
      lines.push(L('foot_peel', 'Dazu'));
      notes.push('Mit dem GEHWOL Fußpeeling werden raue Stellen und Hornhaut besonders gründlich abgetragen.');
    }
    if (color === 'lack') {
      lines.push(L('foot_polish', 'Dazu'));
      notes.push('Der Nagellack hält etwa 4 Wochen.');
    } else if (color === 'lange') {
      lines.push(L('foot_uvpolish', 'Dazu'));
      notes.push('Der UV-Nagellack hält etwa 4–6 Wochen.');
    }
    return { treatment: 'fuesse', lines: lines, alts: [], notes: notes, anlass: null };
  }

  function resolveHair(sel) {
    const mann = sel.a1.id === 'mann';
    const zone = sel.a2.id;
    const plan = mann ? {
      brustbauch: { main: 'h_chest_belly', alts: [['h_chest', 'Nur Brust'], ['h_belly', 'Nur Bauch']], note: 'Brust und Bauch behandeln wir gern in einem Termin.' },
      ruecken: { main: 'h_back', alts: [['h_partback', 'Nur Teilrücken'], ['h_back_shoulder', 'Mit Schultern']], note: 'Für den Rücken planen wir etwas mehr Zeit pro Sitzung ein.' },
      nackenschulter: { main: 'h_neck_shoulder', alts: [['h_neck', 'Nur Nacken'], ['h_shoulders', 'Nur Schultern']], note: 'Nacken und Schultern lassen sich gut zusammen behandeln.' },
      achseln: { main: 'h_armpit', alts: [], note: 'Die Achseln sind schnell behandelt.' },
      armebeine: { main: 'h_arms', alts: [['h_legs', 'Beine komplett']], note: 'Arme oder Beine — im Beratungsgespräch besprechen wir, was für Sie sinnvoll ist.' },
      mehrere: { main: 'h_all3', alts: [['h_bsn', 'Rücken, Schulter, Nacken']], note: 'Für mehrere Zonen lohnt sich ein gemeinsamer Behandlungsplan — dafür ist das kostenlose Beratungsgespräch ideal.' }
    } : {
      gesicht: { main: 'lipchin', alts: [['lip', 'Nur Oberlippe'], ['chin', 'Nur Kinn']], note: 'Kleine Zonen wie Oberlippe oder Kinn sind schnell behandelt.' },
      achseln: { main: 'armpit', alts: [], note: 'Die Achseln sind eine der schnellsten Zonen.' },
      bikini: { main: 'bikini', alts: [['intim', 'Intimbereich']], note: 'Wir besprechen den gewünschten Umfang diskret und in Ruhe.' },
      beine: { main: 'legs', alts: [['lowerleg', 'Nur Unterschenkel'], ['upperleg', 'Nur Oberschenkel']], note: 'Für die Beine planen wir etwas mehr Zeit pro Sitzung ein.' },
      arme: { main: 'arms', alts: [['forearm', 'Nur Unterarme'], ['upperarm', 'Nur Oberarme']], note: 'Ober- und Unterarme behandeln wir wahlweise einzeln oder komplett.' },
      mehrere: { main: 'pkg_ab', alts: [['pkg_ai', 'Achseln + Intimbereich'], ['pkg_aib', 'Achseln, Intim, Beine']], note: 'Für mehrere Zonen lohnt sich ein gemeinsamer Behandlungsplan — dafür ist das kostenlose Beratungsgespräch ideal.' }
    };
    const p = plan[zone];
    const notes = [p.note, 'Für ein glattes, langfristiges Ergebnis ist in der Regel eine Serie von Behandlungen nötig.'];
    if (mann) notes.unshift('Die Behandlung ist für Damen und Herren geeignet — für Herren gibt es eigene Zonen und Pakete.');
    notes.push('Zur Vorbereitung: 24 Stunden vorher rasieren, 4 Wochen vorher nicht zupfen, epilieren oder waxen.');
    return {
      treatment: 'diolaze',
      lines: [L('hair_consult', 'Zum Kennenlernen'), L(p.main, 'Behandlung')],
      alts: p.alts.map((a) => ({ id: a[0], text: a[1] })),
      notes: notes,
      anlass: 'Für ein glattes Ergebnis sind mehrere Sitzungen nötig — starten Sie deshalb frühzeitig.'
    };
  }

  function resolveRelax(sel) {
    const type = sel.a1.id;
    const lang = sel.a2.id === 'lang';
    const notes = [];
    let treatment = 'gesicht';
    let secondary = null;
    let lines;
    if (type === 'gesicht') {
      lines = [L(lang ? 'deluxe' : 'relax', 'Behandlung')];
      notes.push(lang
        ? 'Die Deluxe Treatments verbinden die Regeneration der Haut mit einer Auszeit für die Seele.'
        : 'Die Relax Behandlung ist unsere Verwöhnbehandlung für eine kleine Auszeit vom Alltag — mit Massage, Maske und Pflege.');
    } else if (type === 'fuss') {
      treatment = 'fuesse';
      if (lang) {
        secondary = 'haende';
        lines = [L('hand_foot', 'Behandlung')];
        notes.push('Beautiful Hand & Fuß verwöhnt Hände und Füße gemeinsam in einer ausgiebigen Kombi-Behandlung.');
      } else {
        lines = [L('pedi', 'Behandlung'), L('spa_foot', 'Dazu')];
        notes.push('Wir schenken Ihren Füßen eine Auszeit vom Alltag: mit Fußbad, Fußpflege, Peeling, Packung und Massage.');
      }
    } else {
      secondary = 'fuesse';
      lines = lang
        ? [L('deluxe', 'Gesicht'), L('pedi', 'Füße'), L('spa_foot', 'Dazu')]
        : [L('relax', 'Gesicht'), L('pedi', 'Füße')];
      notes.push('Gesichtsbehandlung und Fußpflege lassen sich gut an einem Tag kombinieren.');
    }
    const total = lines.reduce((s, l) => s + SVC[l.id].min, 0);
    if (type === 'beides') notes.push('Dafür sollten Sie etwa ' + Math.floor(total / 60) + ' Std. ' + (total % 60 ? (total % 60) + ' Min. ' : '') + 'einplanen.');
    return { treatment: treatment, secondary: secondary, lines: lines, alts: [], notes: notes, anlass: null };
  }

  const FLOWS = {
    face: { q: ['skin', 'client'], resolve: resolveFace },
    forma: { q: ['forma_zone', 'client'], resolve: resolveForma },
    lash: { q: ['lash_focus', 'tint_lash'], resolve: resolveLash },
    brow: { q: ['brow_how', 'tint_brow'], resolve: resolveBrow },
    hands: { q: ['hand_wish', 'color'], resolve: resolveHands },
    feet: { q: ['foot_priority', 'color'], resolve: resolveFeet },
    hair: { q: ['hair_who', (sel) => (sel.a1 && sel.a1.id === 'mann' ? 'hair_zone_m' : 'hair_zone_f')], resolve: resolveHair },
    relax: { q: ['relax_type', 'relax_time'], resolve: resolveRelax }
  };

  // Frage 1 wählt den Bereich, Frage 2 das konkrete Anliegen (bestimmt den Flow). Fragen 3 und 4
  // hängen vom Anliegen ab und legen die konkrete Leistung fest, Frage 5 den Zeitrahmen.
  const AREAS = [
    {
      id: 'haut', label: 'Meine Gesichtshaut',
      concerns: [
        { id: 'fahl', label: 'Wirkt fahl, müde und ohne Frische', flow: 'face' },
        { id: 'trocken', label: 'Spannt, ist trocken oder empfindlich', flow: 'face' },
        { id: 'unrein', label: 'Unreinheiten, Mitesser oder große Poren', flow: 'face' },
        { id: 'pigment', label: 'Pigmentflecken oder ein ungleichmäßiger Teint', flow: 'face' },
        { id: 'narben', label: 'Narben, Pickelmale oder Unebenheiten', flow: 'face' },
        { id: 'linien', label: 'Erste Linien, weniger Spannkraft', flow: 'forma' },
        { id: 'kontur', label: 'Konturen an Jawline oder Hals', flow: 'forma' }
      ]
    },
    {
      id: 'augen', label: 'Augen & Brauen',
      concerns: [
        { id: 'kurz', label: 'Meine Wimpern wirken kurz und gerade', flow: 'lash' },
        { id: 'mascara', label: 'Ich möchte ohne Mascara auskommen', flow: 'lash' },
        { id: 'brauen', label: 'Meine Brauen sollen in Form gebracht werden', flow: 'brow' }
      ]
    },
    {
      id: 'haende', label: 'Hände & Nägel',
      concerns: [
        { id: 'brueckig', label: 'Brüchige oder unregelmäßige Nägel', flow: 'hands' },
        { id: 'rau', label: 'Trockene, raue Hände', flow: 'hands' },
        { id: 'anlass-naegel', label: 'Schöne Nägel für einen besonderen Anlass', flow: 'hands' }
      ]
    },
    {
      id: 'fuesse', label: 'Füße',
      concerns: [
        { id: 'hornhaut', label: 'Hornhaut und raue Stellen', flow: 'feet' },
        { id: 'muede-fuesse', label: 'Müde, schwere Füße', flow: 'feet' },
        { id: 'sandale', label: 'Ich möchte sandalenbereit sein', flow: 'feet' }
      ]
    },
    {
      id: 'haarentfernung', label: 'Dauerhafte Haarentfernung',
      concerns: [
        { id: 'rasur-leid', label: 'Ich bin das ständige Rasieren leid', flow: 'hair' },
        { id: 'reizung', label: 'Rasur reizt meine Haut oder verursacht Pickelchen', flow: 'hair' },
        { id: 'zeit', label: 'Ich möchte langfristig Zeit sparen', flow: 'hair' }
      ]
    },
    {
      id: 'entspannen', label: 'Einfach mal Zeit für mich',
      concerns: [
        { id: 'auszeit', label: 'Ich hatte lange keine richtige Auszeit', flow: 'relax' },
        { id: 'verwoehnen', label: 'Ich möchte mich rundum verwöhnen lassen', flow: 'relax' },
        { id: 'geschenk', label: 'Als Geschenk für mich selbst', flow: 'relax' }
      ]
    }
  ];

  const OCCASIONS = [
    { id: 'zeitnah', label: 'So bald wie möglich' },
    { id: 'wochen', label: 'In den nächsten Wochen' },
    { id: 'anlass', label: 'Vor einem besonderen Anlass' },
    { id: 'info', label: 'Erstmal nur informieren' }
  ];

  const overlay = document.getElementById('finderOverlay');
  if (!overlay) return;
  const modal = overlay.querySelector('.finder-modal');
  const finderBody = document.getElementById('finderBody');
  const progressFill = document.getElementById('finderProgressFill');
  const backBtn = document.getElementById('finderBack');
  const closeBtn = document.getElementById('finderClose');
  const openTriggers = document.querySelectorAll('.js-open-finder');

  const STEP_ORDER = ['area', 'concern', 'q1', 'q2', 'occasion', 'result'];
  const TOTAL_STEPS = 5;
  let stepIdx = 0;
  const emptySelection = () => ({ area: null, concern: null, a1: null, a2: null, occasion: null });
  let selection = emptySelection();
  let lastFocused = null;

  const leafIcon = () => '<svg class="leaf-ico" viewBox="0 0 40 100"><use href="#leaf"></use></svg>';
  const chevronIcon = () => '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

  function buildOptions(items, selectedId, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'finder-options';
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'finder-option' + (item.id === selectedId ? ' selected' : '');
      btn.innerHTML = '<span>' + item.label + '</span>' + chevronIcon();
      btn.addEventListener('click', () => onPick(item));
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function stepLabel(n) {
    return '<p class="finder-step-label">' + leafIcon() + 'Schritt ' + n + ' von ' + TOTAL_STEPS + '</p>';
  }

  function renderAreaStep() {
    finderBody.innerHTML = stepLabel(1) + '<h3>Worum geht es Ihnen heute?</h3>';
    finderBody.appendChild(buildOptions(AREAS, selection.area && selection.area.id, (area) => {
      if (!selection.area || selection.area.id !== area.id) {
        selection.concern = null; selection.a1 = null; selection.a2 = null;
      }
      selection.area = area;
      stepIdx = 1;
      renderCurrentStep();
    }));
  }

  function renderConcernStep() {
    finderBody.innerHTML = stepLabel(2) + '<h3>Was beschreibt Ihr Anliegen am besten?</h3>';
    finderBody.appendChild(buildOptions(selection.area.concerns, selection.concern && selection.concern.id, (concern) => {
      if (!selection.concern || selection.concern.id !== concern.id) {
        selection.a1 = null; selection.a2 = null;
      }
      selection.concern = concern;
      stepIdx = 2;
      renderCurrentStep();
    }));
  }

  function questionId(qIndex) {
    const spec = FLOWS[selection.concern.flow].q[qIndex];
    return typeof spec === 'function' ? spec(selection) : spec;
  }

  function renderQuestionStep(qIndex) {
    const q = QUESTIONS[questionId(qIndex)];
    const chosen = qIndex === 0 ? selection.a1 : selection.a2;
    finderBody.innerHTML = stepLabel(qIndex + 3) + '<h3>' + q.text + '</h3>';
    finderBody.appendChild(buildOptions(q.options, chosen && chosen.id, (opt) => {
      if (qIndex === 0) {
        if (!selection.a1 || selection.a1.id !== opt.id) selection.a2 = null;
        selection.a1 = opt;
        stepIdx = 3;
      } else {
        selection.a2 = opt;
        stepIdx = 4;
      }
      renderCurrentStep();
    }));
  }

  function renderOccasionStep() {
    finderBody.innerHTML = stepLabel(5) + '<h3>Wann möchten Sie starten?</h3>';
    finderBody.appendChild(buildOptions(OCCASIONS, selection.occasion && selection.occasion.id, (occasion) => {
      selection.occasion = occasion;
      stepIdx = 5;
      renderCurrentStep();
    }));
  }

  function occasionSentence(id) {
    if (id === 'zeitnah') return 'Wir schauen nach einem Termin, der zeitnah passt.';
    if (id === 'anlass') return 'Wir planen so, dass Sie rechtzeitig vor Ihrem Anlass fertig sind.';
    if (id === 'info') return 'Sie können sich in Ruhe informieren — ganz unverbindlich.';
    return 'Wir finden gemeinsam einen Termin in den nächsten Wochen.';
  }

  function computeResult() {
    const r = FLOWS[selection.concern.flow].resolve(selection);
    r.summary = [selection.a1, selection.a2].map((o) => o.short || o.label).join(' · ');
    if (!r.secondary && TREATMENTS[r.treatment].secondary) r.secondary = TREATMENTS[r.treatment].secondary;
    return r;
  }

  function totals(lines) {
    const visit = lines.filter((l) => !l.later);
    if (visit.filter((l) => SVC[l.id].price > 0).length < 2) return null;
    return {
      price: visit.reduce((s, l) => s + SVC[l.id].price, 0),
      min: visit.reduce((s, l) => s + SVC[l.id].min, 0)
    };
  }

  function serviceRowHtml(line) {
    const s = SVC[line.id];
    return '<li><span class="fs-name">' + (line.tag ? '<span class="fs-tag">' + line.tag + '</span>' : '') + s.name + '</span>' +
      '<span class="fs-meta">' + (s.meta || fmtMin(s.min)) + '</span>' +
      '<span class="fs-price">' + fmtPrice(s.price) + '</span></li>';
  }

  function servicesHtml(r) {
    const total = totals(r.lines);
    let html = '<div class="finder-services">' +
      '<p class="finder-services-title">Konkret empfehlen wir Ihnen</p>' +
      '<ul class="fs-list">' + r.lines.map(serviceRowHtml).join('') + '</ul>';
    if (total) html += '<p class="fs-total">Zusammen: <strong>' + fmtPrice(total.price) + '</strong> · ca. ' + fmtMin(total.min) + '</p>';
    if (r.alts.length) {
      html += '<p class="finder-services-title fs-alt-title">Auch möglich</p>' +
        '<ul class="fs-list fs-alt">' + r.alts.map((a) => serviceRowHtml({ id: a.id, tag: a.text })).join('') + '</ul>';
    }
    html += '<p class="fs-foot">Preise laut aktueller Preisliste (Stand ' + PRICE_STAND + '). <a href="' + ROOT_PREFIX + 'preise.html">Alle Preise ansehen</a></p></div>';
    return html;
  }

  function bookingHint(r) {
    const first = r.lines.filter((l) => !l.later).map((l) => SVC[l.id]);
    const quote = (s) => '„' + s.name + '“';
    const online = first.filter((s) => s.online).map(quote);
    const offline = first.filter((s) => !s.online).map(quote);
    const parts = [];
    if (online.length) parts.push('In der Online-Buchung finden Sie ' + joinList(online) + '.');
    if (offline.length) parts.push('Bitte buchen Sie ' + joinList(offline) + ' telefonisch oder per E-Mail.');
    return parts.join(' ');
  }

  function buildBookingMailto(r) {
    const list = r.lines.filter((l) => !l.later).map((l) => {
      const s = SVC[l.id];
      return '- ' + s.name + ' (' + plain(s.meta || fmtMin(s.min)) + ', ' + plain(fmtPrice(s.price)) + ')';
    }).join('\n');
    const subject = 'Terminanfrage: ' + TREATMENTS[r.treatment].name;
    const body =
      'Hallo liebes Beauty-Lounge-Team,\n\n' +
      'über den Selbsttest auf eurer Webseite interessiere ich mich für:\n' + list + '\n\n' +
      'Mein Anliegen: ' + selection.concern.label + '\n' +
      'Meine Angaben: ' + r.summary + '\n' +
      'Zeitrahmen: ' + selection.occasion.label + '\n\n' +
      'Bitte um einen Terminvorschlag.\n\n' +
      'Vielen Dank!';
    return 'mailto:info@beautylounge-neuss.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function renderResult() {
    const r = computeResult();
    const treatment = TREATMENTS[r.treatment];
    const secondary = r.secondary ? TREATMENTS[r.secondary] : null;
    const occasion = selection.occasion;
    const timing = occasionSentence(occasion.id) + (occasion.id === 'anlass' && r.anlass ? ' ' + r.anlass : '');
    const notesHtml = r.notes.slice(0, 4).map((n) => '<span class="finder-note">' + n + '</span>').join('');
    const hint = bookingHint(r);

    finderBody.innerHTML =
      '<div class="finder-result">' +
      '<svg class="finder-result-mark" viewBox="0 0 40 100"><use href="#leaf"></use></svg>' +
      '<p class="finder-eyebrow">Ihre Empfehlung</p>' +
      '<h3>Das passt zu Ihnen</h3>' +
      '<p class="finder-result-sub">Basierend auf Ihren fünf Antworten empfehlen wir Ihnen diese Behandlung.</p>' +
      '<dl class="finder-strategy">' +
      '<dt>Ihr Anliegen</dt><dd>' + selection.concern.label + '</dd>' +
      '<dt>Ihre Angaben</dt><dd>' + r.summary + '</dd>' +
      '<dt>Was das für Sie bedeutet</dt><dd>' + notesHtml + '</dd>' +
      '<dt>Zeitrahmen</dt><dd>' + timing + '</dd>' +
      '</dl>' +
      '<div class="finder-treatment-card">' +
      treatmentPictureHtml(r.treatment, treatment.name) +
      '<div class="finder-treatment-body">' +
      '<p class="finder-treatment-label">Hauptempfehlung</p>' +
      '<h4>' + treatment.name + '</h4>' +
      '<p>' + treatment.desc + '</p>' +
      '</div></div>' +
      servicesHtml(r) +
      (secondary ? '<div class="finder-treatment-card">' + treatmentPictureHtml(r.secondary, secondary.name) + '<div class="finder-treatment-body"><p class="finder-treatment-label">Sinnvolle Ergänzung</p><h4>' + secondary.name + '</h4><p>' + secondary.desc + '</p></div></div>' : '') +
      '<p class="finder-booking-label">So können Sie diese Behandlung buchen</p>' +
      (hint ? '<p class="finder-booking-hint">' + hint + '</p>' : '') +
      '<div class="finder-result-actions">' +
      '<a href="https://www.studiobookr.com/beauty-lounge-66137" target="_blank" rel="noopener" class="btn btn-primary">Jetzt online buchen</a>' +
      '<a href="tel:+4921314506806" class="btn btn-ghost">Jetzt anrufen</a>' +
      '<a href="' + buildBookingMailto(r) + '" class="btn btn-ghost">Per E-Mail anfragen</a>' +
      '</div>' +
      '<button type="button" class="finder-secondary-link" id="finderGoToTreatment">Mehr über diese Behandlung erfahren</button>' +
      '<button type="button" class="finder-restart" id="finderRestart">Selbsttest wiederholen</button>' +
      '</div>';

    document.getElementById('finderGoToTreatment').addEventListener('click', () => {
      window.location.href = ROOT_PREFIX + treatment.page;
    });
    document.getElementById('finderRestart').addEventListener('click', () => {
      selection = emptySelection();
      stepIdx = 0;
      renderCurrentStep();
    });
  }

  function setProgress() {
    const pct = (Math.min(stepIdx, TOTAL_STEPS) / TOTAL_STEPS) * 100;
    progressFill.style.width = pct + '%';
    backBtn.hidden = stepIdx === 0;
  }

  function renderCurrentStep() {
    setProgress();
    const name = STEP_ORDER[stepIdx];
    if (name === 'area') renderAreaStep();
    else if (name === 'concern') renderConcernStep();
    else if (name === 'q1') renderQuestionStep(0);
    else if (name === 'q2') renderQuestionStep(1);
    else if (name === 'occasion') renderOccasionStep();
    else renderResult();
    finderBody.scrollTop = 0;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { closeFinder(); return; }
    if (e.key === 'Tab') {
      const focusable = Array.from(modal.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])'))
        .filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  function openFinder() {
    lastFocused = document.activeElement;
    selection = emptySelection();
    stepIdx = 0;
    renderCurrentStep();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
    window.setTimeout(() => {
      const firstOption = finderBody.querySelector('.finder-option');
      if (firstOption) firstOption.focus();
    }, 50);
  }

  function closeFinder() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  openTriggers.forEach((btn) => btn.addEventListener('click', openFinder));
  closeBtn.addEventListener('click', closeFinder);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeFinder(); });
  backBtn.addEventListener('click', () => {
    if (stepIdx > 0) { stepIdx -= 1; renderCurrentStep(); }
  });
})();

// eignungscheck — behandlungsspezifischer "Passt das zu mir?"-Kurzfragebogen.
// Rein informativ: ersetzt kein Beratungsgespräch, sondern bereitet es vor.
// Bei jeder "Ja"-Antwort wird auf das kostenlose Beratungsgespräch verwiesen statt
// automatisch eine medizinische Einschätzung abzugeben.
(function () {
  const SUITABILITY_DATA = {
    forma: {
      name: 'FORMA Hautstraffung',
      questions: [
        'Sind Sie aktuell schwanger?',
        'Tragen Sie einen Herzschrittmacher oder andere elektronische Implantate?',
        'Haben Sie Metallimplantate im zu behandelnden Bereich (z. B. feste Zahnspange)?',
        'Liegen aktuell Hautinfektionen, offene Wunden oder Entzündungen im Behandlungsbereich vor?',
        'Besteht bei Ihnen aktuell eine Krebserkrankung oder wurde eine solche im Behandlungsbereich behandelt?'
      ]
    },
    diolaze: {
      name: 'DIOLAZE Haarentfernung',
      questions: [
        'Sind Sie aktuell schwanger?',
        'Waren Sie in den letzten 2–3 Wochen intensiv in der Sonne oder im Solarium (aktuell gebräunte Haut)?',
        'Nehmen Sie photosensibilisierende Medikamente ein (z. B. bestimmte Antibiotika oder Isotretinoin)?',
        'Haben Sie Tattoos oder Permanent Make-up im zu behandelnden Bereich?',
        'Neigen Sie zu Keloiden (stark wuchernder Narbenbildung) oder Pigmentstörungen?'
      ]
    },
    gesicht: {
      name: 'Gesichtsbehandlungen',
      questions: [
        'Haben Sie aktuell einen Sonnenbrand, akute Hautreizungen oder offene Wunden im Gesicht?',
        'Sind Ihnen Allergien gegen Kosmetikinhaltsstoffe bekannt?',
        'Verwenden Sie aktuell hochdosiertes Retinol/Vitamin A oder hatten Sie kürzlich ein chemisches Peeling?',
        'Neigen Sie zu Herpes im Gesichtsbereich?'
      ]
    },
    wimpern: {
      name: 'Wimpernlifting',
      questions: [
        'Haben Sie aktuell eine Augenreizung oder -infektion (z. B. Bindehautentzündung)?',
        'Sind Ihnen Allergien gegen Wimpern- oder Kosmetikprodukte bekannt?',
        'Hatten Sie kürzlich eine Augen-OP oder -behandlung?',
        'Sind Ihre Wimpern aktuell stark geschwächt oder sehr dünn?'
      ]
    },
    haende: {
      name: 'Hand & Nagelpflege',
      questions: [
        'Haben Sie akute Hautinfektionen, Nagelpilz oder offene Wunden an Händen oder Nägeln?',
        'Sind Ihnen Allergien gegen Nagellack- oder Gel-Inhaltsstoffe bekannt?',
        'Ist Ihre Nagelhaut aktuell verletzt oder frisch behandelt?'
      ]
    },
    fuesse: {
      name: 'Fußpflege',
      questions: [
        'Haben Sie Diabetes mellitus?',
        'Liegen offene Wunden oder akute Pilzinfektionen an den Füßen vor?',
        'Sind Ihnen Durchblutungsstörungen in Beinen oder Füßen bekannt?'
      ]
    }
  };

  const overlay = document.getElementById('finderOverlay');
  if (!overlay) return;
  const modal = overlay.querySelector('.finder-modal');
  const body = document.getElementById('finderBody');
  const progressFill = document.getElementById('finderProgressFill');
  const backBtn = document.getElementById('finderBack');
  const closeBtn = document.getElementById('finderClose');
  const triggers = document.querySelectorAll('.js-open-suitability');
  if (!triggers.length) return;

  let current = null;
  let answers = {};
  let lastFocused = null;

  function renderQuestions() {
    backBtn.hidden = true;
    progressFill.style.width = '35%';
    const allAnswered = current.questions.every((_, i) => answers[i] !== undefined);
    body.innerHTML =
      '<p class="finder-step-label">Eignungscheck</p>' +
      '<h3>Passt ' + current.name + ' zu Ihnen?</h3>' +
      '<p class="sub" style="margin:0 0 1.3rem;font-size:0.92rem;">Beantworten Sie kurz diese Fragen — so können wir uns optimal auf Ihren Termin vorbereiten. Das ersetzt kein Beratungsgespräch, hilft uns aber, Sie gezielt zu beraten.</p>' +
      '<div class="suitability-list">' +
      current.questions.map((q, i) =>
        '<div class="suitability-item">' +
          '<p>' + q + '</p>' +
          '<div class="suitability-toggle" data-idx="' + i + '">' +
            '<button type="button" class="' + (answers[i] === true ? 'active' : '') + '" data-val="yes">Ja</button>' +
            '<button type="button" class="' + (answers[i] === false ? 'active' : '') + '" data-val="no">Nein</button>' +
          '</div>' +
        '</div>'
      ).join('') +
      '</div>' +
      '<button type="button" class="btn btn-primary" id="suitabilitySubmit" style="margin-top:1.5rem;width:100%;justify-content:center;"' + (allAnswered ? '' : ' disabled') + '>Auswertung ansehen</button>';

    body.querySelectorAll('.suitability-toggle').forEach((toggle) => {
      const idx = Number(toggle.getAttribute('data-idx'));
      toggle.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          answers[idx] = btn.getAttribute('data-val') === 'yes';
          renderQuestions();
        });
      });
    });
    const submitBtn = document.getElementById('suitabilitySubmit');
    if (submitBtn) submitBtn.addEventListener('click', renderResult);
  }

  function renderResult() {
    progressFill.style.width = '100%';
    const flagged = current.questions.filter((_, i) => answers[i] === true);
    const positive = flagged.length === 0;
    body.innerHTML =
      '<div class="finder-result">' +
      '<p class="finder-eyebrow">Ihr Eignungscheck</p>' +
      '<h3>' + (positive ? 'Nach Ihren Angaben spricht nichts dagegen' : 'Das besprechen wir am besten persönlich') + '</h3>' +
      '<p class="finder-result-sub">' + (positive
        ? 'Schön — nach Ihren Angaben steht ' + current.name + ' nichts im Wege. Wir freuen uns, Sie bald bei uns begrüßen zu dürfen.'
        : 'Bei ' + flagged.length + ' ' + (flagged.length === 1 ? 'Ihrer Angaben' : 'Ihrer Angaben') + ' schauen wir am besten gemeinsam genauer hin, damit ' + current.name + ' sicher und passend für Sie ist.') + '</p>' +
      (positive ? '' :
        '<dl class="finder-strategy">' +
          flagged.map((q) => '<dt>Bitte ansprechen</dt><dd>' + q + '</dd>').join('') +
        '</dl>'
      ) +
      '<p class="finder-booking-label">' + (positive ? 'So können Sie direkt buchen' : 'So geht es weiter') + '</p>' +
      '<div class="finder-result-actions">' +
      (positive
        ? '<a href="https://www.studiobookr.com/beauty-lounge-66137" target="_blank" rel="noopener" class="btn btn-primary">Jetzt online buchen</a>' +
          '<a href="tel:+4921314506806" class="btn btn-ghost">Jetzt anrufen</a>'
        : '<a href="tel:+4921314506806" class="btn btn-primary">Kostenloses Beratungsgespräch anrufen</a>' +
          '<a href="https://www.studiobookr.com/beauty-lounge-66137" target="_blank" rel="noopener" class="btn btn-ghost">Trotzdem online buchen</a>'
      ) +
      '</div>' +
      '<button type="button" class="finder-restart" id="suitabilityRestart">Nochmal ausfüllen</button>' +
      '</div>';
    document.getElementById('suitabilityRestart').addEventListener('click', () => {
      answers = {};
      renderQuestions();
    });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      const focusable = Array.from(modal.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])'))
        .filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  function open(treatmentKey) {
    current = SUITABILITY_DATA[treatmentKey];
    if (!current) return;
    answers = {};
    lastFocused = document.activeElement;
    renderQuestions();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => open(btn.getAttribute('data-treatment')));
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
})();
