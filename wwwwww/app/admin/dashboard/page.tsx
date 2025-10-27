import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel Administratora - Gołębie Pocztowe',
  description: 'Zarządzaj platformą i użytkownikami',
};

export default function AdminDashboardPage() {
  return (
    <UnifiedLayout>
      <AdminRouteGuard>
        <AdminDashboard />
      </AdminRouteGuard>
    </UnifiedLayout>
  );
}
