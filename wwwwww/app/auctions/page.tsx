import { AuctionsPage } from '@/components/auctions/AuctionsPage';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const metadata = {
  title: 'Aukcje - Gołębie Pocztowe',
  description: 'Przeglądaj i licytuj ekskluzywne gołębie pocztowe z rodowodami.',
};

export default function Auctions() {
  return (
    <UnifiedLayout>
      <AuctionsPage />
    </UnifiedLayout>
  );
}
