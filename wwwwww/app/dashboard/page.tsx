'use client';

import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { VerificationBanner } from '@/components/ui/VerificationIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('DashboardPage render - user:', user, 'loading:', loading);

  useEffect(() => {
    // Sprawdź czy email został właśnie zweryfikowany
    const emailJustVerified = localStorage.getItem('emailJustVerified');
    if (emailJustVerified === 'true') {
      localStorage.removeItem('emailJustVerified');
      // Pokaż toast/notification o sukcesie
      console.log('✅ Email został pomyślnie zweryfikowany!');
      // Tutaj możesz dodać toast notification jeśli masz taką bibliotekę
    }
  }, []);

  useEffect(() => {
    console.log('DashboardPage useEffect - user:', user, 'loading:', loading);
    if (!loading && !user) {
      console.log('Użytkownik nie zalogowany, przekierowuję do signin...');
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Ładowanie...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <UnifiedLayout>
      <div className="container mx-auto px-4 py-8">
        {!user.emailVerified && (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:border-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">📧 Sprawdź swoją pocztę!</h2>
              <p className="text-white/70 mb-4">
                Wysłaliśmy link aktywacyjny na adres:
              </p>
              <p className="text-blue-300 font-medium mb-4">{user.email}</p>
              <p className="text-white/60 text-sm mb-6">
                Kliknij w link w emailu, aby aktywować konto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
                >
                  Zweryfikowałem email - sprawdź
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement resend email functionality
                    alert('Funkcja ponownego wysłania emaila zostanie wkrótce dodana');
                  }}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                >
                  Wyślij ponownie email
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement logout functionality
                    window.location.href = '/auth/signin';
                  }}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                >
                  Wyloguj się
                </button>
              </div>
              <p className="text-white/60 text-base mt-4">
                💡 Wskazówka: Sprawdź także folder SPAM
              </p>
            </div>
          </div>
        )}
        <VerificationBanner />
        <UserDashboard />
      </div>
    </UnifiedLayout>
  );
}
