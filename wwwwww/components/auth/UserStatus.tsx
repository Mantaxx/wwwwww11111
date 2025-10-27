'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Mail, Phone, Settings, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function UserStatus() {
  const { user, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  // console.log('UserStatus render:', { user: user?.email, loading })

  // Usuń długotrwały loader - jeśli loading trwa, pokaż po prostu ikonę logowania
  if (loading) {
    return (
      <Link href="/auth/signin" className="glass-nav-button" title="Konto">
        <i className="fas fa-user relative z-10 text-3xl"></i>
        <span className="relative z-10 text-sm">Konto</span>
      </Link>
    );
  }

  if (!user) {
    return (
      <Link href="/auth/signin" className="glass-nav-button" title="Konto">
        <i className="fas fa-user relative z-10 text-3xl"></i>
        <span className="relative z-10 text-sm">Konto</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="glass-nav-button"
        title="Panel Użytkownika"
      >
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                user?.emailVerified
                  ? 'bg-green-400'
                  : 'bg-yellow-400'
              }`}
            ></div>
            <i className="fas fa-user text-3xl"></i>
          </div>
          <span className="text-xs text-white/70">Zalogowany</span>
          <span className="text-sm font-medium">
            {user.displayName || user.email?.split('@')[0]}
          </span>
        </div>
      </button>

      {/* Menu użytkownika */}
      {showUserMenu && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl z-50">
          <div className="p-4">
            {/* Nagłówek */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{user.displayName || 'Użytkownik'}</h3>
                <p className="text-white/70 text-sm">{user.email}</p>
              </div>
            </div>

            {/* Status konta */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">Email:</span>
                <span className="text-white">{user.email}</span>
                {user.emailVerified && (
                  <div title="Email zweryfikowany">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                )}
              </div>

              {user.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-white/70">Telefon:</span>
                  <span className="text-white">{user.phoneNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    user?.emailVerified
                      ? 'bg-green-400'
                      : 'bg-yellow-400'
                  }`}
                ></div>
                <span className="text-white/70">Status:</span>
                <span
                  className={`${
                    user?.emailVerified
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {user?.emailVerified
                    ? 'Aktywny'
                    : 'Wymaga weryfikacji'}
                </span>
              </div>
            </div>

            {/* Akcje */}
            <div className="space-y-2">
              {user?.emailVerified ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 w-full px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <i className="fas fa-tachometer-alt w-4 h-4"></i>
                    <span>Panel Użytkownika</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=profile"
                    className="flex items-center gap-3 w-full px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Mój Profil</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=settings"
                    className="flex items-center gap-3 w-full px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Ustawienia</span>
                  </Link>
                </>
              ) : (
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-300 text-sm mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">Wymagana weryfikacja</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Sprawdź swoją skrzynkę email i kliknij link aktywacyjny, aby uzyskać pełny
                    dostęp do konta.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  signOut();
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Wyloguj się</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
