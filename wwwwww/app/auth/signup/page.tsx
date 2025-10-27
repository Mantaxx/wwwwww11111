import FirebaseSignUpForm from '@/components/auth/FirebaseSignUpForm';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function SignUpPage() {
  return (
    <UnifiedLayout>
      <FirebaseSignUpForm />
    </UnifiedLayout>
  );
}
