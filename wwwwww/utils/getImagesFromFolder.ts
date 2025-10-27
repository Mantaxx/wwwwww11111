// Funkcja do pobierania zdjęć championów z API
const imageCache = new Map<string, { data: string[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

export const getImagesFromFolder = async (folderPath: string): Promise<string[]> => {
  try {
    // Sprawdź cache
    const cached = imageCache.get(folderPath);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Pobierz dane z API
    const response = await fetch('/api/champions/images', {
      headers: {
        'Cache-Control': 'max-age=300', // 5 minut cache
      },
    });

    if (!response.ok) {
      throw new Error('Nie udało się pobrać zdjęć championów');
    }

    const champions = await response.json();

    // Znajdź championa na podstawie ścieżki
    const championId = folderPath
      .split('/')
      .find(
        part =>
          part !== 'champions' &&
          part !== 'gallery' &&
          part !== 'pedigree' &&
          part !== 'offspring' &&
          part !== 'videos'
      );

    if (!championId) {
      return [];
    }

    const champion = champions.find((c: any) => c.id === championId);
    if (!champion) {
      return [];
    }

    let result: string[] = [];

    // Zwróć odpowiednie zdjęcia na podstawie ścieżki
    if (folderPath.includes('gallery')) {
      result = champion.gallery || [];
    } else if (folderPath.includes('pedigree')) {
      result = champion.pedigree || [];
    } else if (folderPath.includes('offspring')) {
      result = champion.offspring || [];
    } else if (folderPath.includes('videos')) {
      result = champion.videos || [];
    }

    // Zapisz w cache
    imageCache.set(folderPath, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error('Błąd podczas pobierania zdjęć:', error);
    return [];
  }
};

// Funkcja do podziału zdjęć między championów
export const distributeImages = (images: string[], championCount: number): string[][] => {
  const result: string[][] = [];
  const imagesPerChampion = Math.ceil(images.length / championCount);

  for (let i = 0; i < championCount; i++) {
    const start = i * imagesPerChampion;
    const end = Math.min(start + imagesPerChampion, images.length);
    result.push(images.slice(start, end));
  }

  return result;
};
