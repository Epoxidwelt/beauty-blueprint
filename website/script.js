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

// behandlungsfinder — guided treatment recommender
// Mirrors the Beauty Blueprint consultation logic (Ziel -> Pain Point -> Anlass -> Strategie -> Empfehlung),
// scaled down to a 3-question client-side quiz for website visitors.
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
      name: 'Wimpernlifting',
      desc: 'Verleiht Ihren Naturwimpern einen tollen Schwung — der perfekte Augenaufschlag für 4–8 Wochen.',
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
      desc: 'Dauerhafte Haarentfernung mit dem InMode Alexandrit-Dioden-Laser.',
      page: 'behandlungen/diolaze-haarentfernung.html'
    }
  };

  const ROOT_PREFIX = window.location.pathname.indexOf('/behandlungen/') !== -1 ? '../' : '';

  // Frage 1 wählt den Bereich, Frage 2 das konkrete Anliegen — und *erst das Anliegen*
  // bestimmt die Behandlung (innerhalb eines Bereichs kann das unterschiedlich ausfallen,
  // z. B. "fahle Haut" -> Gesichtsbehandlung, "nachlassende Spannkraft" -> FORMA).
  // Frage 3 ist eine bereichsspezifische Detailfrage, die die Empfehlung weiter schärft.
  const FINDER_DATA = [
    {
      id: 'haut', label: 'Meine Gesichtshaut',
      concerns: [
        { id: 'fahl', label: 'Wirkt fahl, müde und ohne Frische', treatment: 'gesicht' },
        { id: 'trocken', label: 'Spannt, ist trocken oder empfindlich', treatment: 'gesicht' },
        { id: 'unrein', label: 'Unreinheiten, Mitesser oder große Poren', treatment: 'gesicht' },
        { id: 'linien', label: 'Erste Linien, weniger Spannkraft', treatment: 'forma' },
        { id: 'kontur', label: 'Konturen an Jawline oder Hals', treatment: 'forma' }
      ],
      detail: {
        question: 'Und wie fühlt sich Ihre Haut meistens an?',
        options: [
          { id: 'eher-trocken', label: 'Eher trocken' },
          { id: 'eher-fettig', label: 'Eher fettig oder glänzend' },
          { id: 'mischhaut', label: 'Mischhaut — je nach Zone' },
          { id: 'empfindlich', label: 'Schnell gereizt und empfindlich' },
          { id: 'unsicher', label: 'Das weiß ich nicht genau' }
        ]
      }
    },
    {
      id: 'augen', label: 'Augen & Brauen',
      concerns: [
        { id: 'kurz', label: 'Meine Wimpern wirken kurz und gerade', treatment: 'wimpern' },
        { id: 'mascara', label: 'Ich möchte ohne Mascara auskommen', treatment: 'wimpern' },
        { id: 'brauen', label: 'Meine Brauen sollen in Form gebracht werden', treatment: 'wimpern' },
        { id: 'haerchen', label: 'Störende Härchen an Oberlippe oder Kinn', treatment: 'diolaze' }
      ],
      detail: {
        question: 'Worauf legen Sie dabei den Schwerpunkt?',
        options: [
          { id: 'wimpern-only', label: 'Vor allem die Wimpern' },
          { id: 'brauen-only', label: 'Vor allem die Brauen' },
          { id: 'beides', label: 'Beides zusammen' }
        ]
      }
    },
    {
      id: 'haende', label: 'Hände & Nägel',
      concerns: [
        { id: 'brueckig', label: 'Brüchige oder unregelmäßige Nägel', treatment: 'haende' },
        { id: 'rau', label: 'Trockene, raue Hände', treatment: 'haende' },
        { id: 'anlass-naegel', label: 'Schöne Nägel für einen besonderen Anlass', treatment: 'haende' }
      ],
      detail: {
        question: 'Was schwebt Ihnen vor?',
        options: [
          { id: 'natur', label: 'Gepflegter Naturnagel' },
          { id: 'gel', label: 'Gel-Modellage, auch mit Verlängerung' },
          { id: 'pflege', label: 'Nur Pflege, ohne Lack' },
          { id: 'beraten', label: 'Beraten Sie mich gern' }
        ]
      }
    },
    {
      id: 'fuesse', label: 'Füße',
      concerns: [
        { id: 'hornhaut', label: 'Hornhaut und raue Stellen', treatment: 'fuesse' },
        { id: 'muede-fuesse', label: 'Müde, schwere Füße', treatment: 'fuesse' },
        { id: 'sandale', label: 'Ich möchte sandalenbereit sein', treatment: 'fuesse' },
        { id: 'beine-glatt', label: 'Dauerhaft glatte Beine ohne Rasur', treatment: 'diolaze' }
      ],
      detail: {
        question: 'Was ist Ihnen dabei am wichtigsten?',
        options: [
          { id: 'pflege-fuss', label: 'Gründliche Pflege' },
          { id: 'entspannung-fuss', label: 'Entspannung und Wohlgefühl' },
          { id: 'optik-fuss', label: 'Gepflegte Optik inkl. Lack' }
        ]
      }
    },
    {
      id: 'haarentfernung', label: 'Dauerhafte Haarentfernung',
      concerns: [
        { id: 'rasur-leid', label: 'Ich bin das ständige Rasieren leid', treatment: 'diolaze' },
        { id: 'reizung', label: 'Rasur reizt meine Haut oder verursacht Pickelchen', treatment: 'diolaze' },
        { id: 'zeit', label: 'Ich möchte langfristig Zeit sparen', treatment: 'diolaze' }
      ],
      detail: {
        question: 'Welche Zone möchten Sie behandeln lassen?',
        options: [
          { id: 'gesicht-zone', label: 'Gesicht (Oberlippe, Kinn)' },
          { id: 'achseln', label: 'Achseln' },
          { id: 'beine', label: 'Beine' },
          { id: 'bikini', label: 'Bikinizone' },
          { id: 'mehrere', label: 'Mehrere Zonen' }
        ]
      }
    },
    {
      id: 'entspannen', label: 'Einfach mal Zeit für mich',
      concerns: [
        { id: 'auszeit', label: 'Ich hatte lange keine richtige Auszeit', treatment: 'gesicht' },
        { id: 'verwoehnen', label: 'Ich möchte mich rundum verwöhnen lassen', treatment: 'gesicht' },
        { id: 'geschenk', label: 'Als Geschenk für mich selbst', treatment: 'gesicht' }
      ],
      detail: {
        question: 'Wobei entspannen Sie am besten?',
        options: [
          { id: 'gesicht-relax', label: 'Bei einer Gesichtsbehandlung' },
          { id: 'fuss-relax', label: 'Bei einer Fußpflege' },
          { id: 'kombi-relax', label: 'Am liebsten beides kombiniert' }
        ]
      }
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

  const STEP_ORDER = ['area', 'concern', 'detail', 'occasion', 'result'];
  const TOTAL_STEPS = 4;
  let stepIdx = 0;
  let selection = { area: null, concern: null, detail: null, occasion: null };
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
    finderBody.appendChild(buildOptions(FINDER_DATA, selection.area && selection.area.id, (area) => {
      selection.area = area;
      selection.concern = null;
      selection.detail = null;
      stepIdx = 1;
      renderCurrentStep();
    }));
  }

  function renderConcernStep() {
    finderBody.innerHTML = stepLabel(2) + '<h3>Was beschreibt Ihr Anliegen am besten?</h3>';
    finderBody.appendChild(buildOptions(selection.area.concerns, selection.concern && selection.concern.id, (concern) => {
      selection.concern = concern;
      selection.detail = null;
      stepIdx = 2;
      renderCurrentStep();
    }));
  }

  function renderDetailStep() {
    const detail = selection.area.detail;
    finderBody.innerHTML = stepLabel(3) + '<h3>' + detail.question + '</h3>';
    finderBody.appendChild(buildOptions(detail.options, selection.detail && selection.detail.id, (opt) => {
      selection.detail = opt;
      stepIdx = 3;
      renderCurrentStep();
    }));
  }

  function renderOccasionStep() {
    finderBody.innerHTML = stepLabel(4) + '<h3>Wann möchten Sie starten?</h3>';
    finderBody.appendChild(buildOptions(OCCASIONS, selection.occasion && selection.occasion.id, (occasion) => {
      selection.occasion = occasion;
      stepIdx = 4;
      renderCurrentStep();
    }));
  }

  function occasionSentence(id) {
    if (id === 'zeitnah') return 'Wir schauen nach einem Termin, der zeitnah passt.';
    if (id === 'anlass') return 'Wir planen so, dass Sie rechtzeitig vor Ihrem Anlass fertig sind.';
    if (id === 'info') return 'Sie können sich in Ruhe informieren — ganz unverbindlich.';
    return 'Wir finden gemeinsam einen Termin in den nächsten Wochen.';
  }

  // Die Detailantwort (Frage 3) schärft die Empfehlung, statt nur abgefragt zu werden:
  // je nach Auswahl ergänzen wir einen konkreten Hinweis für das Beratungsgespräch.
  function detailNote(areaId, detailId) {
    const notes = {
      'eher-trocken': 'Wir setzen den Schwerpunkt auf Feuchtigkeit und eine reichhaltige Pflege.',
      'eher-fettig': 'Wir arbeiten klärend und porenverfeinernd, ohne die Haut auszutrocknen.',
      'mischhaut': 'Wir behandeln die Zonen unterschiedlich — klärend in der T-Zone, pflegend an den Wangen.',
      'empfindlich': 'Wir wählen besonders milde Wirkstoffe und arbeiten behutsam.',
      'unsicher': 'Kein Problem — wir starten mit einer kurzen Hautanalyse vor Ort.',
      'wimpern-only': 'Wir konzentrieren uns auf das Wimpernlifting.',
      'brauen-only': 'Für Sie kommt vor allem der Browlift in Frage.',
      'beides': 'Wimpernlifting und Browlift lassen sich gut in einem Termin kombinieren.',
      'natur': 'Wir pflegen Ihren Naturnagel und bringen ihn in Form.',
      'gel': 'Eine Gel-Modellage gibt Halt und lässt sich auch mit Verlängerung umsetzen.',
      'pflege': 'Eine reine Pflegebehandlung ohne Lack ist gut möglich.',
      'beraten': 'Wir schauen vor Ort gemeinsam, was zu Ihren Nägeln passt.',
      'pflege-fuss': 'Der Schwerpunkt liegt auf Hornhaut und gründlicher Pflege.',
      'entspannung-fuss': 'Eine SPA-Fußpflege mit Massage passt hier besonders gut.',
      'optik-fuss': 'Wir runden die Behandlung mit Lack oder UV-Lack ab.',
      'gesicht-zone': 'Kleine Zonen wie Oberlippe oder Kinn sind schnell behandelt.',
      'achseln': 'Die Achseln gehören zu den beliebtesten und schnellsten Zonen.',
      'beine': 'Für die Beine planen wir etwas mehr Zeit pro Sitzung ein.',
      'bikini': 'Wir besprechen den gewünschten Umfang diskret und in Ruhe.',
      'mehrere': 'Für mehrere Zonen lohnt sich ein gemeinsamer Behandlungsplan.',
      'gesicht-relax': 'Eine Gesichtsbehandlung bietet die längste Entspannungszeit.',
      'fuss-relax': 'Eine SPA-Fußpflege ist dafür ideal.',
      'kombi-relax': 'Gesichtsbehandlung und Fußpflege lassen sich gut kombinieren.'
    };
    return notes[detailId] || null;
  }

  // Manche Detailantworten verschieben die Empfehlung sinnvoll (z. B. "Entspannen" +
  // "am liebsten bei einer Fußpflege" -> Fußpflege statt Gesichtsbehandlung).
  function resolveTreatment() {
    const base = selection.concern.treatment;
    const d = selection.detail && selection.detail.id;
    if (d === 'fuss-relax') return 'fuesse';
    if (d === 'kombi-relax') return 'gesicht';
    return base;
  }

  function resolveSecondary(primaryKey) {
    const d = selection.detail && selection.detail.id;
    if (d === 'kombi-relax') return 'fuesse';
    if (d === 'beides') return null;
    const t = TREATMENTS[primaryKey];
    return t && t.secondary ? t.secondary : null;
  }

  function buildBookingMailto(treatmentName, goalLabel) {
    const subject = 'Terminanfrage: ' + treatmentName;
    const body =
      'Hallo liebes Beauty-Lounge-Team,\n\n' +
      'über den Behandlungsfinder auf eurer Webseite interessiere ich mich für folgende Behandlung:\n' +
      treatmentName + ' (Ziel: ' + goalLabel + ').\n\n' +
      'Bitte um einen Terminvorschlag.\n\n' +
      'Vielen Dank!';
    return 'mailto:info@beautylounge-neuss.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function renderResult() {
    const concern = selection.concern;
    const detail = selection.detail;
    const occasion = selection.occasion;
    const primaryKey = resolveTreatment();
    const treatment = TREATMENTS[primaryKey];
    const secondaryKey = resolveSecondary(primaryKey);
    const secondary = secondaryKey ? TREATMENTS[secondaryKey] : null;
    const note = detailNote(selection.area.id, detail && detail.id);
    const mailtoHref = buildBookingMailto(treatment.name, concern.label);

    finderBody.innerHTML =
      '<div class="finder-result">' +
      '<svg class="finder-result-mark" viewBox="0 0 40 100"><use href="#leaf"></use></svg>' +
      '<p class="finder-eyebrow">Ihre Empfehlung</p>' +
      '<h3>Das passt zu Ihnen</h3>' +
      '<p class="finder-result-sub">Basierend auf Ihren vier Antworten empfehlen wir Ihnen diese Behandlung.</p>' +
      '<dl class="finder-strategy">' +
      '<dt>Ihr Anliegen</dt><dd>' + concern.label + '</dd>' +
      (detail ? '<dt>Ihr Schwerpunkt</dt><dd>' + detail.label + '</dd>' : '') +
      (note ? '<dt>Was das für Sie bedeutet</dt><dd>' + note + '</dd>' : '') +
      '<dt>Zeitrahmen</dt><dd>' + occasionSentence(occasion.id) + '</dd>' +
      '</dl>' +
      '<div class="finder-treatment-card">' +
      '<p class="finder-treatment-label">Hauptempfehlung</p>' +
      '<h4>' + treatment.name + '</h4>' +
      '<p>' + treatment.desc + '</p>' +
      '</div>' +
      (secondary ? '<div class="finder-treatment-card"><p class="finder-treatment-label">Sinnvolle Ergänzung</p><h4>' + secondary.name + '</h4><p>' + secondary.desc + '</p></div>' : '') +
      '<p class="finder-booking-label">So können Sie diese Behandlung buchen</p>' +
      '<div class="finder-result-actions">' +
      '<a href="https://www.studiobookr.com/beauty-lounge-66137" target="_blank" rel="noopener" class="btn btn-primary">Jetzt online buchen</a>' +
      '<a href="tel:+4921314506806" class="btn btn-ghost">Jetzt anrufen</a>' +
      '<a href="' + mailtoHref + '" class="btn btn-ghost">Per E-Mail anfragen</a>' +
      '</div>' +
      '<button type="button" class="finder-secondary-link" id="finderGoToTreatment">Mehr über diese Behandlung erfahren</button>' +
      '<button type="button" class="finder-restart" id="finderRestart">Nochmal von vorn</button>' +
      '</div>';

    document.getElementById('finderGoToTreatment').addEventListener('click', () => {
      window.location.href = ROOT_PREFIX + treatment.page;
    });
    document.getElementById('finderRestart').addEventListener('click', () => {
      selection = { area: null, concern: null, detail: null, occasion: null };
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
    else if (name === 'detail') renderDetailStep();
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
    selection = { area: null, concern: null, detail: null, occasion: null };
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
