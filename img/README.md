# Zdjęcia

| Plik | Gdzie | Kadr |
|---|---|---|
| `doradca.jpg` | hero (prawa kolumna) | pełna sylwetka, 3:4 |
| `doradca-2.jpg` | sekcja „Doradca” | popiersie, 4:5 |

Oba pochodzą z jednego zdjęcia — sekcja „Doradca” ma ciaśniejszy kadr, żeby
nie czytała się jako powtórka tej samej grafiki co w hero.

## Przy podmianie

- **Format: JPEG, nie PNG.** Zdjęcie bez przezroczystości zapisane jako PNG
  waży kilkanaście razy więcej przy tej samej jakości, a hero ładuje je od razu.
  Jakość 85–88, tryb progresywny.
- Pion, minimum 1100 px szerokości, twarz w górnej części kadru — hero przycina
  z `object-position: 50% 22%`.
- Po podmianie popraw `width` i `height` przy `<img>` w `index.html`
  (dwa miejsca). Bez tego strona podskakuje przy wczytywaniu.
- Atrybut `data-portrait` musi zostać — to on włącza planszę zapasową,
  gdy pliku brakuje.
