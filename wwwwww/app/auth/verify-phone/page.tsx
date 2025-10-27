'use client';

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import ClientProviders from '@/components/providers/ClientProviders';
import { useAuth } from '@/contexts/AuthContext';

import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function VerifyPhoneContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const sendVerificationCode = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();

      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się wysłać kodu');
      }

      setIsCodeSent(true);
      setCountdown(60); // 60 sekund cooldown
      setSuccess('Kod weryfikacyjny został wysłany na Twój numer telefonu');
    } catch (error) {
      console.error('Błąd wysyłania SMS:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas wysyłania kodu');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Wprowadź 6-cyfrowy kod weryfikacyjny');
      return;
    }

    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();

      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nieprawidłowy kod weryfikacyjny');
      }

      setSuccess('Numer telefonu został zweryfikowany pomyślnie!');

      // Przekieruj do dashboard po krótkiej chwili
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Błąd weryfikacji kodu:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas weryfikacji kodu');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;
    await sendVerificationCode();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg"
      >
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Link
              href="/dashboard"
              className="mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Weryfikacja numeru telefonu</h1>
              <p className="text-white/70 text-sm">
                Zweryfikuj swój numer telefonu, aby uzyskać pełny dostęp do platformy
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {!isCodeSent ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Wyślij kod weryfikacyjny</h2>
                <p className="text-white/70 text-sm">
                  Wyślemy SMS z kodem weryfikacyjnym na Twój numer telefonu
                </p>
              </div>

              <motion.button
                onClick={sendVerificationCode}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Wysyłanie...' : 'Wyślij kod weryfikacyjny'}
              </motion.button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Wprowadź kod weryfikacyjny
                </h2>
                <p className="text-white/70 text-sm">
                  Wprowadź 6-cyfrowy kod, który otrzymałeś w SMS
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(value);
                      setError('');
                    }}
                    placeholder="000000"
                    className="w-full text-center text-2xl font-mono py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    maxLength={6}
                  />
                </div>

                <motion.button
                  onClick={verifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Weryfikacja...' : 'Zweryfikuj kod'}
                </motion.button>

                <div className="text-center">
                  <button
                    onClick={resendCode}
                    disabled={countdown > 0}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Wyślij ponownie za ${countdown}s` : 'Wyślij kod ponownie'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-white/50 text-xs mb-2">Dlaczego weryfikacja jest wymagana?</p>
              <div className="text-white/40 text-xs space-y-1">
                <p>• Bezpieczne transakcje i licytacje</p>
                <p>• Ochrona przed oszustwami</p>
                <p>• Pełny dostęp do wszystkich funkcji</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <UnifiedLayout>
      <ClientProviders>
        <VerifyPhoneContent />
      </ClientProviders>
    </UnifiedLayout>
  );
}
