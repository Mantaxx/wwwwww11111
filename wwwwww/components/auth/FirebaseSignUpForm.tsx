'use client';

import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function FirebaseSignUpForm() {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Imię jest wymagane');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Nazwisko jest wymagane');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email jest wymagany');
      return false;
    }
    if (!formData.password) {
      setError('Hasło jest wymagane');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Tworzenie użytkownika w Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      console.log('Użytkownik został zarejestrowany:', user);

      // Aktualizacja profilu użytkownika
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      console.log('Profil użytkownika został zaktualizowany.');

      // Zapisz dane użytkownika w bazie danych
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: '',
          city: '',
          postalCode: '',
          phoneNumber: '+48',
        }),
      });

      console.log('Dane użytkownika zostały zapisane w bazie danych.');

      // Wysłanie emaila weryfikacyjnego
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(formData.email)}`,
        handleCodeInApp: false,
      });

      console.log('E-mail weryfikacyjny został wysłany.');

      setSuccess('Konto zostało utworzone! Sprawdź email w celu aktywacji konta.');

      // Przekierowanie na stronę główną
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Błąd rejestracji:', error);

      const err = error as { code?: string };
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Ten email jest już używany');
          break;
        case 'auth/invalid-email':
          setError('Nieprawidłowy format email');
          break;
        case 'auth/weak-password':
          setError('Hasło jest zbyt słabe');
          break;
        default:
          setError('Wystąpił błąd podczas rejestracji');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstName"
        placeholder="Imię"
        value={formData.firstName}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Nazwisko"
        value={formData.lastName}
        onChange={handleInputChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Hasło"
        value={formData.password}
        onChange={handleInputChange}
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Potwierdź hasło"
        value={formData.confirmPassword}
        onChange={handleInputChange}
      />
      {error && <p style={{ color: 'red', position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '10px 20px', borderRadius: '5px', border: '2px solid white', zIndex: 1000 }}>{error}</p>}
      {success && <p style={{ color: 'green', position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '10px 20px', borderRadius: '5px', border: '2px solid white', zIndex: 1000 }}>{success}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
      </button>
    </form>
  );
}