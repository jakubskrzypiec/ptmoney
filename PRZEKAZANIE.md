# Przekazanie strony — co zrobić przed publikacją

Strona jest gotowa technicznie. Zostają dane, których nie da się zgadnąć.
Kolejność niżej jest od najważniejszych do kosmetyki.

---

## 1. Wypełnij `dane.js` — to jedyny plik z danymi klienta

Otwórz `dane.js` w dowolnym edytorze tekstu i wpisz wartości między apostrofami.
Rozejdą się same po całej stronie: nagłówek, stopka, formularz, polityka
prywatności, regulamin i dane dla Google.

| Pole | Gdzie się pokaże |
|---|---|
| `telefon` | nagłówek, przyciski „Zadzwoń", stopka, pasek na mobile, regulamin |
| `email` | stopka, polityka prywatności, regulamin |
| `pelnaNazwa`, `adres`, `nip`, `krs`, `knf` | dane rejestrowe w stopce, oba dokumenty prawne |
| `doradca` | podpis pod cytatem w sekcji „Doradca" |
| `adresStrony` | canonical, Open Graph, dane dla Google |
| `formularzEndpoint` | dokąd lecą zgłoszenia (punkt 3) |
| `liczby` | sekcja „Liczby, nie obietnice" + data pod nimi |

**Pole zostawione puste zostaje na stronie jako widoczny znacznik**, np. `[NIP]`
albo numer `+48 000 000 000`. To celowe — łatwiej wyłapać, czego brakuje.
Po wypełnieniu przejdź stronę wzrokiem i sprawdź, czy nigdzie nie został
tekst w nawiasach kwadratowych.

---

## 2. Zdjęcia — są na miejscu

`img/hero.jpg` (tło hero na cały ekran) oraz `img/doradca-2.jpg` (sekcja
„Doradca", popiersie).

Zdjęcie hero ma **ciemną lewą połowę** — tam leży cały tekst. Przy podmianie
trzymaj ten sam układ, inaczej biała typografia przestanie się czytać.
Przy każdej podmianie: **zapisuj w JPEG, nie w PNG** i popraw `width` oraz
`height` przy `<img>` w `index.html`. Szczegóły w `img/README.md`.

Podpis pod cytatem bierze się z pól `doradca` i `doradcaRola` w `dane.js` —
rolę dopasuj do osoby na zdjęciu.

---

## 2a. Opinie klientów — treść zastępcza

Sekcja „Opinie" (`#opinie` w `index.html`) zawiera **trzy przykładowe wypowiedzi**
z wymyślonymi imionami. To materiał poglądowy, nie prawdziwe referencje.

Przed publikacją albo wstaw prawdziwe opinie (za pisemną zgodą klientów,
z imieniem i pierwszą literą nazwiska), albo usuń całą sekcję.
**Nie publikuj tych przykładowych — to wprowadzanie w błąd.**

## 3. Podłącz formularz

Dziś formularz **waliduje dane i pokazuje potwierdzenie, ale nic nie wysyła**.
Tak zostanie, dopóki nie wpiszesz adresu w `formularzEndpoint` w `dane.js`.

Skrypt wysyła `FormData` metodą POST i uznaje zgłoszenie za przyjęte przy
odpowiedzi 2xx. Pasuje do większości usług. Trzy typowe drogi:

- **Formspree / FormSubmit** — zakładasz konto, dostajesz adres w rodzaju
  `https://formspree.io/f/xxxxxxx`, wklejasz. Zero kodu po stronie serwera.
- **Netlify Forms** — jeśli strona pójdzie na Netlify; wtedy adres to `/`
  plus atrybut `netlify` na `<form>`.
- **Własny skrypt** (PHP na hostingu klienta) — endpoint ma odebrać POST
  z polami `name`, `phone`, `product`, `email`, `amount`, `message`, `consent`
  i odpowiedzieć kodem 200.

W formularzu jest ukryte pole-pułapka `company`. Wypełniają je tylko boty —
takie zgłoszenie jest po cichu odrzucane. **Jeśli własny skrypt odrzuca
zgłoszenia z nieznanymi polami, dopuść `company` albo je zignoruj.**

Zanim oddasz stronę, wyślij jedno zgłoszenie testowe i sprawdź, czy doszło.

---

## 4. Domena

Dziś strona stoi pod `https://jakubskrzypiec.github.io/ptmoney/`.

Po podpięciu własnej domeny (np. `ptmoney.pl`) podmień adres w **trzech miejscach**:

1. `dane.js` → `adresStrony`
2. `sitemap.xml` → wszystkie cztery adresy
3. `robots.txt` → wiersz `Sitemap:`

Dodatkowo w `404.html` ścieżki zaczynają się od `/ptmoney/` — przy własnej
domenie zamień je na `/`.

Na GitHub Pages domenę ustawia się w **Settings → Pages → Custom domain**.

---

## 5. Dokumenty prawne — do weryfikacji prawnej

`polityka-prywatnosci.html` i `regulamin.html` to **szkice, nie gotowe
dokumenty**. Mają poprawną strukturę i uzupełnią się danymi z `dane.js`,
ale treść musi przejrzeć osoba odpowiedzialna za RODO po stronie klienta —
zwłaszcza podstawa i okres przetwarzania, odbiorcy danych oraz cookies.
W polityce jest o tym widoczna notka; **usuń ją po weryfikacji**
(`<p class="legal-note">` w `polityka-prywatnosci.html`).

---

## 6. Liczby i obietnice

Sekcja „Liczby, nie obietnice" oraz teksty w rodzaju „ponad 30 banków"
i „oddzwonimy w 24 h" to deklaracje wobec klienta końcowego. Potwierdź je
z klientem — albo popraw. Data pod liczbami (`liczby.aktualneNa`) mówi,
na kiedy są aktualne.

---

## Sprawdzenie przed oddaniem

- [ ] `dane.js` wypełniony, na stronie nie ma tekstu w `[nawiasach]`
- [ ] numer `+48 000 000 000` nigdzie się nie pokazuje
- [ ] sekcja „Opinie" ma prawdziwe wypowiedzi albo została usunięta (punkt 2a)
- [ ] zdjęcia sprawdzone na komórce i na desktopie, podpis pod cytatem zgodny z osobą
- [ ] formularz wysłany testowo i zgłoszenie doszło
- [ ] adresy w `sitemap.xml` i `robots.txt` zgodne z docelową domeną
- [ ] dokumenty prawne przejrzane, notka robocza usunięta
- [ ] intro sprawdzone na świeżej karcie (pokazuje się raz na sesję;
      `?intro=1` wymusza pokaz)
- [ ] strona otwarta na telefonie — nie tylko w zwężonym oknie przeglądarki

---

## Co warto wiedzieć przy dalszej pracy

- Strona jest statyczna: bez frameworków, bez kroku budowania. Wrzucasz pliki
  na dowolny hosting i działa. Otwiera się też z dysku, dwuklikiem w `index.html`.
- Kolejność wczytywania ma znaczenie: `dane.js` musi być **przed** `main.js`.
- Intro i wejście hero opisane są w `README.md` — łącznie z tym, gdzie
  stroić progi animacji.
- Podstrona `kalkulator.html` to osobne narzędzie z własnym CSS i JS
  (`kalkulator.css`, `kalkulator.js`) i własnym trybem ciemnym oraz wydrukiem.
  Zmiany na stronie głównej jej nie dotyczą.
