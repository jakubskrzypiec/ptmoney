/* =============================================================================
   P&T Money — skrypt strony głównej
   ============================================================================= */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatInt = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });

  const clamp01 = value => Math.min(1, Math.max(0, value));
  /* Postęp fazy: 0 przed „from”, 1 po „to”, wygładzony pomiędzy. */
  const phase = (p, from, to) => {
    const t = clamp01((p - from) / Math.max(1e-6, to - from));
    return t * t * (3 - 2 * t);
  };

  /* ==========================================================================
     Intro — logo otwiera stronę wraz z przewijaniem
     ========================================================================== */

  const intro = $('#siteIntro');
  const introSpacer = $('#introSpacer');
  const introVeil = $('#introVeil');
  const introPlate = $('#introPlate');
  const introCopy = $('#introCopy');
  const introHint = $('#introHint');
  const introFallback = $('#introMarkFallback');
  const pageWrap = $('#pageWrap');

  const MARK_START = 148;              // px — startowa szerokość znaku
  const MARK_GROWTH = 1.5;             // krotność największego boku okna na końcu wzrostu
  let introActive = false;
  let introTicking = false;

  const supportsMaskComposite =
    typeof CSS !== 'undefined' && typeof CSS.supports === 'function' &&
    (CSS.supports('mask-composite', 'exclude') || CSS.supports('-webkit-mask-composite', 'xor'));

  function hideIntro({ remember = false, keepViewport = false } = {}) {
    if (!intro) return;
    const zone = introSpacer?.offsetHeight || 0;
    const y = window.scrollY;
    introActive = false;
    html.classList.remove('js-intro');
    html.classList.add('intro-open');
    intro.style.display = 'none';
    if (introSpacer) introSpacer.style.display = 'none';
    if (pageWrap) pageWrap.style.transform = '';
    if (keepViewport && zone) {
      // Skok musi być natychmiastowy — globalne scroll-behavior: smooth animowałoby powrót.
      const top = Math.max(0, y - zone);
      try { window.scrollTo({ top, left: 0, behavior: 'instant' }); }
      catch (e) { window.scrollTo(0, top); }
    }
    if (remember) { try { sessionStorage.setItem('ptm-intro-seen', '1'); } catch (e) {} }
  }

  function renderIntro() {
    introTicking = false;
    if (!introActive || !intro || !introSpacer) return;

    const zone = introSpacer.offsetHeight;
    const travel = Math.max(1, zone - window.innerHeight);
    const p = clamp01(window.scrollY / travel);

    // Treść strony stoi nieruchomo pod warstwą intro — przewijamy wyłącznie animację.
    if (pageWrap) pageWrap.style.transform = `translate3d(0, ${window.scrollY - zone}px, 0)`;

    // 1. Napisy i podpowiedź znikają jako pierwsze.
    const textOut = phase(p, 0.04, 0.28);
    if (introCopy) {
      introCopy.style.opacity = String(1 - textOut);
      introCopy.style.transform = `translate(-50%, ${18 * textOut}px)`;
    }
    if (introHint) {
      introHint.style.opacity = String(1 - phase(p, 0.02, 0.18));
      introHint.style.transform = `translateX(-50%) translateY(${16 * textOut}px)`;
    }

    // 2. Znak rośnie i staje się oknem na stronę.
    const grow = phase(p, 0.10, 0.74);
    const maxSide = Math.max(window.innerWidth, window.innerHeight);
    const size = MARK_START + (maxSide * MARK_GROWTH - MARK_START) * Math.pow(grow, 1.6);

    if (supportsMaskComposite && introVeil) {
      introVeil.style.webkitMaskSize = `${size}px auto, cover`;
      introVeil.style.maskSize = `${size}px auto, cover`;
    } else if (introFallback) {
      introFallback.style.transform = `translate(-50%, -50%) scale(${size / MARK_START})`;
    }

    // 3. Kurtyna jedzie w górę i odsłania stronę — bez mglistego zanikania.
    const exit = phase(p, 0.74, 1);
    intro.style.clipPath = `inset(0 0 ${100 * exit}% 0)`;
    intro.style.transform = `translate3d(0, ${-6 * exit}vh, 0)`;
    intro.style.opacity = String(1 - phase(p, 0.96, 1));
    html.classList.toggle('intro-open', p > 0.70);

    if (p >= 1) hideIntro({ remember: true, keepViewport: true });
  }

  function requestIntroFrame() {
    if (!introActive || introTicking) return;
    introTicking = true;
    requestAnimationFrame(renderIntro);
  }

  let introSeen = false;
  try { introSeen = sessionStorage.getItem('ptm-intro-seen') === '1'; } catch (e) {}
  const forceIntro = new URLSearchParams(window.location.search).get('intro') === '1';
  const skipIntro = reduceMotion || (!forceIntro && (introSeen || Boolean(location.hash) || window.scrollY > 0));

  if (!intro || !introSpacer || skipIntro || !html.classList.contains('js-intro')) {
    hideIntro({ remember: false });
  } else {
    if (!supportsMaskComposite) intro.classList.add('no-mask');
    introActive = true;
    renderIntro();
    window.addEventListener('scroll', requestIntroFrame, { passive: true });
    window.addEventListener('resize', requestIntroFrame, { passive: true });
    // Bezpiecznik: gdyby coś zablokowało przewijanie, intro nie zostaje na zawsze.
    window.setTimeout(() => { if (introActive && window.scrollY === 0) introHint?.classList.add('is-nudged'); }, 6000);
  }

  /* ==========================================================================
     Nagłówek
     ========================================================================== */

  const header = $('.site-header');
  const updateHeader = () => header?.classList.toggle('is-compact', window.scrollY > 40);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');

  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Otwórz menu');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-open');
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Otwórz menu' : 'Zamknij menu');
      mobileNav.hidden = open;
      document.body.classList.toggle('menu-open', !open);
    });
    $$('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth >= 900) closeMenu(); }, { passive: true });
  }

  /* ==========================================================================
     Pływające CTA (desktop) — pojawia się po opuszczeniu hero,
     znika, gdy formularz jest już na ekranie.
     ========================================================================== */

  const ctaDock = $('#ctaDock');
  const contactSection = $('#kontakt');

  if (ctaDock && contactSection) {
    ctaDock.hidden = false;
    const updateDock = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.9;
      const rect = contactSection.getBoundingClientRect();
      const formVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
      ctaDock.classList.toggle('is-shown', pastHero && !formVisible);
    };
    window.addEventListener('scroll', updateDock, { passive: true });
    window.addEventListener('resize', updateDock, { passive: true });
    updateDock();
  }

  /* ==========================================================================
     Zdjęcia — łagodny zapas, gdy pliku jeszcze nie ma w repozytorium
     ========================================================================== */

  $$('img[data-portrait]').forEach(img => {
    const markMissing = () => img.closest('.portrait')?.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });

  /* ==========================================================================
     Reveal
     ========================================================================== */

  $$('.reveal-grid').forEach(grid => {
    $$('.reveal', grid).forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index, 6) * 55}ms`;
    });
  });

  const revealEls = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
    // Elementy chowamy dopiero po uruchomieniu obserwatora — bez JS treść zostaje widoczna.
    html.classList.add('reveal-ready');

    const revealInViewport = () => {
      revealEls.forEach(el => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * .96 && rect.bottom > 0) {
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    };
    window.addEventListener('scroll', revealInViewport, { passive: true });
    window.addEventListener('resize', revealInViewport, { passive: true });
    requestAnimationFrame(revealInViewport);
  }

  /* ==========================================================================
     Liczby i kalkulatory
     ========================================================================== */

  const fmtPLN = n => `${formatInt.format(Math.round(Number(n) || 0))} zł`;
  const fmtNumber = n => formatInt.format(Math.round(Number(n) || 0));

  const numberTweens = new WeakMap();
  function animateNumber(el, target, render, duration = 250) {
    if (!el) return;
    const previous = numberTweens.get(el);
    if (previous?.raf) cancelAnimationFrame(previous.raf);
    const from = Number(previous?.value ?? target);
    const state = { value: from, raf: 0 };
    numberTweens.set(el, state);
    if (reduceMotion || Math.abs(target - from) < .01) {
      state.value = target;
      render(target);
      return;
    }
    const started = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      state.value = from + (target - from) * eased;
      render(state.value);
      if (t < 1) state.raf = requestAnimationFrame(frame);
    };
    state.raf = requestAnimationFrame(frame);
  }

  function annuityPayment(principal, annualRatePct, months) {
    const p = Number(principal) || 0;
    const n = Math.max(1, Number(months) || 1);
    const r = (Number(annualRatePct) / 100) / 12;
    if (r === 0) return p / n;
    return p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }

  function setRangeProgress(input) {
    if (!input) return;
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const value = Number(input.value) || 0;
    const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
    input.style.setProperty('--range-progress', `${Math.max(0, Math.min(100, pct))}%`);
  }

  $$('input[type="range"]').forEach(input => {
    setRangeProgress(input);
    input.addEventListener('input', () => setRangeProgress(input));
  });

  /* Szybki podgląd raty w hero */
  const heroAmount = $('#heroAmount');
  const heroPeriod = $('#heroPeriod');
  const heroAmountVal = $('#heroAmountVal');
  const heroPeriodVal = $('#heroPeriodVal');
  const heroResult = $('#heroResult');
  const HERO_RATE = 9.9;

  function updateHeroCalculator() {
    if (!heroAmount || !heroPeriod) return;
    const amount = Number(heroAmount.value);
    const months = Number(heroPeriod.value);
    const payment = annuityPayment(amount, HERO_RATE, months);
    heroAmountVal.textContent = fmtPLN(amount);
    heroPeriodVal.textContent = `${months} mies.`;
    animateNumber(heroResult, payment, value => { heroResult.innerHTML = `${fmtNumber(value)} <small>zł / mies.</small>`; });
  }

  [heroAmount, heroPeriod].forEach(el => el && el.addEventListener('input', updateHeroCalculator));
  updateHeroCalculator();

  /* Pełny kalkulator */
  const calcAmount = $('#calcAmount');
  const calcPeriod = $('#calcPeriod');
  const calcRate = $('#calcRate');
  const calcAmountVal = $('#calcAmountVal');
  const calcPeriodVal = $('#calcPeriodVal');
  const calcRateVal = $('#calcRateVal');
  const calcResult = $('#calcResult');
  const calcInterest = $('#calcInterest');
  const calcTotal = $('#calcTotal');

  function updateMainCalculator() {
    if (!calcAmount || !calcPeriod || !calcRate) return;
    const amount = Number(calcAmount.value);
    const months = Number(calcPeriod.value);
    const rate = Number(calcRate.value);
    const payment = annuityPayment(amount, rate, months);
    const total = payment * months;
    const interest = total - amount;

    calcAmountVal.textContent = fmtPLN(amount);
    calcPeriodVal.textContent = `${months} mies.`;
    calcRateVal.textContent = `${rate.toFixed(1).replace('.', ',')}%`;
    animateNumber(calcResult, payment, value => { calcResult.innerHTML = `${fmtNumber(value)} <small>zł / mies.</small>`; });
    animateNumber(calcInterest, interest, value => { calcInterest.textContent = fmtPLN(value); });
    animateNumber(calcTotal, total, value => { calcTotal.textContent = fmtPLN(value); });
  }

  [calcAmount, calcPeriod, calcRate].forEach(el => el && el.addEventListener('input', updateMainCalculator));
  updateMainCalculator();

  /* ==========================================================================
     Ścieżka: produkt → formularz
     ========================================================================== */

  const productSelect = $('#fProduct');
  const amountField = $('#fAmount');
  const nameField = $('#fName');
  const productMap = {
    'kredyt-gotowkowy': 'Kredyt gotówkowy',
    'kredyt-konsolidacyjny': 'Kredyt konsolidacyjny',
    'kredyt-hipoteczny': 'Kredyt hipoteczny',
    'kredyt-firmowy': 'Kredyt firmowy',
    'leasing': 'Leasing',
    'faktoring': 'Faktoring',
    'ubezpieczenia': 'Ubezpieczenia'
  };

  function selectProduct(product) {
    if (!productSelect || !product) return;
    const value = productMap[product] || product;
    const option = [...productSelect.options].find(item => item.value === value || item.textContent.trim() === value);
    if (option) productSelect.value = option.value;
  }

  selectProduct(new URLSearchParams(window.location.search).get('produkt'));

  $$('.product-select').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const product = link.dataset.product;
      selectProduct(product);
      const slug = Object.entries(productMap).find(([, value]) => value === product)?.[0] || '';
      const nextUrl = `${window.location.pathname}${slug ? `?produkt=${encodeURIComponent(slug)}` : ''}#kontakt`;
      history.replaceState(null, '', nextUrl);
      contactSection?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => nameField?.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
    });
  });

  const calcCta = $('#calcCta');
  if (calcCta) {
    calcCta.addEventListener('click', () => {
      if (productSelect) productSelect.value = 'Kredyt gotówkowy';
      if (amountField && calcAmount) amountField.value = fmtPLN(calcAmount.value);
    });
  }

  /* ==========================================================================
     Liczniki
     ========================================================================== */

  const statsGrid = $('#statsGrid');
  let statsAnimated = false;

  function showFinalStats() {
    $$('[data-count]', statsGrid || document).forEach(el => {
      const value = Number(el.dataset.count) || 0;
      el.textContent = `${formatInt.format(value)}${el.dataset.suffix || ''}`;
    });
  }

  function animateStats() {
    if (statsAnimated || !statsGrid) return;
    statsAnimated = true;
    const duration = 900;
    const start = performance.now();
    const els = $$('[data-count]', statsGrid);
    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      els.forEach(el => {
        const target = Number(el.dataset.count) || 0;
        el.textContent = `${formatInt.format(Math.round(target * eased))}${el.dataset.suffix || ''}`;
      });
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  if (statsGrid) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      showFinalStats();
    } else {
      const statsObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { animateStats(); statsObserver.disconnect(); }
      }, { threshold: 0.35 });
      statsObserver.observe(statsGrid);
      const statsFallback = () => {
        if (statsAnimated) return;
        const rect = statsGrid.getBoundingClientRect();
        if (rect.top < window.innerHeight * .9 && rect.bottom > 0) { animateStats(); statsObserver.disconnect(); }
      };
      window.addEventListener('scroll', statsFallback, { passive: true });
      requestAnimationFrame(statsFallback);
    }
  }

  /* ==========================================================================
     FAQ
     ========================================================================== */

  $$('.faq-button').forEach(button => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      $$('.faq-button[aria-expanded="true"]').forEach(openButton => {
        if (openButton === button) return;
        openButton.setAttribute('aria-expanded', 'false');
        const openPanel = document.getElementById(openButton.getAttribute('aria-controls'));
        if (openPanel) openPanel.hidden = true;
      });

      button.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });

  /* ==========================================================================
     Formularz
     ========================================================================== */

  const form = $('#leadForm');
  const success = $('#formSuccess');
  const successText = $('#formSuccessText');
  const phoneField = $('#fPhone');
  const emailField = $('#fEmail');
  const consentField = $('#fConsent');
  const optionalDetails = $('#optionalDetails');

  function phoneDigits(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('48') && digits.length > 9) digits = digits.slice(2);
    return digits.slice(0, 9);
  }

  function formatPhone(value) {
    const digits = phoneDigits(value);
    if (!digits) return '';
    const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean);
    return `+48 ${groups.join(' ')}`;
  }

  if (phoneField) phoneField.addEventListener('input', () => { phoneField.value = formatPhone(phoneField.value); });

  function setFieldValidity(input, valid) {
    if (!input) return valid;
    input.closest('.field')?.classList.toggle('is-invalid', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  function validateForm() {
    const nameOk = (nameField?.value.trim().length || 0) >= 2;
    const phoneOk = phoneDigits(phoneField?.value).length === 9;
    const productOk = Boolean(productSelect?.value);
    const email = emailField?.value.trim() || '';
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const consentOk = Boolean(consentField?.checked);

    setFieldValidity(nameField, nameOk);
    setFieldValidity(phoneField, phoneOk);
    setFieldValidity(productSelect, productOk);
    setFieldValidity(emailField, emailOk);
    const consentWrap = consentField?.closest('.consent-wrap');
    consentWrap?.classList.toggle('is-invalid', !consentOk);
    consentField?.setAttribute('aria-invalid', String(!consentOk));

    if (!emailOk && optionalDetails) optionalDetails.open = true;
    return nameOk && phoneOk && productOk && emailOk && consentOk;
  }

  [nameField, phoneField, productSelect, emailField].forEach(input => {
    input?.addEventListener(input?.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateForm();
    });
  });
  consentField?.addEventListener('change', () => {
    consentField.closest('.consent-wrap')?.classList.remove('is-invalid');
    consentField.setAttribute('aria-invalid', 'false');
  });

  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!validateForm()) {
        $('[aria-invalid="true"]', form)?.focus();
        return;
      }

      const submittedPhone = phoneField?.value || '';
      const submit = $('button[type="submit"]', form);
      const originalText = submit?.textContent;
      if (submit) { submit.disabled = true; submit.textContent = 'Wysyłanie…'; }

      const endpoint = (form.dataset.endpoint || form.getAttribute('action') || '').trim();
      let sent = true;
      if (endpoint && endpoint !== '#') {
        try {
          const response = await fetch(endpoint, {
            method: form.method || 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          sent = response.ok;
        } catch (e) { sent = false; }
      } else {
        await new Promise(resolve => window.setTimeout(resolve, 280));
      }

      if (submit) { submit.disabled = false; submit.textContent = originalText; }
      if (!sent) {
        window.alert('Nie udało się wysłać zgłoszenia. Spróbuj ponownie.');
        return;
      }

      if (successText) {
        successText.textContent = `Zgłoszenie przyjęte. Doradca oddzwoni w ciągu jednego dnia roboczego na numer ${submittedPhone}.`;
      }
      if (success) success.hidden = false;
      form.reset();
      if (optionalDetails) optionalDetails.open = false;
      $$('.field.is-invalid', form).forEach(field => field.classList.remove('is-invalid'));
      $('.consent-wrap', form)?.classList.remove('is-invalid');
    });
  }
})();
