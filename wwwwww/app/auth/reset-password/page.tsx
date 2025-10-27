import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function ResetPasswordPage() {
  return (
    <UnifiedLayout>
      <PasswordResetForm />
    </UnifiedLayout>
  );
}
