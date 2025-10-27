'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProfileVerificationStatus {
  isProfileVerified: boolean;
  isPhoneVerified: boolean;
  isFullyVerified: boolean;
  missingFields: string[];
  canCreateAuctions: boolean;
  canBid: boolean;
  canAddReferences: boolean;
  canAddPhotos: boolean;
}

export function useProfileVerification() {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<ProfileVerificationStatus>({
    isProfileVerified: false,
    isPhoneVerified: false,
    isFullyVerified: false,
    missingFields: [],
    canCreateAuctions: false,
    canBid: false,
    canAddReferences: false,
    canAddPhotos: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) {
        setVerificationStatus({
          isProfileVerified: false,
          isPhoneVerified: false,
          isFullyVerified: false,
          missingFields: [],
          canCreateAuctions: false,
          canBid: false,
          canAddReferences: false,
          canAddPhotos: false,
        });
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const profile = data.user;

          // Administratorzy są automatycznie w pełni zweryfikowani
          const isAdmin = profile.role === 'ADMIN';

          const missingFields: string[] = [];
          if (!isAdmin) {
            if (!profile.firstName) missingFields.push('Imię');
            if (!profile.lastName) missingFields.push('Nazwisko');
            if (!profile.address) missingFields.push('Adres');
            if (!profile.city) missingFields.push('Miasto');
            if (!profile.postalCode) missingFields.push('Kod pocztowy');
            if (!profile.phoneNumber) missingFields.push('Numer telefonu');
          }

          const isProfileVerified =
            isAdmin || profile.isProfileVerified || missingFields.length === 0;
          const isPhoneVerified = isAdmin || profile.isPhoneVerified;
          const isFullyVerified = isAdmin || (isProfileVerified && isPhoneVerified);

          setVerificationStatus({
            isProfileVerified,
            isPhoneVerified,
            isFullyVerified,
            missingFields,
            canCreateAuctions: isFullyVerified,
            canBid: isFullyVerified,
            canAddReferences: isFullyVerified,
            canAddPhotos: isFullyVerified,
          });
        } else {
          // Fallback - sprawdź podstawowe dane z Firebase
          const missingFields: string[] = [];
          if (!user.displayName) missingFields.push('Imię i nazwisko');
          if (!user.phoneNumber) missingFields.push('Numer telefonu');

          const isProfileVerified = false;
          const isPhoneVerified = !!user.phoneNumber;
          const isFullyVerified = false;

          setVerificationStatus({
            isProfileVerified,
            isPhoneVerified,
            isFullyVerified,
            missingFields,
            canCreateAuctions: false,
            canBid: false,
            canAddReferences: false,
            canAddPhotos: false,
          });
        }
      } catch (error) {
        console.error('Błąd sprawdzania weryfikacji profilu:', error);
        setVerificationStatus({
          isProfileVerified: false,
          isPhoneVerified: false,
          isFullyVerified: false,
          missingFields: [],
          canCreateAuctions: false,
          canBid: false,
          canAddReferences: false,
          canAddPhotos: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkVerificationStatus();
  }, [user]);

  return {
    ...verificationStatus,
    loading,
    refresh: () => {
      setLoading(true);
      // Trigger useEffect again
      setVerificationStatus(prev => ({ ...prev }));
    },
  };
}
