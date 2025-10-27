import { ChampionProfile } from '@/components/champions/ChampionProfile';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Profil Championa',
  description: 'Poznaj championa gołębi pocztowych. Zobacz jego osiągnięcia, rodowód i galerię.',
};

export default async function ChampionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Pobierz dane championa z API
  let championData = null;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/champions/images`,
      {
        cache: 'no-store',
      }
    );

    if (response.ok) {
      const data = await response.json();
      championData = data.champions.find((champion: { id: string }) => champion.id === id);
    }
  } catch (error) {
    console.error('Błąd podczas pobierania danych championa:', error);
  }

  if (!championData) {
    notFound();
  }

  return (
    <UnifiedLayout>
      <ChampionProfile champion={championData} />
    </UnifiedLayout>
  );
}
