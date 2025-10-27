'use client';

import { useAuth } from '@/contexts/AuthContext';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Eye, EyeOff, Key, Lock } from 'lucide-react';
import { useState } from 'react';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!currentPassword.trim()) {
      setError('Wprowadź obecne hasło');
      return false;
    }

    if (!newPassword.trim()) {
      setError('Wprowadź nowe hasło');
      return false;
    }

    if (newPassword.length < 8) {
      setError('Nowe hasło musi mieć co najmniej 8 znaków');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Nowe hasła nie są identyczne');
      return false;
    }

    if (currentPassword === newPassword) {
      setError('Nowe hasło musi być inne od obecnego');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user || !user.email) {
      setError('Brak danych użytkownika');
      return;
    }

    // Sprawdź czy użytkownik ma zweryfikowany numer telefonu
    try {
      const token = await user.getIdToken();
      const profileResponse = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileResponse.json();

      if (!profileData.user?.isPhoneVerified) {
        setError('Aby zmienić hasło, musisz najpierw zweryfikować swój numer telefonu przez SMS');
        return;
      }
    } catch (error) {
      setError('Błąd podczas sprawdzania weryfikacji telefonu');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Reautentykacja użytkownika
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Aktualizacja hasła
      await updatePassword(user, newPassword);

      setSuccess('Hasło zostało pomyślnie zmienione!');

      // Wyczyść formularz
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Wywołaj callback po 2 sekundach
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error: unknown) {
      console.error('Błąd zmiany hasła:', error);

      const err = error as { code?: string };
      switch (err.code) {
        case 'auth/wrong-password':
          setError('Nieprawidłowe obecne hasło');
          break;
        case 'auth/weak-password':
          setError('Nowe hasło jest zbyt słabe');
          break;
        case 'auth/requires-recent-login':
          setError('Musisz się ponownie zalogować, aby zmienić hasło');
          break;
        case 'auth/too-many-requests':
          setError('Zbyt wiele prób. Spróbuj później.');
          break;
        default:
          setError('Wystąpił błąd podczas zmiany hasła');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
          <Key className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Zmień hasło</h3>
          <p className="text-white/70 text-sm">
            Zaktualizuj swoje hasło dla większego bezpieczeństwa
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Obecne hasło */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">Obecne hasło</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => {
                setCurrentPassword(e.target.value);
                setError('');
              }}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Wprowadź obecne hasło"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nowe hasło */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">Nowe hasło</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                setError('');
              }}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Wprowadź nowe hasło"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Potwierdź nowe hasło */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">Potwierdź nowe hasło</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Potwierdź nowe hasło"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Zmienianie...' : 'Zmień hasło'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Anuluj
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-300 text-sm">
          <strong>Wymagania bezpieczeństwa:</strong> Aby zmienić hasło, numer telefonu musi być
          zweryfikowany przez SMS. Używaj silnego hasła z co najmniej 8 znakami.
        </p>
      </div>
    </motion.div>
  );
}
