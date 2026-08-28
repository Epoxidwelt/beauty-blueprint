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

// impressum toggle
const impressumToggle = document.getElementById('impressumToggle');
const impressumPanel = document.getElementById('impressumPanel');
impressumToggle.addEventListener('click', () => {
  const isHidden = impressumPanel.hasAttribute('hidden');
  if (isHidden) {
    impressumPanel.removeAttribute('hidden');
  } else {
    impressumPanel.setAttribute('hidden', '');
  }
  impressumToggle.setAttribute('aria-expanded', String(isHidden));
});

// contact form (static — no backend wired up; only present on the homepage)
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
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

  const FINDER_DATA = [
    {
      id: 'glow', label: 'Mehr Glow & Feuchtigkeit', treatment: 'gesicht',
      painPoints: [
        { id: 'fahl', label: 'Meine Haut wirkt oft fahl und müde' },
        { id: 'spannt', label: 'Meine Haut spannt und fühlt sich trocken an' },
        { id: 'makeup', label: 'Make-up hält bei mir schlecht' }
      ]
    },
    {
      id: 'antiaging', label: 'Anti-Aging & Straffung', treatment: 'forma',
      painPoints: [
        { id: 'linien', label: 'Erste feine Linien und Fältchen' },
        { id: 'spannkraft', label: 'Weniger Spannkraft als früher' },
        { id: 'muede', label: 'Mein Ausdruck wirkt müde' }
      ]
    },
    {
      id: 'rein', label: 'Reine, klare Haut', treatment: 'gesicht',
      painPoints: [
        { id: 'unrein', label: 'Unreinheiten und Mitesser' },
        { id: 'poren', label: 'Sichtbare, große Poren' },
        { id: 'unruhig', label: 'Unruhiges, unregelmäßiges Hautbild' }
      ]
    },
    {
      id: 'wimpern', label: 'Perfekter Augenaufschlag', treatment: 'wimpern',
      painPoints: [
        { id: 'kurz', label: 'Meine Wimpern wirken kurz und gerade' },
        { id: 'mascara', label: 'Ich möchte auf Mascara verzichten können' },
        { id: 'anlass2', label: 'Ein besonderer Anlass steht bevor' }
      ]
    },
    {
      id: 'haende', label: 'Gepflegte Hände & Nägel', treatment: 'haende',
      painPoints: [
        { id: 'rau', label: 'Raue, trockene Hände' },
        { id: 'brueckig', label: 'Brüchige oder unregelmäßige Nägel' },
        { id: 'goennen', label: 'Ich möchte mir einfach etwas gönnen' }
      ]
    },
    {
      id: 'fuesse', label: 'Gepflegte Füße', treatment: 'fuesse',
      painPoints: [
        { id: 'hornhaut', label: 'Hornhaut und raue Stellen' },
        { id: 'muede2', label: 'Müde, schwere Füße und Beine' },
        { id: 'sandale', label: 'Ich möchte sandalenbereit sein' }
      ]
    },
    {
      id: 'glatt', label: 'Dauerhaft glatte Haut', treatment: 'diolaze',
      painPoints: [
        { id: 'rasur', label: 'Ich bin das ständige Rasieren leid' },
        { id: 'reizung', label: 'Rasur reizt meine Haut' },
        { id: 'zeit', label: 'Ich möchte einfach Zeit sparen' }
      ]
    },
    {
      id: 'entspannen', label: 'Einfach entspannen & abschalten', treatment: 'gesicht',
      painPoints: [
        { id: 'stress', label: 'Der Alltag lässt mir kaum Zeit für mich' },
        { id: 'auszeit', label: 'Ich hatte lange keine richtige Auszeit' },
        { id: 'verwoehnen', label: 'Ich möchte mich einfach verwöhnen lassen' }
      ]
    }
  ];

  const OCCASIONS = [
    { id: 'alltag', label: 'Alltag & regelmäßige Pflege' },
    { id: 'anlass', label: 'Besonderer Anlass (Hochzeit, Event, Urlaub)' },
    { id: 'neu', label: 'Ich probiere es einfach mal aus' }
  ];

  const overlay = document.getElementById('finderOverlay');
  if (!overlay) return;
  const modal = overlay.querySelector('.finder-modal');
  const finderBody = document.getElementById('finderBody');
  const progressFill = document.getElementById('finderProgressFill');
  const backBtn = document.getElementById('finderBack');
  const closeBtn = document.getElementById('finderClose');
  const openTriggers = document.querySelectorAll('.js-open-finder');

  const STEP_ORDER = ['goal', 'pain', 'occasion', 'result'];
  let stepIdx = 0;
  let selection = { goal: null, pain: null, occasion: null };
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

  function renderGoalStep() {
    finderBody.innerHTML = '<p class="finder-step-label">' + leafIcon() + 'Schritt 1 von 3</p><h3>Was möchten Sie erreichen?</h3>';
    finderBody.appendChild(buildOptions(FINDER_DATA, selection.goal && selection.goal.id, (goal) => {
      selection.goal = goal;
      selection.pain = null;
      stepIdx = 1;
      renderCurrentStep();
    }));
  }

  function renderPainStep() {
    finderBody.innerHTML = '<p class="finder-step-label">' + leafIcon() + 'Schritt 2 von 3</p><h3>Was stört Sie daran aktuell am meisten?</h3>';
    finderBody.appendChild(buildOptions(selection.goal.painPoints, selection.pain && selection.pain.id, (pain) => {
      selection.pain = pain;
      stepIdx = 2;
      renderCurrentStep();
    }));
  }

  function renderOccasionStep() {
    finderBody.innerHTML = '<p class="finder-step-label">' + leafIcon() + 'Schritt 3 von 3</p><h3>Für welchen Anlass?</h3>';
    finderBody.appendChild(buildOptions(OCCASIONS, selection.occasion && selection.occasion.id, (occasion) => {
      selection.occasion = occasion;
      stepIdx = 3;
      renderCurrentStep();
    }));
  }

  function occasionSentence(id) {
    if (id === 'anlass') return 'rechtzeitig vor Ihrem besonderen Anlass';
    if (id === 'neu') return 'zum unverbindlichen Kennenlernen';
    return 'als fester Bestandteil Ihrer regelmäßigen Pflege';
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
    const goal = selection.goal;
    const pain = selection.pain;
    const occasion = selection.occasion;
    const treatment = TREATMENTS[goal.treatment];
    const secondary = treatment.secondary ? TREATMENTS[treatment.secondary] : null;
    const mailtoHref = buildBookingMailto(treatment.name, goal.label);

    finderBody.innerHTML =
      '<div class="finder-result">' +
      '<svg class="finder-result-mark" viewBox="0 0 40 100"><use href="#leaf"></use></svg>' +
      '<p class="finder-eyebrow">Ihre Empfehlung</p>' +
      '<h3>Das passt zu Ihnen</h3>' +
      '<p class="finder-result-sub">Basierend auf Ihren Antworten empfehlen wir Ihnen diese Behandlung.</p>' +
      '<dl class="finder-strategy">' +
      '<dt>Ihr Ziel</dt><dd>' + goal.label + '</dd>' +
      '<dt>Ihr Hauptanliegen</dt><dd>' + pain.label + '</dd>' +
      '<dt>Strategie</dt><dd>Wir setzen gezielt bei &bdquo;' + goal.label + '&ldquo; an &ndash; ' + occasionSentence(occasion.id) + '.</dd>' +
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
      selection = { goal: null, pain: null, occasion: null };
      stepIdx = 0;
      renderCurrentStep();
    });
  }

  function setProgress() {
    const pct = (Math.min(stepIdx, 3) / 3) * 100;
    progressFill.style.width = pct + '%';
    backBtn.hidden = stepIdx === 0;
  }

  function renderCurrentStep() {
    setProgress();
    const name = STEP_ORDER[stepIdx];
    if (name === 'goal') renderGoalStep();
    else if (name === 'pain') renderPainStep();
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
    selection = { goal: null, pain: null, occasion: null };
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
