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

Kadr jest **zastawiony na całej szerokości** — nie ma na nim pustego pola — więc
typografia jest **biała**, a `.hero-shade` kładzie pod nią **elipsę zakotwiczoną
w lewym dolnym rogu**. Elipsa, a nie pas: gaśnie promieniście, więc prawa strona kadru
(laptop ze znakiem, widok z okna) zostaje w pełnej jasności.

Zmierzone na realnych prostokątach tekstu przy 1440×900: eyebrow 12,5:1, nagłówek 5,2:1,
lead 16,2:1 — wszystko powyżej progu WCAG AA. **Po każdej podmianie zdjęcia trzeba to
przeliczyć od nowa**, bo kontrast zależy od tego, co wypadnie pod napisami przy danym
kadrowaniu. Sposób pomiaru: narysować zdjęcie na `<canvas>` z tym samym `object-fit: cover`
i `object-position`, nałożyć te same gradienty, a potem próbkować prostokąty
z `Range.getClientRects()` dla `.eyebrow`, `#hero-title` i `.hero-lead`.

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

## Skala i rytm — trzy pokrętła

Gęstość całej strony ustawia się z trzech miejsc w `:root`. Nie rozsiewaj
odstępów po sekcjach; jeśli coś ma być luźniejsze albo ciaśniejsze, ruszaj tutaj.

| Zmienna | Co robi |
|---|---|
| `font-size` na `body` | bazowa skala typografii — wszystkie `rem`-y jadą za nią |
| `--rytm` | odstęp nad i pod każdą sekcją |
| `--rytm-glowy` | odstęp między nagłówkiem sekcji a jej treścią (i nad `.section-cta`) |

Jedyne celowe odstępstwo: **podgląd raty** (`.rate-section`) ma od góry 0,6 rytmu,
żeby trzymał się hero. Reszta sekcji jest symetryczna.

Do tego `--gutter` (margines boczny) i `--max` (szerokość kontenera). Hero
świadomie wychodzi poza `--max` — napisy mają siedzieć w rogu ekranu, nie
w rogu siatki.

## Ścieżka sprzedażowa

Kolejność sekcji jest ścieżką klienta — od najmniejszego zobowiązania do największego:

| # | Sekcja | Po co tu jest |
|---|---|---|
| 1 | **Hero** (`#hero`) | jedna obietnica, jedno główne działanie |
| 2 | **Podgląd raty** (`#start`) | suwak: coś do ruszenia, zanim padnie prośba o numer |
| 3 | **Produkty** (`#produkty`) | klient sam wskazuje, po co przyszedł |
| 4 | **Jak to działa** (`#jak-to-dziala`) | trzy kafle: co robi klient, co robimy my, ile to trwa |
| 5 | **Kalkulator** (`#kalkulator`) | dokładniejsze liczby dla już zainteresowanych |
| 6 | **Doradca** (`#zespol`) | twarz i ton — zaufanie do człowieka |
| 7 | **Liczby** | zaufanie do firmy |
| 8 | **Opinie** (`#opinie`) | dowód od osób z zewnątrz |
| 9 | **Formularz** (`#kontakt`) | konwersja |
| 10 | **FAQ** (`#faq`) | domknięcie dla tych, którzy jeszcze nie wypełnili |

Suwak w sekcji 2 i kalkulator w sekcji 5 to **dwa różne narzędzia**: pierwszy ma dwa
suwaki i daje rząd wielkości, drugi dokłada oprocentowanie, sumę odsetek i koszt całkowity.

Dwie sekcje zostały usunięte i nie warto ich wracać bez powodu:
**Hipoteka** (nie było wiadomo, czym różni się od pozycji „kredyt hipoteczny” w produktach)
oraz **pasek liczb pod podglądem raty** (te same cztery liczby stoją w sekcji „Liczby”).

Postęp czytania pokazuje 2-pikselowy pasek na dolnej krawędzi nagłówka
(`#scrollProgress`, liczony w `updateHeader()` w `main.js`).

Każda sekcja kończy się przejściem do formularza `#kontakt`. Odnośniki przy produktach
(`.product-select`) dodatkowo ustawiają wybrany produkt w formularzu i ustawiają kursor w polu
„Imię”, a adres dostaje `?produkt=…`, więc link można wysłać klientowi bezpośrednio.
Na desktopie po opuszczeniu hero pojawia się pływający przycisk, na mobile — pasek na dole ekranu;
oba znikają, gdy formularz jest już na ekranie.
