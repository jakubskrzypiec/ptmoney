(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatInt = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });

  /* ---------- Scroll-scrub intro ---------- */
  const html = document.documentElement;
  const intro = $('#siteIntro');
  const introSpacer = $('#introSpacer');
  const introMonogram = $('#introMonogram');
  const introCopy = $('#introCopy');
  const introScrollHint = $('#introScrollHint');
  const headerLogo = $('#headerLogo');
  const heroGrid = $('.hero-grid');
  const header = $('.site-header');
  const forceIntro = new URLSearchParams(window.location.search).get('intro') === '1';
  const focusRoots = [$('.skip-link'), header, $('#main'), $('.site-footer'), $('.mobile-bottom-bar')].filter(Boolean);
  let introActive = false;
  let ticking = false;
  let dock = { x: 0, y: 0, scale: 1 };

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const phase = (p, from, to) => clamp01((p - from) / (to - from));
  // Exact cubic-bezier(.22,.7,.2,1) evaluator for scrubbed phase progress.
  function ease(t) {
    const x1 = .22, y1 = .7, x2 = .2, y2 = 1;
    const sample = (u, a1, a2) => 3 * (1 - u) * (1 - u) * u * a1 + 3 * (1 - u) * u * u * a2 + u * u * u;
    const derivative = (u, a1, a2) => 3 * (1 - u) * (1 - u) * a1 + 6 * (1 - u) * u * (a2 - a1) + 3 * u * u * (1 - a2);
    let u = clamp01(t);
    for (let i = 0; i < 5; i += 1) {
      const dx = sample(u, x1, x2) - t;
      const d = derivative(u, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      u = clamp01(u - dx / d);
    }
    return sample(u, y1, y2);
  }

  function setPageInert(inert) {
    focusRoots.forEach(root => {
      if ('inert' in root) root.inert = inert;
      else if (inert) root.setAttribute('aria-hidden', 'true');
      else root.removeAttribute('aria-hidden');
    });
  }

  function measureDock() {
    if (!introMonogram || !headerLogo || !introSpacer) return;

    // Read the REAL header logo rect. The spacer sits before the header in flow,
    // so subtract only the still-visible part of the spacer to get the logo's
    // true dock position after the intro zone has been consumed.
    const target = headerLogo.getBoundingClientRect();
    const spacerRect = introSpacer.getBoundingClientRect();
    const remainingSpacer = Math.max(0, spacerRect.bottom - Math.max(0, spacerRect.top));

    const previousTransform = introMonogram.style.transform;
    introMonogram.style.transform = 'none';
    const source = introMonogram.getBoundingClientRect();
    introMonogram.style.transform = previousTransform;

    const sourceCx = source.left + source.width / 2;
    const sourceCy = source.top + source.height / 2;
    const targetCx = target.left + target.width / 2;
    const targetCy = target.top + target.height / 2 - remainingSpacer;

    dock.x = targetCx - sourceCx;
    dock.y = targetCy - sourceCy;
    dock.scale = Math.max(.1, target.height / Math.max(1, source.height));
  }

  function hideIntro({ remember = false, preserveViewport = false } = {}) {
    const zone = introSpacer?.offsetHeight || 0;
    const before = window.scrollY;
    introActive = false;
    setPageInert(false);
    html.classList.remove('js-intro', 'intro-docked');
    if (intro) {
      intro.style.pointerEvents = 'none';
      intro.style.display = 'none';
    }
    if (heroGrid) {
      heroGrid.style.opacity = '1';
      heroGrid.style.transform = 'none';
    }
    // Collapsing the spacer at p=1 would otherwise move the document up by 100vh/60vh.
    // Counter-scroll by exactly that measured height, so the visible content does not jump.
    if (preserveViewport && zone > 0) {
      window.scrollTo(0, Math.max(0, before - zone));
    }
    if (remember) {
      try { sessionStorage.setItem('ptm-intro-seen', '1'); } catch (e) {}
    }
  }

  function renderIntro() {
    ticking = false;
    if (!introActive || !intro || !introSpacer || !introMonogram) return;

    const zone = Math.max(1, introSpacer.offsetHeight);
    const p = clamp01(window.scrollY / zone);
    const textP = ease(phase(p, 0, .30));
    const moveP = ease(phase(p, .25, .85));
    const growP = ease(phase(p, .25, .75));
    const settleP = ease(phase(p, .75, .85));
    const coverP = ease(phase(p, .55, 1));
    const heroP = ease(phase(p, .55, 1));
    const maxScale = window.innerWidth < 900 ? 1.2 : 1.35;
    const grownScale = 1 + (maxScale - 1) * growP;
    const scale = grownScale + (dock.scale - grownScale) * settleP;

    if (introCopy) {
      introCopy.style.opacity = String(1 - textP);
      introCopy.style.transform = `translate3d(0, ${24 * textP}px, 0)`;
      introCopy.style.filter = `blur(${4 * textP}px)`;
    }
    if (introScrollHint) {
      introScrollHint.style.opacity = String(1 - textP);
      introScrollHint.style.transform = `translate3d(-50%, ${24 * textP}px, 0)`;
      introScrollHint.style.filter = `blur(${4 * textP}px)`;
    }

    introMonogram.style.transform = `translate3d(${dock.x * moveP}px, ${dock.y * moveP}px, 0) scale(${scale})`;
    intro.style.opacity = String(1 - coverP);
    intro.style.clipPath = `inset(0 0 ${100 * coverP}% 0)`;

    if (heroGrid) {
      heroGrid.style.opacity = String(heroP);
      heroGrid.style.transform = `translate3d(0, ${28 * (1 - heroP)}px, 0) scale(${1 + .02 * (1 - heroP)})`;
    }

    const docked = p >= .85;
    intro.style.pointerEvents = docked ? 'none' : 'auto';
    setPageInert(!docked);
    html.classList.toggle('intro-docked', docked);

    if (p >= 1) hideIntro({ remember: true, preserveViewport: true });
  }

  function requestIntroFrame() {
    if (!introActive || ticking) return;
    ticking = true;
    requestAnimationFrame(renderIntro);
  }

  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem('ptm-intro-seen') === '1'; } catch (e) {}
  const shouldSkipIntro = reduceMotion || (!forceIntro && (seenIntro || Boolean(location.hash) || window.scrollY > 0));

  if (shouldSkipIntro || !html.classList.contains('js-intro')) {
    hideIntro({ remember: false });
  } else if (intro && introSpacer && introMonogram && headerLogo) {
    introActive = true;
    setPageInert(true);
    requestAnimationFrame(() => {
      measureDock();
      renderIntro();
    });
    window.addEventListener('scroll', requestIntroFrame, { passive: true });
    window.addEventListener('resize', () => {
      if (!introActive) return;
      requestAnimationFrame(() => {
        measureDock();
        renderIntro();
      });
    }, { passive: true });
  } else {
    hideIntro({ remember: false });
  }

  /* ---------- Compact sticky header ---------- */
  const updateHeader = () => header?.classList.toggle('is-compact', window.scrollY > 40);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ---------- Mobile nav ---------- */
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

  /* ---------- Reveal + stagger ---------- */
  $$('.reveal-grid').forEach(grid => {
    $$('.reveal', grid).forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index, 6) * 60}ms`;
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
    }, { threshold: 0.13, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
    // Ukrywamy elementy dopiero po poprawnym uruchomieniu obserwatora.
    // Gdy JS nie załaduje się lub wcześniej zgłosi błąd, treść pozostaje widoczna.
    html.classList.add('reveal-ready');

    // Bezpieczny fallback dla agresywnego przewijania / nietypowych WebView:
    // IntersectionObserver pozostaje mechanizmem głównym, a scroll tylko dopina elementy,
    // które znalazły się już w oknie, ale obserwator nie zdążył ich zgłosić.
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

  /* ---------- Helpers ---------- */
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

  /* ---------- Hero quick calculator ---------- */
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

  /* ---------- Full loan calculator ---------- */
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

  /* ---------- Product -> form ---------- */
  const contactSection = $('#kontakt');
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

  const requestedProduct = new URLSearchParams(window.location.search).get('produkt');
  selectProduct(requestedProduct);

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

  /* ---------- Count-up ---------- */
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
        const value = Math.round(target * eased);
        el.textContent = `${formatInt.format(value)}${el.dataset.suffix || ''}`;
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
        if (entries.some(entry => entry.isIntersecting)) {
          animateStats();
          statsObserver.disconnect();
        }
      }, { threshold: 0.35 });
      statsObserver.observe(statsGrid);
      const statsFallback = () => {
        if (statsAnimated) return;
        const rect = statsGrid.getBoundingClientRect();
        if (rect.top < window.innerHeight * .9 && rect.bottom > 0) {
          animateStats();
          statsObserver.disconnect();
        }
      };
      window.addEventListener('scroll', statsFallback, { passive: true });
      requestAnimationFrame(statsFallback);
    }
  }

  /* ---------- FAQ accordion ---------- */
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

  /* ---------- Form ---------- */
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
    const field = input.closest('.field');
    field?.classList.toggle('is-invalid', !valid);
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
        const invalid = $('[aria-invalid="true"]', form);
        invalid?.focus();
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
