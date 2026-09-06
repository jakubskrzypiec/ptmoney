# Przekazanie strony — co zrobić przed publikacją

Stan na 6 września 2026 r., po wgraniu paczki dokumentów prawnych od klienta.

## ⛔ Trzy rzeczy blokujące — przeczytaj najpierw

**1. Kredyt hipoteczny bez wpisu RPH.** Rejestr KNF pokazuje spółkę wyłącznie
jako pośrednika kredytu **konsumenckiego** (RPK027234). Pośrednictwo kredytu
hipotecznego wymaga osobnego wpisu (Dział I) i zezwolenia KNF. W ankiecie
`DO-UZUPELNIENIA` punkt C1 **został bez odpowiedzi**.

Do czasu rozstrzygnięcia strona mówi to, co jest prawdą wg rejestru: hipotekę
przekazujemy partnerowi z uprawnieniami. Zmienione w trzech miejscach — opis
produktu, stopka, `informacja-o-posredniku.html`. **Nadal otwarte:**
`kalkulator.html` to kalkulator refinansowania hipoteki, jest w menu i w `sitemap.xml`.
Opisy produktu w `index.html` i `oferta.html` już poprawione.
Albo spółka uzyskuje wpis RPH, albo kalkulator znika / dostaje wyraźne
oznaczenie partnera.

**2. Opinie są zmyślone.** Sześć wypowiedzi w karuzeli (`data-placeholder="true"`)
to materiał poglądowy. Punkt C8 ankiety mówi wprost: opinie z imieniem i miastem
to dane osobowe wymagające zgody, a nieprawdziwe twierdzenia to sprawa dla UOKiK.
Odpowiedź klienta: „??". **Do podmiany albo usunięcia przed pokazaniem strony
komukolwiek.**

**3. Formularz nadal nigdzie nie wysyła.** `formularzEndpoint` w `dane.js` jest
pusty. Zanim spłynie pierwszy lead, trzeba wskazać odbiorcę po HTTPS **i podpisać
z jego dostawcą umowę powierzenia** (art. 28 RODO).

---

## 1. `dane.js` — uzupełniony

Dane rejestrowe są wpisane i rozchodzą się po całej stronie oraz po dokumentach:

| Pole | Wartość |
|---|---|
| `pelnaNazwa` | MARTOM POLSKA Sp. z o.o. |
| `adres` | ul. Walerego Sławka 5/16, 40-833 Katowice |
| `nip` / `krs` | 6342849173 / 0000584084 (REGON 362876105 w komentarzu) |
| `knf` | RPK027234 |
| `telefon` / `email` | +48 782 972 300 / kontakt@ptmoney.pl |

**Do sprawdzenia:** numery telefonu wziąłem z treści dokumentów prawnych, nie
z ankiety — potwierdź, czy w nagłówku ma być `782 972 300`, czy drugi numer.
Rejestr KNF podaje inny adres siedziby (ul. Jana III Sobieskiego 11/18) niż
ankieta. Jeśli KRS potwierdza Walerego Sławka, **wpis w KNF jest nieaktualny
i trzeba go zaktualizować** — to osobny obowiązek.

Puste zostają jeszcze: `doradca` (imię i nazwisko pod cytatem),
`liczby.aktualneNa` (data pod statystykami) i `formularzEndpoint`.

---

## 2. Zdjęcia — są na miejscu

