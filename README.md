# P&T Money — strona

Statyczna strona pośrednictwa finansowego. Bez frameworków i bez kroku budowania:
otwierasz `index.html` albo wrzucasz cały katalog na hosting.

## Struktura

| Plik | Rola |
|---|---|
| `index.html` | strona główna |
| `styles.css` | style strony głównej i podstron dokumentowych |
| `main.js` | intro sterowane przewijaniem, kalkulatory, formularz, FAQ |
| `kalkulator.html` / `kalkulator.css` / `kalkulator.js` | kalkulator refinansowania hipoteki (osobne narzędzie) |
| `polityka-prywatnosci.html`, `regulamin.html` | dokumenty |
| `img/` | zdjęcia doradcy — patrz `img/README.md` |
| `robots.txt`, `sitemap.xml` | SEO |

### Logo

| Plik | Kiedy |
|---|---|
| `logo-horizontal.png` | nagłówek, Open Graph |
| `logo-mark.png` | favicon, sam znak na jasnym tle, maska w intro |
| `logo-mark-light.png` | znak na ciemnym tle (stopka) — niebieskie „P”, białe „T” |
| `logo-mark-blue.png`, `logo-mark-black.png` | rozdzielone warstwy znaku (materiał źródłowy) |

## Intro sterowane przewijaniem

Przy pierwszym wejściu w sesji strona wita czarnym ekranem ze znakiem P&T.
Przewijanie nie przesuwa treści — napędza animację:

1. znika nazwa i podpowiedź „Przewiń”,
2. znak rośnie; jest wycięty w czarnej zasłonie, więc świeci przez niego marka,
3. zasłona jedzie w górę jak kurtyna i odsłania hero.

Sterowanie: `#introSpacer` (220 vh) daje dystans przewijania, `renderIntro()` w `main.js`
przelicza go na postęp `p` od 0 do 1. Progi faz są w tej funkcji — to jedyne miejsce do strojenia.

Intro **nie uruchamia się**, gdy: system prosi o ograniczenie animacji
(`prefers-reduced-motion`), użytkownik widział je już w tej sesji, adres ma kotwicę
(np. `#kontakt`) albo strona otwiera się w przewiniętym stanie.
`?intro=1` wymusza pokaz (poza trybem ograniczonych animacji) — przydatne przy prezentacji klientowi.

Przeglądarki bez `mask-composite` dostają wariant zapasowy: zwykły znak skalowany na czerni.

## Do uzupełnienia przed publikacją

- **Zdjęcia doradcy** — `img/doradca.jpg` i `img/doradca-2.jpg` (szczegóły w `img/README.md`).
- **Telefon i e-mail** — wszystkie miejsca są oznaczone `data-contact-placeholder="true"`,
  numer zastępczy to `+48 000 000 000`, adres `kontakt@ptmoney.pl`.
- **Imię i nazwisko doradcy** — `[Imię i nazwisko]` w sekcji „Doradca”.
- **Dane rejestrowe** — pola `[…]` w stopce oraz w JSON-LD w `<head>`.
- **Liczby w sekcji „Liczby, nie obietnice”** i data `[MM.RRRR]` pod nimi.
- **Odbiór formularza** — formularz obecnie tylko pokazuje potwierdzenie.
  Podaj adres endpointu w `data-endpoint` na `<form id="leadForm">`; skrypt wyśle tam `FormData`
  metodą POST i uzna zgłoszenie za przyjęte przy odpowiedzi 2xx.
- **Adresy w `sitemap.xml`, `robots.txt` i `<link rel="canonical">`** — jeśli domena inna niż
  `jakubskrzypiec.github.io/finanse/`.
- **Dokumenty prawne** — `polityka-prywatnosci.html` i `regulamin.html` to szkice do weryfikacji.

## Ścieżka sprzedażowa

Każda sekcja kończy się przejściem do formularza `#kontakt`. Odnośniki przy produktach
(`.product-select`) dodatkowo ustawiają wybrany produkt w formularzu i ustawiają kursor w polu
„Imię”, a adres dostaje `?produkt=…`, więc link można wysłać klientowi bezpośrednio.
Na desktopie po opuszczeniu hero pojawia się pływający przycisk, na mobile — pasek na dole ekranu;
oba znikają, gdy formularz jest już na ekranie.
