'use client';

import { useFirebaseTokenManager } from '@/hooks/useFirebaseTokenManager';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isEmailVerified: false,
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Flagi do zapobiegania wielokrotnym synchronizacjom
  const syncInProgress = useRef(false);
  const lastSyncedUid = useRef<string | null>(null);

  // Zarządzaj tokenami Firebase w cookies
  useFirebaseTokenManager(user);

  // Funkcja synchronizacji użytkownika z bazą danych
  const syncUserWithDatabase = async (firebaseUser: User) => {
    // Zapobiegaj równoczesnym wywołaniom
    if (syncInProgress.current) {
      console.log('AuthContext: Sync already in progress, skipping');
      return;
    }

    // Zapobiegaj synchronizacji tego samego użytkownika wielokrotnie
    if (lastSyncedUid.current === firebaseUser.uid) {
      console.log('AuthContext: User already synced, skipping');
      return;
    }

    syncInProgress.current = true;

    try {
      console.log('AuthContext: Syncing user with database:', firebaseUser.email);

      const token = await firebaseUser.getIdToken();

      // Pobierz imię i nazwisko z displayName
      const displayNameParts = firebaseUser.displayName?.split(' ') || [];
      const firstName = displayNameParts[0] || '';
      const lastName = displayNameParts.slice(1).join(' ') || '';

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      if (response.ok) {
        console.log('AuthContext: User synced successfully');
        lastSyncedUid.current = firebaseUser.uid;
      } else {
        console.error('AuthContext: Sync failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('AuthContext: Error syncing user:', error);
    } finally {
      syncInProgress.current = false;
    }
  };

  useEffect(() => {
    // console.log('AuthContext: Setting up onAuthStateChanged listener')
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // console.log('Auth state changed:', firebaseUser ? `User logged in: ${firebaseUser.email}` : 'User logged out')

      if (firebaseUser) {
        setUser(firebaseUser);
        setIsEmailVerified(firebaseUser.emailVerified);

        // Synchronizuj użytkownika z bazą danych tylko jeśli jest nowy lub zmienił się
        await syncUserWithDatabase(firebaseUser);
      } else {
        setUser(null);
        setIsEmailVerified(false);
        lastSyncedUid.current = null; // Reset przy wylogowaniu
      }
      setLoading(false);
    });

    return () => {
      // console.log('AuthContext: Cleaning up onAuthStateChanged listener')
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // setUser(null) zostanie wywołane automatycznie przez listener onAuthStateChanged
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        // Odśwież użytkownika w Firebase
        await auth.currentUser.reload();

        // Pobierz zaktualizowane dane
        const updatedUser = auth.currentUser;

        // Zaktualizuj stan lokalny
        setUser(updatedUser);
        setIsEmailVerified(updatedUser.emailVerified);

        // Synchronizuj z bazą danych jeśli potrzebne
        await syncUserWithDatabase(updatedUser);

        console.log('AuthContext: User refreshed successfully');
      } catch (error) {
        console.error('AuthContext: Error refreshing user:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    isEmailVerified,
    signOut: handleSignOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
