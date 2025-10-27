import { ReferencesPage } from '@/components/references/ReferencesPage';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const metadata = {
  title: 'Referencje - Gołębie Pocztowe',
  description: 'Poznaj historie sukcesu hodowców, którzy wybrali nasze gołębie pocztowe.',
};

export default function References() {
  return (
    <UnifiedLayout>
      <ReferencesPage />
    </UnifiedLayout>
  );
}
