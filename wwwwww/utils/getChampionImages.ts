import { Dirent, promises as fs } from 'fs';
import { join } from 'path';

export interface ChampionImageData {
  id: string;
  name: string;
  ringNumber: string;
  bloodline: string;
  gender: string;
  birthDate: string;
  color: string;
  weight: number;
  breeder: string;
  description: string;
  images: Array<{ url: string; alt: string }>;
  videos: Array<{ url: string; alt: string }>;
  achievements: string[];
  pedigree: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// Funkcja do skanowania folderów championów
export async function scanChampionFolders(): Promise<ChampionImageData[]> {
  const championsDir = join(process.cwd(), 'public', 'champions');
  const champions: ChampionImageData[] = [];

  try {
    // Sprawdź czy folder champions istnieje
    await fs.access(championsDir);

    // Przeczytaj wszystkie foldery w champions
    const entries = await fs.readdir(championsDir, { withFileTypes: true });
    const folders = entries
      .filter((dirent: Dirent) => dirent.isDirectory())
      .map((dirent: Dirent) => dirent.name);

    for (const folderName of folders) {
      // Pomiń foldery specjalne
      if (folderName === 'thunder-storm' || folderName.startsWith('.')) {
        continue;
      }

      const championPath = join(championsDir, folderName);
      const champion = await scanChampionFolder(folderName, championPath);

      if (champion) {
        champions.push(champion);
      }
    }

    // Sortuj po numerze folderu
    champions.sort((a, b) => {
      const numA = parseInt(a.id) || 0;
      const numB = parseInt(b.id) || 0;
      return numA - numB;
    });
  } catch (error) {
    console.error('Błąd podczas skanowania folderów championów:', error);
  }

  return champions;
}

// Funkcja do skanowania pojedynczego folderu championa
async function scanChampionFolder(
  folderId: string,
  folderPath: string
): Promise<ChampionImageData | null> {
  try {
    // Sprawdź czy istnieje plik JSON z danymi championa
    let championData: Partial<ChampionImageData> = {};
    const jsonPath = join(folderPath, 'data.json');
    try {
      await fs.access(jsonPath);
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      championData = JSON.parse(jsonContent);
    } catch {
      // Plik JSON nie istnieje, użyj domyślnych danych
    }

    // Podstawowe dane championa z możliwością nadpisania z pliku JSON
    const champion: ChampionImageData = {
      id: folderId,
      name: championData.name || `Champion ${folderId}`,
      ringNumber: championData.ringNumber || `PL-2024-${folderId.padStart(3, '0')}`,
      bloodline: championData.bloodline || 'Janssen',
      gender: championData.gender || 'MALE',
      birthDate: championData.birthDate || '2023-01-01T00:00:00.000Z',
      color: championData.color || 'Blue',
      weight: championData.weight || 450,
      breeder: championData.breeder || 'MTM Pałka',
      description: championData.description || `Wybitny champion z folderu ${folderId}`,
      images: [],
      videos: [],
      achievements: championData.achievements || ['Mistrz Polski 2023'],
      pedigree: null,
      createdAt: championData.createdAt || new Date().toISOString(),
      updatedAt: championData.updatedAt || new Date().toISOString(),
    };

    // Skanuj folder gallery
    const galleryPath = join(folderPath, 'gallery');
    try {
      await fs.access(galleryPath);
      const galleryFiles = await fs.readdir(galleryPath);
      const galleryImages = galleryFiles
        .filter((file: string) => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map((file: string, index: number) => ({
          url: `/champions/${folderId}/gallery/${file}`,
          alt: `Champion ${folderId} - zdjęcie ${index + 1}`,
        }));

      champion.images = galleryImages;
    } catch {
      // Folder gallery nie istnieje
    }

    // Skanuj folder videos
    const videosPath = join(folderPath, 'videos');
    try {
      await fs.access(videosPath);
      const videoFiles = await fs.readdir(videosPath);
      const videos = videoFiles
        .filter((file: string) => /\.(mp4|webm|mov)$/i.test(file))
        .map((file: string, index: number) => ({
          url: `/champions/${folderId}/videos/${file}`,
          alt: `Champion ${folderId} - wideo ${index + 1}`,
        }));

      champion.videos = videos;
    } catch {
      // Folder videos nie istnieje
    }

    // Skanuj folder pedigree
    const pedigreePath = join(folderPath, 'pedigree');
    try {
      await fs.access(pedigreePath);
      const pedigreeFiles = await fs.readdir(pedigreePath);
      const pedigreeImages = pedigreeFiles.filter((file: string) =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );

      if (pedigreeImages.length > 0) {
        champion.pedigree = {
          images: pedigreeImages.map((file: string) => `/champions/${folderId}/pedigree/${file}`),
        };
      }
    } catch {
      // Folder pedigree nie istnieje
    }

    return champion;
  } catch (error) {
    console.error(`Błąd podczas skanowania folderu ${folderId}:`, error);
    return null;
  }
}
