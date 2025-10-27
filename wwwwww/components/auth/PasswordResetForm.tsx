'use client';

import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PasswordResetForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Wprowadź adres email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/signin`,
        handleCodeInApp: false,
      });

      setIsEmailSent(true);
    } catch (error) {
      console.error('Błąd resetowania hasła:', error);

      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('Nie znaleziono konta z tym adresem email');
          break;
        case 'auth/invalid-email':
          setError('Nieprawidłowy format email');
          break;
        case 'auth/too-many-requests':
          setError('Zbyt wiele prób. Spróbuj później.');
          break;
        default:
          setError('Wystąpił błąd. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">Email wysłany!</h1>

            <p className="text-white/70 mb-6">Wysłaliśmy link do resetowania hasła na adres:</p>

            <p className="text-blue-400 font-semibold mb-6">{email}</p>

            <p className="text-white/70 text-sm mb-8">
              Sprawdź swoją skrzynkę odbiorczą i kliknij w link, aby zresetować hasło. Link jest
              ważny przez 1 godzinę.
            </p>

            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center"
              >
                Powrót do logowania
              </Link>

              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                className="w-full py-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                Wyślij ponownie
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Resetowanie hasła</h1>
            <p className="text-white/70">
              Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Twój adres email"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Wysyłanie...' : 'Wyślij link resetowania'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-white/70 hover:text-white transition-colors text-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do logowania
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