`img/hero.jpg` (tło hero na cały ekran) oraz `img/doradca-2.jpg` (sekcja
„Doradca", popiersie).

Zdjęcie hero jest zastawione na całej szerokości, więc napisy trzymają kontrast
dzięki elipsie przyciemniającej lewy dolny róg (.hero-shade). Po każdej podmianie
kadru trzeba przeliczyć kontrast — sposób opisany w README.md.
Przy każdej podmianie: **zapisuj w JPEG, nie w PNG** i popraw `width` oraz
`height` przy `<img>` w `index.html`. Szczegóły w `img/README.md`.

Podpis pod cytatem bierze się z pól `doradca` i `doradcaRola` w `dane.js` —
rolę dopasuj do osoby na zdjęciu.

---

## 2a. Opinie klientów

Opisane w bloku „Trzy rzeczy blokujące" na górze tego dokumentu.
Sześć kafli karuzeli ma `data-placeholder="true"` — znajdziesz je jednym
wyszukaniem. Po podmianie usuń też te atrybuty.

---

## 3. Podłącz formularz

Dziś formularz **waliduje dane i pokazuje potwierdzenie, ale nic nie wysyła**.
Tak zostanie, dopóki nie wpiszesz adresu w `formularzEndpoint` w `dane.js`.

Skrypt wysyła `FormData` metodą POST i uznaje zgłoszenie za przyjęte przy
odpowiedzi 2xx. Trzy typowe drogi:

- **Formspree / FormSubmit** — zakładasz konto, dostajesz adres w rodzaju
  `https://formspree.io/f/xxxxxxx`, wklejasz. Zero kodu po stronie serwera.
- **Netlify Forms** — jeśli strona pójdzie na Netlify; wtedy adres to `/`
  plus atrybut `netlify` na `<form>`.
- **Własny skrypt** (PHP na hostingu klienta) — endpoint ma odebrać POST
  i odpowiedzieć kodem 200.

**Cokolwiek wybierzesz — podpisz z dostawcą umowę powierzenia przetwarzania**
(art. 28 RODO). Bez niej dane leadów trafiają do podmiotu, z którym nic
formalnie nie wiąże spółki.

### Jakie pola przychodzą w zgłoszeniu

| Pole | Zawartość |
|---|---|
| `name`, `phone`, `product` | wymagane |
| `email`, `amount`, `message` | opcjonalne |
| `company` | pole-pułapka, wypełniają je tylko boty (patrz niżej) |
| `zgoda_polityka` | `tak` / `nie` — wymagane potwierdzenie |
| `zgoda_telefon` | `tak` / `nie` — zgoda na kontakt telefoniczny |
| `zgoda_elektroniczna` | `tak` / `nie` — zgoda na e-mail/SMS |
| `zgoda_*__tresc` | pełna treść oświadczenia, na które ktoś się zgodził |
| `wersja_dokumentow` | wersja polityki i regulaminu obowiązująca przy wysyłce |
| `wyslano_o` | znacznik czasu w ISO 8601 |

Ostatnie cztery grupy to **dowód zgody** (rozliczalność, art. 5 ust. 2 RODO).
Zwykły checkbox tego nie daje: niezaznaczony w ogóle nie trafia do zgłoszenia,
a zaznaczony wysyła bezużyteczne `on`. Tu każda zgoda jedzie jawnie z treścią.

**Czego brakuje: adresu IP.** Przeglądarka go nie zna — musi go dopisać odbiorca
formularza. Przy Formspree jest w metadanych; przy własnym skrypcie weź go
z `$_SERVER['REMOTE_ADDR']`.

W formularzu jest ukryte pole-pułapka `company`. Wypełniają je tylko boty —
takie zgłoszenie jest po cichu odrzucane. **Jeśli własny skrypt odrzuca
zgłoszenia z nieznanymi polami, dopuść `company` albo je zignoruj.**

Zanim oddasz stronę, wyślij jedno zgłoszenie testowe i sprawdź, czy doszło
razem z polami `zgoda_*`.

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

## 5. Dokumenty prawne — wgrane i uzupełnione

Cztery podstrony, wszystkie podlinkowane w stopce:

| Plik | Skąd |
|---|---|
| `polityka-prywatnosci.html` | paczka klienta, **zastąpiła** poprzedni szkielet |
| `regulamin.html` | paczka klienta, **zastąpił** poprzedni szkielet |
| `polityka-cookies.html` | paczka klienta, nowa podstrona |
| `informacja-o-posredniku.html` | **zbudowana przeze mnie** z `informacja-o-posredniku.md` (art. 7 i 28a ustawy o kredycie konsumenckim) |

Wszystkie 32 pola „na żółto" są uzupełnione. Rozstrzygnięcia, które przyjąłem
tam, gdzie ankieta nie dawała jednoznacznej odpowiedzi:

- **Reklamacje: 30 dni, nie 14.** Ankieta odpowiada sprzecznie — B8 mówi
  „14 DNI", ale C7 („podlegamy ustawie o Rzeczniku Finansowym") potwierdzone
  na „OK". Ta ustawa narzuca 30 dni, więc wziąłem termin ustawowy. Jeśli
  spółka jednak nie jest podmiotem rynku finansowego, zmień w `regulamin.html`
  i `informacja-o-posredniku.html`.
