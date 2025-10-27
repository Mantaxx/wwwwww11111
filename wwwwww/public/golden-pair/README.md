# Złota Para - Pliki

## Struktura folderów

### `/photos/` - Zdjęcia gołębi

Umieść tutaj zdjęcia Złotej Pary:

- `samiec-1.jpg` - Zdjęcie samca
- `samica-1.jpg` - Zdjęcie samicy
- `para-1.jpg` - Zdjęcie pary razem
- Dodatkowe zdjęcia można nazwać `samiec-2.jpg`, `samica-2.jpg` itd.

**Wymagania:**

- Format: JPG, PNG, WebP
- Rozmiar: zalecane 800x800px lub większy
- Nazwy plików: bez polskich znaków, małe litery

### `/pedigrees/` - Rodowody

Umieść tutaj rodowody w formacie PDF lub JPEG:

- `rodowod-samca.pdf` - Rodowód samca
- `rodowod-samicy.pdf` - Rodowód samicy
- Dodatkowe rodowody można nazwać `rodowod-samca-2.pdf` itd.

**Wymagania:**

- Format: PDF (zalecane) lub JPEG
- Nazwy plików: bez polskich znaków, małe litery
- Rozmiar: maksymalnie 10MB na plik

## Jak dodać nowe pliki

1. Skopiuj pliki do odpowiednich folderów
2. Użyj nazw zgodnych z konwencją
3. Odśwież stronę - pliki pojawią się automatycznie
4. Jeśli dodajesz nowe pliki, zaktualizuj tablice `photos` i `pedigrees` w komponencie `GoldenPairSection.tsx`

## Przykładowe nazwy plików

### Zdjęcia

- `samiec-1.jpg`
- `samica-1.jpg`
- `para-1.jpg`
- `samiec-profil.jpg`
- `samica-profil.jpg`

### Rodowody

- `rodowod-samca.pdf`
- `rodowod-samicy.pdf`
- `rodowod-samca-szczegolowy.pdf`
- `rodowod-samicy-szczegolowy.pdf`
