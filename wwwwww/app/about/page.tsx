import AboutPageClient from '@/components/about/AboutPageClient';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const metadata = {
  title: 'O nas - Pałka MTM | Mistrzowie Sprintu',
  description:
    'Poznaj historię hodowli Pałka MTM - tandem ojca i syna z Lubania, który od 2008 roku kształtuje polski sport gołębiarski.',
};

export default function AboutPage() {
  return (
    <UnifiedLayout>
      <AboutPageClient />
    </UnifiedLayout>
  );
}
