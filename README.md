# P&T Money — strona

Statyczna strona pośrednictwa finansowego. Bez frameworków i bez kroku budowania:
otwierasz `index.html` albo wrzucasz cały katalog na hosting.

## Struktura

| Plik | Rola |
|---|---|
| `dane.js` | **dane klienta — jedyny plik do wypełnienia przed publikacją** |
| `index.html` | strona główna |
| `styles.css` | style strony głównej i podstron dokumentowych |
| `main.js` | intro sterowane przewijaniem, kalkulatory, formularz, FAQ |
| `kalkulator.html` / `kalkulator.css` / `kalkulator.js` | kalkulator refinansowania hipoteki (osobne narzędzie) |
| `polityka-prywatnosci.html`, `regulamin.html` | dokumenty |
| `404.html` | strona błędu — samowystarczalna, nie wciąga plików z zewnątrz |
| `PRZEKAZANIE.md` | lista kontrolna przed oddaniem strony klientowi |
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

4. na tej samej osi hero **składa się z kawałków**: wiersze nagłówka wjeżdżają zza masek
   jeden po drugim, portret odsłania się od góry, na końcu wchodzą przyciski i pasek raty.

Przez cały czas treść stoi nieruchomo — przewijanie przewija animację, nie stronę.

Sterowanie: `#introSpacer` (300 vh) daje dystans przewijania, `renderIntro()` w `main.js`
przelicza go na postęp `p` od 0 do 1. Progi faz są w tej funkcji — to jedyne miejsce do strojenia.
Kolejność elementów hero bierze się z `data-delay` w `index.html` (0–1 na osi wejścia),
a `renderHero()` przelicza to na przezroczystość, przesunięcie i maski.

Gdy intro jest pominięte, hero i tak wchodzi — te same ruchy odgrywa raz klasa `.is-in`
na przejściach CSS, bez udziału przewijania. Po zakończeniu wejścia portret dostaje
delikatną parallaksę: dryfuje wolniej niż reszta strony.

Intro **nie uruchamia się**, gdy: system prosi o ograniczenie animacji
(`prefers-reduced-motion`), użytkownik widział je już w tej sesji, adres ma kotwicę
(np. `#kontakt`) albo strona otwiera się w przewiniętym stanie.
`?intro=1` wymusza pokaz (poza trybem ograniczonych animacji) — przydatne przy prezentacji klientowi.

Przeglądarki bez `mask-composite` dostają wariant zapasowy: zwykły znak skalowany na czerni.

## Do uzupełnienia przed publikacją

Wszystkie dane klienta siedzą w jednym pliku: **`dane.js`**. Wpisujesz je raz,
rozchodzą się po nagłówku, stopce, formularzu, obu dokumentach prawnych
i danych dla Google. Pole zostawione puste zostaje na stronie jako widoczny
znacznik (`[NIP]`, numer `+48 000 000 000`) — łatwiej wyłapać braki.

Osobno zostają **zdjęcia doradcy** (`img/`) i **weryfikacja prawna dokumentów**.

Pełna lista kontrolna z instrukcją podłączenia formularza i zmiany domeny:
**`PRZEKAZANIE.md`**.

## Ścieżka sprzedażowa

Każda sekcja kończy się przejściem do formularza `#kontakt`. Odnośniki przy produktach
(`.product-select`) dodatkowo ustawiają wybrany produkt w formularzu i ustawiają kursor w polu
„Imię”, a adres dostaje `?produkt=…`, więc link można wysłać klientowi bezpośrednio.
Na desktopie po opuszczeniu hero pojawia się pływający przycisk, na mobile — pasek na dole ekranu;
oba znikają, gdy formularz jest już na ekranie.
