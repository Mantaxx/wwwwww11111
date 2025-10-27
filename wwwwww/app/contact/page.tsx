import ContactPageClient from '@/components/contact/ContactPageClient';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const metadata = {
  title: 'Kontakt - Gołębie Pocztowe',
  description: 'Skontaktuj się z nami. Adres, telefon, email i lokalizacja Pałka MTM.',
};

export default function ContactPage() {
  return (
    <UnifiedLayout>
      <ContactPageClient />
    </UnifiedLayout>
  );
}
