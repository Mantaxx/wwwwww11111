'use client';

import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, MapPin, Phone, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  isProfileVerified: boolean;
  isActive: boolean;
}

interface ProfileFormProps {
  initialUser?: User;
}

export default function ProfileForm({ initialUser }: ProfileFormProps) {
  const { user: firebaseUser } = useAuth();
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phoneNumber: '',
  });

  // Pobierz dane użytkownika jeśli nie zostały przekazane
  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        setLoading(true);

        if (!firebaseUser) {
          setMessage({ type: 'error', text: 'Brak autoryzacji' });
          return;
        }

        const token = await firebaseUser.getIdToken();
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setMessage({ type: 'error', text: 'Błąd podczas ładowania profilu' });
        }
      } catch (error) {
        console.error('Błąd podczas ładowania profilu:', error);
        setMessage({ type: 'error', text: 'Wystąpił błąd podczas ładowania profilu' });
      } finally {
        setLoading(false);
      }
    };

    if (!initialUser) {
      fetchUserProfileData();
    }
  }, [initialUser, firebaseUser]);

  // Ustaw dane formularza gdy użytkownik się załaduje
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Wyczyść błąd dla tego pola
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      newErrors.firstName = 'Imię musi mieć co najmniej 2 znaki';
    }

    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      newErrors.lastName = 'Nazwisko musi mieć co najmniej 2 znaki';
    }

    if (!formData.address.trim() || formData.address.length < 5) {
      newErrors.address = 'Adres musi mieć co najmniej 5 znaków';
    }

    if (!formData.city.trim() || formData.city.length < 2) {
      newErrors.city = 'Miasto musi mieć co najmniej 2 znaki';
    }

    if (!formData.postalCode.match(/^\d{2}-\d{3}$/)) {
      newErrors.postalCode = 'Kod pocztowy musi być w formacie XX-XXX';
    }

    if (!formData.phoneNumber.match(/^\+48\d{9}$/)) {
      newErrors.phoneNumber = 'Numer telefonu musi być w formacie +48XXXXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      if (!firebaseUser) {
        setMessage({ type: 'error', text: 'Brak autoryzacji' });
        return;
      }

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setMessage({
          type: 'success',
          text: data.phoneVerificationReset
            ? 'Profil zaktualizowany. Numer telefonu wymaga ponownej weryfikacji.'
            : 'Profil został zaktualizowany pomyślnie',
        });
      } else {
        if (data.details) {
          // Błędy walidacji z serwera
          const serverErrors: Record<string, string> = {};
          data.details.forEach((detail: { field: string; message: string }) => {
            serverErrors[detail.field] = detail.message;
          });
          setErrors(serverErrors);
        }
        setMessage({ type: 'error', text: data.error || 'Błąd podczas aktualizacji profilu' });
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania profilu:', error);
      setMessage({ type: 'error', text: 'Wystąpił błąd podczas zapisywania profilu' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Ładowanie profilu...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Nie udało się załadować profilu użytkownika</p>
      </div>
    );
  }

  const isProfileComplete = user.isProfileVerified && user.isPhoneVerified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Status profilu */}
      <div
        className={`mb-6 p-4 rounded-lg border ${
          isProfileComplete
            ? 'bg-green-500/20 border-green-500/30'
            : 'bg-yellow-500/20 border-yellow-500/30'
        }`}
      >
        <div className="flex items-center gap-2">
          {isProfileComplete ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <span
            className={`font-medium ${isProfileComplete ? 'text-green-300' : 'text-yellow-300'}`}
          >
            {isProfileComplete
              ? 'Profil jest w pełni zweryfikowany - masz dostęp do wszystkich funkcji (licytacje, aukcje, recenzje)'
              : user.isProfileVerified && !user.isPhoneVerified
                ? 'Profil uzupełniony - zweryfikuj numer telefonu aby uzyskać pełny dostęp do licytacji i wystawiania aukcji'
                : 'Profil wymaga uzupełnienia - uzupełnij wszystkie dane (imię, nazwisko, adres, miasto, kod pocztowy, numer telefonu) aby móc korzystać z pełnej funkcjonalności'}
          </span>
        </div>
        {!isProfileComplete && (
          <div className="mt-3 text-sm text-white/70">
            <p className="mb-1">Aby uzyskać pełny dostęp do platformy musisz:</p>
            <ul className="list-disc list-inside space-y-1">
              {!user.isProfileVerified && <li>Uzupełnić wszystkie dane osobowe i adresowe</li>}
              {!user.isPhoneVerified && <li>Zweryfikować numer telefonu przez SMS</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Komunikaty */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-300'
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dane osobowe */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-white/60" />
            <h3 className="text-lg font-semibold text-white">Dane osobowe</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-1">
                Imię *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-white/50 ${
                  errors.firstName ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="Wprowadź imię"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-1">
                Nazwisko *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-white/50 ${
                  errors.lastName ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="Wprowadź nazwisko"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white/50"
            />
            <p className="mt-1 text-xs text-white/50">Email nie może być zmieniony</p>
          </div>
        </div>

        {/* Adres */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-white/60" />
            <h3 className="text-lg font-semibold text-white">Adres</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-white/70 mb-1">
                Ulica i numer *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-white/50 ${
                  errors.address ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="np. ul. Główna 123"
              />
              {errors.address && <p className="mt-1 text-sm text-red-400">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-white/70 mb-1">
                  Miasto *
                </label>
                <AddressAutocomplete
                  value={formData.city}
                  onChange={(value: string) => setFormData({ ...formData, city: value })}
                  onPostalCodeChange={(postalCode: string) =>
                    setFormData({ ...formData, postalCode: postalCode })
                  }
                  placeholder="Wpisz nazwę miasta..."
                  type="city"
                />
                {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-white/70 mb-1"
                >
                  Kod pocztowy *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-white/50 transition-all ${
                    errors.postalCode ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="XX-XXX"
                  maxLength={6}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-400">{errors.postalCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Telefon */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-white/60" />
            <h3 className="text-lg font-semibold text-white">Numer telefonu</h3>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/70 mb-1">
              Numer telefonu *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-white/50 ${
                errors.phoneNumber ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="+48123456789"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
            )}

            <div className="mt-2 flex items-center gap-2">
              {user.isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Numer zweryfikowany
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  Numer wymaga weryfikacji SMS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Przycisk zapisz */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Zapisz profil
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
