'use client';

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import ClientProviders from '@/components/providers/ClientProviders';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { validatePhoneNumber } from '@/lib/phone-validation';
import { motion } from 'framer-motion';
import { MapPin, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function CompleteProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phoneNumber: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneValidation, setPhoneValidation] = useState<{ isValid: boolean; error?: string }>({
    isValid: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const validatePhone = (phoneNumber: string) => {
    if (!phoneNumber.trim()) {
      setPhoneValidation({ isValid: true }); // Pusty numer jest OK (opcjonalny)
      return;
    }

    const validation = validatePhoneNumber(phoneNumber, 'PL');
    setPhoneValidation({
      isValid: validation.isValid,
      error: validation.error,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.address.trim()) {
      setError('Wypełnij wszystkie wymagane pola');
      return;
    }

    if (formData.phoneNumber.trim() && !phoneValidation.isValid) {
      setError('Wprowadź prawidłowy numer telefonu');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Brak zalogowanego użytkownika');
      }

      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd podczas aktualizacji profilu');
      }

      setSuccess('Profil został uzupełniony pomyślnie!');

      // Przekieruj do dashboard po krótkiej chwili
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Błąd uzupełniania profilu:', error);
      setError(
        error instanceof Error ? error.message : 'Wystąpił błąd podczas aktualizacji profilu'
      );
    } finally {
      setIsLoading(false);
    }
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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Uzupełnij swój profil</h1>
            <p className="text-white/70 text-sm">
              Wypełnij poniższe informacje, aby móc korzystać z pełnej funkcjonalności platformy
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imię */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                value={formData.firstName}
                onChange={e => {
                  setFormData(prev => ({ ...prev, firstName: e.target.value }));
                  setError('');
                }}
                placeholder="Imię *"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Nazwisko */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                value={formData.lastName}
                onChange={e => {
                  setFormData(prev => ({ ...prev, lastName: e.target.value }));
                  setError('');
                }}
                placeholder="Nazwisko *"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Adres */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                value={formData.address}
                onChange={e => {
                  setFormData(prev => ({ ...prev, address: e.target.value }));
                  setError('');
                }}
                placeholder="Adres (ulica, numer) *"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Miasto */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                value={formData.city}
                onChange={e => {
                  setFormData(prev => ({ ...prev, city: e.target.value }));
                  setError('');
                }}
                placeholder="Miasto"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Kod pocztowy */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                value={formData.postalCode}
                onChange={e => {
                  setFormData(prev => ({ ...prev, postalCode: e.target.value }));
                  setError('');
                }}
                placeholder="Kod pocztowy"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Numer telefonu */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={e => {
                  setFormData(prev => ({ ...prev, phoneNumber: e.target.value }));
                  validatePhone(e.target.value);
                  setError('');
                }}
                placeholder="Numer telefonu"
                className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  phoneValidation.isValid
                    ? 'border-white/20 focus:ring-blue-500'
                    : 'border-red-500/50 focus:ring-red-500'
                }`}
              />
              {!phoneValidation.isValid && (
                <p className="mt-1 text-red-300 text-xs">{phoneValidation.error}</p>
              )}
            </div>

            {/* Przycisk */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Zapisywanie...' : 'Uzupełnij profil'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">Pola oznaczone * są wymagane</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <UnifiedLayout>
      <ClientProviders>
        <CompleteProfileContent />
      </ClientProviders>
    </UnifiedLayout>
  );
}
