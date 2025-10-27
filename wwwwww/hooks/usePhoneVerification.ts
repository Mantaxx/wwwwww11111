'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface PhoneVerificationStatus {
  isPhoneVerified: boolean;
  phoneNumber: string | null;
  isLoading: boolean;
  error: string | null;
}

export function usePhoneVerification(): PhoneVerificationStatus {
  const { user, loading } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<PhoneVerificationStatus>({
    isPhoneVerified: false,
    phoneNumber: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (loading) {
      setVerificationStatus(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!user) {
      setVerificationStatus({
        isPhoneVerified: false,
        phoneNumber: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Pobierz dane użytkownika z API
    const fetchUserData = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { user: userData } = await response.json();
          setVerificationStatus({
            isPhoneVerified: userData.isPhoneVerified || false,
            phoneNumber: userData.phoneNumber || null,
            isLoading: false,
            error: null,
          });
        } else {
          setVerificationStatus({
            isPhoneVerified: false,
            phoneNumber: null,
            isLoading: false,
            error: 'Błąd pobierania danych użytkownika',
          });
        }
      } catch (error) {
        setVerificationStatus({
          isPhoneVerified: false,
          phoneNumber: null,
          isLoading: false,
          error: 'Błąd połączenia z serwerem',
        });
      }
    };

    fetchUserData();
  }, [user, loading]);

  return verificationStatus;
}
