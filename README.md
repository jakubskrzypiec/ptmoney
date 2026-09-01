# P&T Money — strona

Statyczna strona pośrednictwa finansowego. Bez frameworków i bez kroku budowania:
otwierasz `index.html` albo wrzucasz cały katalog na hosting.

## Struktura

| Plik | Rola |
|---|---|
| `dane.js` | **dane klienta — jedyny plik do wypełnienia przed publikacją** |
| `index.html` | strona główna |
| `styles.css` | style strony głównej i podstron dokumentowych |
| `main.js` | intro, wejście hero, pasek postępu, kalkulatory, formularz, FAQ |
| `kalkulator.html` / `kalkulator.css` / `kalkulator.js` | kalkulator refinansowania hipoteki (osobne narzędzie) |
| `polityka-prywatnosci.html`, `regulamin.html` | dokumenty |
| `404.html` | strona błędu — samowystarczalna, nie wciąga plików z zewnątrz |
| `PRZEKAZANIE.md` | lista kontrolna przed oddaniem strony klientowi |
| `img/` | zdjęcie hero i zdjęcia doradcy — patrz `img/README.md` |
| `robots.txt`, `sitemap.xml` | SEO |

### Logo

| Plik | Kiedy |
|---|---|
| `logo-horizontal.png` | nagłówek po przewinięciu (ciemny tekst), Open Graph |
| `logo-horizontal-light.png` | nagłówek na hero (biały tekst, jaśniejszy błękit znaku) |
| `logo-mark.png` | favicon, sam znak na jasnym tle, maska w intro |
| `logo-mark-light.png` | znak na ciemnym tle (stopka) — niebieskie „P”, białe „T” |
| `logo-mark-blue.png`, `logo-mark-black.png` | rozdzielone warstwy znaku (materiał źródłowy) |

## Hero

Hero zajmuje **cały ekran** (`min-height: 100svh`). Zdjęcie `img/hero.jpg` jest tłem
całej sekcji, tekst siedzi w lewej kolumnie — tam, gdzie kadr jest najciemniejszy
i najmniej się dzieje. Gradient `.hero-shade` dokłada przyciemnienie od lewej,
żeby biała typografia trzymała kontrast niezależnie od zdjęcia.

Nagłówek strony **leży na hero przezroczysty** (`.site-header--overlay`) i zestala się
w biały pasek dopiero po przewinięciu o 40 px — wtedy `main.js` dokłada `.is-compact`.
Ten sam przełącznik zamienia jasny znak na ciemny i pokazuje pasek postępu czytania.
Wariant przezroczysty dotyczy **tylko strony głównej**; podstrony mają zwykły biały nagłówek.

Rozmiar `h1` jest związany z `max-width` kolumny: „Finansowanie” to najdłuższe słowo
nagłówka i to ono wyznacza górną granicę — powyżej niej `.hero-line` (`overflow: hidden`,
potrzebne do animacji wjazdu wierszy) zaczyna je przycinać.

### Podmiana zdjęcia hero

Kadr musi mieć **ciemną, spokojną lewą połowę** — tam ląduje cała typografia.
Zapisuj w JPEG (nie PNG: to samo zdjęcie w PNG waży ponad dziesięć razy więcej,
a hero ładuje się od razu), minimum 1600 px szerokości, i popraw `width`/`height`
przy `<img>` w `index.html`. Ścieżka jest w dwóch miejscach: `<link rel="preload">`
w `<head>` i sam `<img>`.

## Intro marki

Przy pierwszym wejściu w sesji strona wita ciemną planszą ze znakiem P&T. Intro jest
**automatyczne i krótkie** — nie zależy od przewijania: po chwili panel odjeżdża w górę
i odsłania hero, a kliknięcie lub dowolny klawisz kończy je natychmiast.

Zaraz po kurtynie hero **składa się z kawałków**: wiersze nagłówka wjeżdżają zza masek
jeden po drugim, zdjęcie odsłania się od góry, na końcu wchodzą przyciski i punkty pod nimi.
Kolejność bierze się z `data-delay` w `index.html` (0–1 na osi wejścia), a CSS przelicza
to na `--d` — opóźnienie przejścia. Po zakończeniu wejścia zdjęcie dostaje delikatną
parallaksę: dryfuje wolniej niż reszta strony.

Intro **nie uruchamia się**, gdy: system prosi o ograniczenie animacji
(`prefers-reduced-motion`) albo adres ma kotwicę (np. `#kontakt`).
`?intro=0` wyłącza je na stałe w danym wejściu.

## Do uzupełnienia przed publikacją

Wszystkie dane klienta siedzą w jednym pliku: **`dane.js`**. Wpisujesz je raz,
rozchodzą się po nagłówku, stopce, formularzu, obu dokumentach prawnych
i danych dla Google. Pole zostawione puste zostaje na stronie jako widoczny
znacznik (`[NIP]`, numer `+48 000 000 000`) — łatwiej wyłapać braki.

Osobno zostają **zdjęcia doradcy** (`img/`) i **weryfikacja prawna dokumentów**.

Pełna lista kontrolna z instrukcją podłączenia formularza i zmiany domeny:
**`PRZEKAZANIE.md`**.

## Ścieżka sprzedażowa

Kolejność sekcji jest ścieżką klienta — od najmniejszego zobowiązania do największego:

| # | Sekcja | Po co tu jest |
|---|---|---|
| 1 | **Hero** (`#hero`) | jedna obietnica, jedno główne działanie |
| 2 | **Zacznij tutaj** (`#start`) | suwak raty: coś do ruszenia, zanim padnie prośba o numer |
| 3 | **Produkty** (`#produkty`) | klient sam wskazuje, po co przyszedł |
| 4 | **Jak to działa** (`#jak-to-dziala`) | zdejmuje niepewność „co się stanie po wysłaniu” |
| 5 | **Kalkulator** (`#kalkulator`) | dokładniejsze liczby dla już zainteresowanych |
| 6 | **Hipoteka** | pogłębienie najcięższego produktu |
| 7 | **Doradca** (`#zespol`) | twarz i ton — zaufanie do człowieka |
| 8 | **Liczby** | zaufanie do firmy |
| 9 | **Opinie** (`#opinie`) | dowód od osób z zewnątrz |
| 10 | **FAQ** (`#faq`) | ostatnie obiekcje przed decyzją |
| 11 | **Formularz** (`#kontakt`) | konwersja — na końcu, po zbiciu wątpliwości |

Suwak w sekcji 2 i kalkulator w sekcji 5 to **dwa różne narzędzia**: pierwszy ma dwa
suwaki i daje rząd wielkości, drugi dokłada oprocentowanie, sumę odsetek i koszt całkowity.

Postęp czytania pokazuje 2-pikselowy pasek na dolnej krawędzi nagłówka
(`#scrollProgress`, liczony w `updateHeader()` w `main.js`).

Każda sekcja kończy się przejściem do formularza `#kontakt`. Odnośniki przy produktach
(`.product-select`) dodatkowo ustawiają wybrany produkt w formularzu i ustawiają kursor w polu
„Imię”, a adres dostaje `?produkt=…`, więc link można wysłać klientowi bezpośrednio.
Na desktopie po opuszczeniu hero pojawia się pływający przycisk, na mobile — pasek na dole ekranu;
oba znikają, gdy formularz jest już na ekranie.
