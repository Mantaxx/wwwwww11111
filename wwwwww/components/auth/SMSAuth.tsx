'use client';

import { auth } from '@/lib/firebase';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SMSAuthProps {
  phoneNumber: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function SMSAuth({ phoneNumber, onSuccess, onBack }: SMSAuthProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Inicjalizacja reCAPTCHA
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA rozwiązana');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA wygasła');
        setError('reCAPTCHA wygasła. Spróbuj ponownie.');
      },
    });

    setRecaptchaVerifier(verifier);

    // Automatyczne wysłanie SMS
    const sendSMSCode = async () => {
      if (!verifier) return;

      setIsLoading(true);
      setError('');

      try {
        const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
        setConfirmationResult(result);
        setIsCodeSent(true);
      } catch (error) {
        console.error('Błąd wysyłania SMS:', error);

        const firebaseError = error as { code?: string };
        switch (firebaseError.code) {
          case 'auth/invalid-phone-number':
            setError('Nieprawidłowy numer telefonu');
            break;
          case 'auth/too-many-requests':
            setError('Zbyt wiele prób. Spróbuj później.');
            break;
          case 'auth/quota-exceeded':
            setError('Przekroczono limit SMS. Spróbuj później.');
            break;
          default:
            setError('Błąd wysyłania SMS. Spróbuj ponownie.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    sendSMSCode();

    return () => {
      if (verifier) {
        verifier.clear();
      }
    };
  }, [phoneNumber]);

  const sendSMS = async () => {
    if (!recaptchaVerifier) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setIsCodeSent(true);
    } catch (error) {
      console.error('Błąd wysyłania SMS:', error);

      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/invalid-phone-number':
          setError('Nieprawidłowy numer telefonu');
          break;
        case 'auth/too-many-requests':
          setError('Zbyt wiele prób. Spróbuj później.');
          break;
        case 'auth/quota-exceeded':
          setError('Przekroczono limit SMS. Spróbuj później.');
          break;
        default:
          setError('Błąd wysyłania SMS. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmationResult || !verificationCode.trim()) {
      setError('Wprowadź kod weryfikacyjny');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await confirmationResult.confirm(verificationCode);
      onSuccess();
    } catch (error) {
      console.error('Błąd weryfikacji kodu:', error);

      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/invalid-verification-code':
          setError('Nieprawidłowy kod weryfikacyjny');
          break;
        case 'auth/code-expired':
          setError('Kod wygasł. Wyślij nowy.');
          break;
        default:
          setError('Błąd weryfikacji kodu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!recaptchaVerifier) return;
    await sendSMS();
  };

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
              <Phone className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Weryfikacja SMS</h1>
            <p className="text-white/70">Wysłaliśmy kod weryfikacyjny na numer:</p>
            <p className="text-blue-400 font-semibold mt-2">{phoneNumber}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {isCodeSent && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <p className="text-green-300 text-sm">Kod został wysłany!</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Pole na kod weryfikacyjny */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Kod weryfikacyjny (6 cyfr)</label>
              <input
                type="text"
                value={verificationCode}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                placeholder="123456"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            {/* Przycisk weryfikacji */}
            <motion.button
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Weryfikacja...' : 'Zweryfikuj kod'}
            </motion.button>

            {/* Przycisk ponownego wysłania */}
            <button
              onClick={resendCode}
              disabled={isLoading}
              className="w-full py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm disabled:opacity-50"
            >
              Wyślij kod ponownie
            </button>

            {/* Przycisk powrotu */}
            <button
              onClick={onBack}
              className="w-full py-2 text-white/70 hover:text-white transition-colors text-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zmień numer telefonu
            </button>
          </div>

          {/* Ukryty kontener dla reCAPTCHA */}
          <div id="recaptcha-container"></div>
        </div>
      </motion.div>
    </div>
  );
}
