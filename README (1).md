# Zdjęcia

| Plik | Gdzie | Kadr |
|---|---|---|
| `hero.jpg` | tło hero (cały ekran) | poziomy, 16:9, jasna lewa połowa i jasny dół |
| `doradca.jpg` | materiał zapasowy | pełna sylwetka, 3:4 |
| `doradca-2.jpg` | sekcja „Doradca” | popiersie, 4:5 |

Oba portrety pochodzą z jednego zdjęcia — sekcja „Doradca” ma ciaśniejszy kadr,
żeby nie czytała się jako powtórka tej samej grafiki.

## `hero.jpg` — wymagania kadru

Cała typografia hero leży w **lewym dolnym rogu**, więc kadr musi być tam jasny
i spokojny: ściana, blat. Motyw (biurko, laptop, dokumenty) trzymaj po prawej
i wyżej. 2560 px szerokości wystarczy, JPEG jakość 84.

Po podmianie popraw `width` i `height` przy `<img>` w `index.html` **oraz** ścieżkę
w `<link rel="preload">` w `<head>` — to dwa osobne miejsca.

**Zdjęcie ciemniejsze wymaga przerobienia hero, nie tylko podmiany pliku.** Cała
typografia jest dziś ciemna, a `.hero-shade` rozjaśnia tło od lewej i od dołu —
na ciemnym kadrze trzeba odwrócić komplet kolorów w `styles.css` (`.hero-copy`,
`.hero-proof`, `.hero-shade`, nagłówek `.site-header--overlay`) i dorobić jasny
wariant znaku do nagłówka.

## Przy podmianie portretów

- **Format: JPEG, nie PNG.** Zdjęcie bez przezroczystości zapisane jako PNG
  waży kilkanaście razy więcej przy tej samej jakości, a hero ładuje je od razu.
  Jakość 85–88, tryb progresywny.
- Pion, minimum 1100 px szerokości, twarz w górnej części kadru — hero przycina
  z `object-position: 50% 22%`.
- Po podmianie popraw `width` i `height` przy `<img>` w `index.html`
  (dwa miejsca). Bez tego strona podskakuje przy wczytywaniu.
- Atrybut `data-portrait` musi zostać — to on włącza planszę zapasową,
  gdy pliku brakuje.
