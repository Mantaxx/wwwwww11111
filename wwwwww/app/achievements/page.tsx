'use client';

import { AchievementsCarousel } from '@/components/achievements/AchievementsCarousel';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useCallback, useState } from 'react';

export default function AchievementsPage() {
  const [, setNavigation] = useState<{
    prevSlide: () => void;
    nextSlide: () => void;
    goToSlide: (index: number) => void;
    currentIndex: number;
    totalItems: number;
  } | null>(null);

  const handleNavigationReady = useCallback(
    (nav: {
      prevSlide: () => void;
      nextSlide: () => void;
      goToSlide: (index: number) => void;
      currentIndex: number;
      totalItems: number;
    }) => {
      setNavigation(nav);
    },
    []
  );

  return (
    <UnifiedLayout showFooter={false}>
      <div className="container mx-auto px-4 -mt-16">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Nasze Osiągnięcia</h1>
      </div>
      <div className="container mx-auto px-4 -mt-32">
        <AchievementsCarousel onNavigationReady={handleNavigationReady} />
      </div>
    </UnifiedLayout>
  );
}