- **IOD: nie wyznaczono.** Klient napisał „można mnie podać", ale wyznaczenie
  inspektora rodzi własne obowiązki — zgłoszenie do UODO w 14 dni,
  niezależność, zakaz konfliktu interesów (art. 37–39 RODO). Przy tej skali
  zwykle nie jest wymagany. Nie robiłem tego jednym kliknięciem; jeśli ma być
  wyznaczony, trzeba to zrobić świadomie i zgłosić.
- **Retencja:** leady bez umowy 12 miesięcy, reklamacje 12 miesięcy,
  logi do 12 miesięcy. Ankieta: „nie mam pojęcia". To rozsądne wartości
  domyślne, nie decyzja prawna — potwierdź u prawnika.
- **AML:** sformułowane warunkowo („w zakresie, w jakim Administrator jest
  instytucją obowiązaną"), bo status jest nierozstrzygnięty (C2: „???").
  Zdanie jest prawdziwe niezależnie od wyniku.
- **Cookies zgód / analityka:** brak banera i brak analityki, więc wpisane
  „nie dotyczy”. Po wdrożeniu GA lub pikseli trzeba wrócić do obu polityk
  i dodać baner.

Notka `legal-note` na górze każdego dokumentu mówi, że czekają na weryfikację
radcy prawnego — **usuń ją dopiero po tej weryfikacji.**

---

## 5a. Czcionki — już nie z Google

Strona serwuje Instrument Sans i Inter z katalogu `fonts/`. Wcześniej ładowała
je z `fonts.googleapis.com`, co wysyłało adres IP każdego odwiedzającego do
Google i trzeba było to deklarować w polityce prywatności. Teraz w dokumentach
stoi „nie korzysta z Google Fonts" i jest to zgodne ze stanem faktycznym.

Oba kroje są zmienne, więc jeden plik obsługuje wagi 400–700; pobrane są tylko
zestawy `latin` i `latin-ext` (polskie diakrytyki). Razem 176 kB zamiast 682 kB,
które wychodziły przy pobieraniu każdej wagi osobno. Przy zmianie krojów
wygeneruj `fonts/fonts.css` od nowa — nie edytuj go ręcznie.

---
## 6. Liczby i obietnice

Sekcja „Liczby, nie obietnice" oraz teksty w rodzaju „ponad 30 banków"
i „oddzwonimy w 24 h" to deklaracje wobec klienta końcowego. Potwierdź je
z klientem — albo popraw. Data pod liczbami (`liczby.aktualneNa`) mówi,
na kiedy są aktualne.

---

## Sprawdzenie przed oddaniem

Blokujące:

- [ ] **decyzja o kredycie hipotecznym** (wpis RPH albo korekta `kalkulator.html`)
- [ ] **opinie**: prawdziwe wypowiedzi ze zgodami albo usunięcie sekcji
      (zniknęły wszystkie `data-placeholder`)
- [ ] **endpoint formularza** wskazany + umowa powierzenia z jego dostawcą
- [ ] zgłoszenie testowe doszło i zawiera pola `zgoda_*` oraz `wyslano_o`
- [ ] odbiorca formularza dopisuje **adres IP** do dowodu zgody
      (przeglądarka go nie zna — patrz komentarz w `main.js`)

Dane i treści:

- [ ] `doradca` w `dane.js` uzupełniony — na stronie nie ma `[Imię i nazwisko]`
- [ ] `liczby.aktualneNa` uzupełnione — nie ma `[MM.RRRR]`
- [ ] potwierdzony numer telefonu w nagłówku (są dwa)
- [ ] adres siedziby zgodny z KRS **i** z wpisem w rejestrze KNF
- [ ] liczby „30+ instytucji", „12 000+ klientów", „48 h" potwierdzone
      i weryfikowalne (punkt 6)

Prawne i techniczne:

- [ ] dokumenty przejrzane przez radcę prawnego, notki `legal-note` usunięte
- [ ] termin reklamacji potwierdzony (dziś 30 dni — patrz punkt 5)
- [ ] adresy w `sitemap.xml` i `robots.txt` zgodne z docelową domeną
- [ ] intro sprawdzone na świeżej karcie (`?intro=1` wymusza pokaz)
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
