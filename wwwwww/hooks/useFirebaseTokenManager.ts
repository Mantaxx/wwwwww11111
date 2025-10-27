'use client';

import { User } from 'firebase/auth';
import { useEffect } from 'react';

export function useFirebaseTokenManager(user: User | null) {
  useEffect(() => {
    const updateToken = async () => {
      if (user) {
        try {
          // Pobierz token ID z force refresh aby uzyskać świeży token
          const token = await user.getIdToken(true);

          // Ustaw token w cookies z odpowiednimi flagami bezpieczeństwa
          const isProduction = process.env.NODE_ENV === 'production';
          document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; ${isProduction ? 'secure; ' : ''}samesite=strict; httponly`;

          // Dodatkowo ustaw refresh token jeśli dostępny (bez httponly dla dostępu z JS)
          const refreshToken = (user as any).refreshToken;
          if (refreshToken) {
            document.cookie = `firebase-refresh-token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${isProduction ? 'secure; ' : ''}samesite=strict`;
          }

          // console.log('Token Firebase zapisany w cookies')
        } catch (error) {
          console.error('Błąd pobierania tokenu:', error);
          // Usuń tokeny z cookies w przypadku błędu
          document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie =
            'firebase-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      } else {
        // Usuń tokeny z cookies gdy użytkownik się wyloguje
        document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'firebase-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        // console.log('Tokeny Firebase usunięte z cookies')
      }
    };

    updateToken();

    // Ustaw interval do odświeżania tokenu co 50 minut (przed wygaśnięciem)
    const tokenRefreshInterval = setInterval(updateToken, 50 * 60 * 1000);

    // Nasłuchuj na zmiany stanu uwierzytelniania Firebase
    const unsubscribe = user ? () => {} : () => {}; // Placeholder - Firebase już obsługuje to w AuthContext

    return () => {
      clearInterval(tokenRefreshInterval);
      unsubscribe();
    };
  }, [user]);
}
