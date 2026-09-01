# Zdjęcia

| Plik | Gdzie | Kadr |
|---|---|---|
| `hero.jpg` | tło hero (cały ekran) | poziomy, 16:9, ciemna lewa połowa |
| `doradca.jpg` | materiał zapasowy | pełna sylwetka, 3:4 |
| `doradca-2.jpg` | sekcja „Doradca” | popiersie, 4:5 |

Oba portrety pochodzą z jednego zdjęcia — sekcja „Doradca” ma ciaśniejszy kadr,
żeby nie czytała się jako powtórka tej samej grafiki.

## `hero.jpg` — wymagania kadru

Cała typografia hero leży w **lewej połowie**, więc kadr musi być tam ciemny
i spokojny: ściana, cień, blat. Motyw (biurko, laptop, dokumenty) trzymaj po prawej.
Minimum 1600 px szerokości, JPEG jakość 84, tryb progresywny.

Po podmianie popraw `width` i `height` przy `<img>` w `index.html` **oraz** ścieżkę
w `<link rel="preload">` w `<head>` — to dwa osobne miejsca.
Jeśli nowe zdjęcie jest jaśniejsze, wzmocnij gradient `.hero-shade` w `styles.css`;
biały tekst musi trzymać kontrast bez patrzenia w miernik.

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
