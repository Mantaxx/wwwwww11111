import CreateAuctionForm from '@/components/auctions/CreateAuctionForm';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { GlassContainer } from '@/components/ui/GlassContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utwórz nową aukcję - Gołębie Pocztowe',
  description: 'Dodaj nową aukcję gołębia pocztowego na platformę',
};

export default function CreateAuctionPage() {
  return (
    <UnifiedLayout>
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GlassContainer variant="ultra" className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Utwórz nową aukcję</h1>
              <p className="text-white/80 mt-2">
                Dodaj nową aukcję gołębia pocztowego, suplementów lub akcesoriów
              </p>
            </div>

            <CreateAuctionForm showHeader={false} />
          </GlassContainer>
        </div>
      </div>
    </UnifiedLayout>
  );
}
