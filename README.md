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
| `logo-horizontal.png` | nagłówek, Open Graph |
| `logo-mark.png` | favicon, sam znak na jasnym tle, maska w intro |
| `logo-mark-light.png` | znak na ciemnym tle (stopka) — niebieskie „P”, białe „T” |
| `logo-mark-blue.png`, `logo-mark-black.png` | rozdzielone warstwy znaku (materiał źródłowy) |

## Hero

Hero zajmuje **cały ekran** (`min-height: 100svh`). Zdjęcie `img/hero.jpg` jest tłem
całej sekcji, a napisy siedzą w **lewym dolnym rogu** (`align-items: flex-end`) — tam,
gdzie kadr jest pusty: po lewej ściana, na dole blat.

Kadr jest **jasny**, więc cała typografia hero jest **ciemna**, a `.hero-shade` dokłada
mleczną warstwę od lewej i od dołu, żeby tekst trzymał kontrast niezależnie od tego,
jak zdjęcie przytnie się na danym ekranie. Gdyby wróciło ciemne zdjęcie, trzeba odwrócić
komplet: `.hero-shade`, kolory w `.hero-copy`, `.hero-proof` i nagłówek.

Nagłówek strony **leży na hero przezroczysty** (`.site-header--overlay`) i zestala się
w biały pasek dopiero po przewinięciu o 40 px — wtedy `main.js` dokłada `.is-compact`
i pokazuje pasek postępu czytania. Na jasnym zdjęciu treść nagłówka jest ciemna
w obu stanach, więc zmienia się tylko tło. Wariant przezroczysty dotyczy **tylko strony
głównej**; podstrony mają zwykły biały nagłówek.

### Dlaczego `h1` ma taki, a nie inny rozmiar

Wiersze nagłówka wjeżdżają zza masek, więc `.hero-line` ma `overflow: hidden` — **nie
zawija, tylko tnie**. „Finansowanie” to najdłuższe słowo i zajmuje ok. **5,9 × font-size**.
Rozmiar musi więc zejść razem z szerokością okna, a `max-width` na wąskich ekranach jest
wyłączony (`none`), żeby granicą był kontener, a nie liczba znaków. Przy `max-width: 9ch`
zapas wynosił 7 px przy 320 px szerokości — zjadłby go pierwszy font zastępczy, gdyby
Google Fonts nie doszło.

Po zmianie treści nagłówka **sprawdź najdłuższe słowo przy 320 px szerokości okna.**

### Podmiana zdjęcia hero

Kadr musi mieć **jasną, spokojną lewą połowę i jasny dół** — tam ląduje cała typografia.
Zapisuj w JPEG (nie PNG: 4K PNG waży ponad 4 MB, ten sam kadr w JPEG 2560 px — 230 kB,
a hero ładuje się od razu), 2560 px szerokości w zupełności wystarczy.

Po podmianie popraw `width` i `height` przy `<img>` w `index.html` **oraz** ścieżkę
w `<link rel="preload">` w `<head>` — to dwa osobne miejsca.

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
