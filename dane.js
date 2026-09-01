/* =============================================================================
   P&T Money — dane klienta

   TO JEST JEDYNY PLIK, KTÓRY TRZEBA WYPEŁNIĆ PRZED PUBLIKACJĄ.
   Wpisz wartości poniżej — rozejdą się same po wszystkich podstronach:
   nagłówek, stopka, formularz, polityka prywatności, regulamin, dane dla Google.

   Pole zostawione puste zostaje na stronie jako widoczny znacznik w rodzaju
   [NIP] — dzięki temu nic nie umknie po cichu.
   ============================================================================= */

window.PTM_DANE = {

  /* --- Kontakt -------------------------------------------------------------
     Telefon wpisz w formacie międzynarodowym, ze spacjami — tak jak ma się
     wyświetlić. Link „zadzwoń" powstanie z niego automatycznie.              */
  telefon: '',                    // np. '+48 512 345 678'
  email: '',                      // np. 'kontakt@ptmoney.pl'

  /* --- Dane rejestrowe (stopka + dokumenty prawne) ----------------------- */
  pelnaNazwa: '',                 // np. 'P&T Money Sp. z o.o.'
  adres: '',                      // np. 'ul. Przykładowa 1, 00-001 Warszawa'
  nip: '',                        // np. '1234567890'
  krs: '',                        // KRS albo numer wpisu CEIDG
  knf: '',                        // numer wpisu do rejestru KNF

  /* --- Doradca (sekcja „Doradca" na stronie głównej) --------------------- */
  doradca: '',                    // np. 'Anna Kowalska'
  doradcaRola: 'Doradca finansowy · P&T Money',   // dopasuj do osoby, np. 'Doradczyni finansowa · P&T Money'

  /* --- Adres strony ---------------------------------------------------------
     Pełny adres z ukośnikiem na końcu. Trafia do canonical, Open Graph
     i danych dla Google. Po podpięciu własnej domeny podmień tutaj
     ORAZ w sitemap.xml i robots.txt (oba to zwykłe pliki tekstowe).         */
  adresStrony: 'https://jakubskrzypiec.github.io/ptmoney/',

  /* --- Odbiór formularza ----------------------------------------------------
     Dokąd mają trafiać zgłoszenia. Puste = formularz tylko pokazuje
     potwierdzenie, nic nie wysyła (tryb demonstracyjny).
     Instrukcja z gotowymi wariantami: PRZEKAZANIE.md                        */
  formularzEndpoint: '',

  /* --- Liczby w sekcji „Liczby, nie obietnice" ---------------------------
     Podawaj prawdziwe. Data mówi, na kiedy są aktualne.                     */
  liczby: {
    klienci: 12000,
    banki: 30,
    godziny: 48,
    aktualneNa: ''                // np. '09.2026'
  }
};

/* =============================================================================
   Poniżej nic nie trzeba zmieniać — to rozdzielenie danych po stronie.
   ============================================================================= */
(() => {
  'use strict';
  const D = window.PTM_DANE || {};
  const set = value => (typeof value === 'string' ? value.trim() : value) || '';

  const telefon = set(D.telefon);
  const email = set(D.email);
  const telHref = telefon ? `tel:${telefon.replace(/[^\d+]/g, '')}` : '';

  /* 1. Znaczniki [Klucz] w treści — także w dokumentach prawnych. */
  const tokens = {
    '[Pełna nazwa firmy]': set(D.pelnaNazwa),
    '[Adres]': set(D.adres),
    '[NIP]': set(D.nip),
    '[KRS/CEIDG]': set(D.krs),
    '[Nr wpisu KNF]': set(D.knf),
    '[Imię i nazwisko]': set(D.doradca),
    '[Telefon]': telefon,
    '[E-mail]': email,
    '[MM.RRRR]': set(D.liczby?.aktualneNa)
  };
  const filled = Object.entries(tokens).filter(([, value]) => value);

  if (filled.length) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeValue.includes('[')) hits.push(node);
    }
    hits.forEach(node => {
      let text = node.nodeValue;
      filled.forEach(([token, value]) => { text = text.split(token).join(value); });
      if (text !== node.nodeValue) node.nodeValue = text;
    });
  }

  /* 2. Odnośniki kontaktowe. Bez danych zostaje numer zastępczy — widać, że do uzupełnienia. */
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    if (!telHref) return;
    link.href = telHref;
    link.setAttribute('aria-label', `Zadzwoń: ${telefon}`);
    if (/[\d\s+]{9,}/.test(link.textContent)) link.textContent = telefon;
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    if (!email) return;
    link.href = `mailto:${email}`;
    if (link.textContent.includes('@')) link.textContent = email;
  });

  /* 3. Adres strony: canonical, Open Graph, obrazek podglądu. */
  const base = set(D.adresStrony);
  if (base) {
    const root = base.endsWith('/') ? base : `${base}/`;
    const page = window.location.pathname.split('/').pop() || '';
    const here = page && page !== 'index.html' ? root + page : root;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = here;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = here;
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(tag => {
      tag.content = `${root}logo-horizontal.png`;
    });
    const www = document.getElementById('stronaWww');
    if (www) {
      www.href = root;
      www.textContent = root.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  /* 4. Liczby w sekcji „Liczby, nie obietnice" — main.js animuje je z data-count. */
  const stats = { statKlienci: D.liczby?.klienci, statBanki: D.liczby?.banki, statGodziny: D.liczby?.godziny };
  Object.entries(stats).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (!el || value == null || value === '') return;
    el.dataset.count = String(value);
    el.textContent = new Intl.NumberFormat('pl-PL').format(value) + (el.dataset.suffix || '');
  });

  const rola = document.getElementById('doradcaRola');
  if (rola && set(D.doradcaRola)) rola.textContent = set(D.doradcaRola);

  /* 5. Dane dla Google (JSON-LD) uzupełniane tym samym kompletem. */
  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent);
      if (base) data.url = base;
      if (set(D.pelnaNazwa)) data.legalName = set(D.pelnaNazwa);
      if (telefon) data.telephone = telefon;
      if (email) data.email = email;
      if (set(D.nip)) data.taxID = set(D.nip); else delete data.taxID;
      if (data.address) {
        if (set(D.adres)) data.address.streetAddress = set(D.adres);
        else delete data.address.streetAddress;
      }
      ld.textContent = JSON.stringify(data, null, 2);
    } catch (e) { /* uszkodzony JSON-LD nie może wywrócić strony */ }
  }

  /* 6. Odbiór formularza. */
  const form = document.getElementById('leadForm');
  if (form && set(D.formularzEndpoint)) form.dataset.endpoint = set(D.formularzEndpoint);
})();
