import { PressPage } from '@/components/press/PressPage';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const metadata = {
  title: 'Prasa - Gołębie Pocztowe',
  description:
    'Artykuły prasowe, wywiady i materiały medialne o hodowli gołębi pocztowych MTM Pałka.',
};

export default function Press() {
  return (
    <UnifiedLayout>
      <PressPage />
    </UnifiedLayout>
  );
}
