'use client';

import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { useAuth } from '@/contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  Camera,
  CheckCircle,
  Edit3,
  Gavel,
  Key,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  Star,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function UserDashboard() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Polska',
  });
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [userStatus, setUserStatus] = useState<{
    emailVerified?: boolean;
    hasFullAccess?: boolean;
    hasCompleteAccess?: boolean;
    isLoading?: boolean;
  }>({});

  console.log('UserDashboard render - user:', user, 'activeTab:', activeTab);

  // Pobierz status użytkownika
  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserStatus(data.user);
        }
      } catch (error) {
        console.error('Błąd pobierania statusu użytkownika:', error);
      }
    };

    if (user) {
      fetchUserStatus();
    }
  }, [user]);

  const tabs = useMemo(
    () => [
      { id: 'profile', label: 'Profil', icon: User, requiresVerification: false },
      { id: 'auctions', label: 'Moje aukcje', icon: Gavel, requiresVerification: true },
      { id: 'messages', label: 'Wiadomości', icon: MessageSquare, requiresVerification: false },
      { id: 'achievements', label: 'Osiągnięcia', icon: Trophy, requiresVerification: false },
      { id: 'references', label: 'Referencje', icon: Star, requiresVerification: false },
      { id: 'meetings', label: 'Spotkania', icon: Users, requiresVerification: false },
      { id: 'security', label: 'Bezpieczeństwo', icon: Shield, requiresVerification: false },
      { id: 'notifications', label: 'Powiadomienia', icon: Bell, requiresVerification: false },
      { id: 'settings', label: 'Ustawienia', icon: Settings, requiresVerification: false },
    ],
    []
  );

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsProfileComplete(data.user.isProfileVerified);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania profilu:', error);
    }
  }, [user]);

  // Obsługa parametru tab z URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, tabs]);

  // Inicjalizacja danych profilu
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        address: 'ul. Marszałkowska 1', // Przykładowy adres
        city: 'Warszawa', // Przykładowe miasto
        postalCode: '00-001', // Przykładowy kod
        country: 'Polska',
      });
      console.log('Zainicjalizowano dane profilu:', user);

      // Pobierz dane profilu z bazy danych
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  if (!user) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Nie jesteś zalogowany</h1>
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Sprawdź czy użytkownik ma pełny dostęp
  if (!userStatus.hasFullAccess) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-2xl mx-auto bg-white/20 backdrop-blur-md rounded-xl p-6 border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:border-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300">
            <div className="mb-6">
              <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-4">Wymagana weryfikacja konta</h1>
              <p className="text-white/70 mb-6">
                Sprawdź swoją skrzynkę email i kliknij link aktywacyjny, aby uzyskać pełny dostęp do
                konta użytkownika.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                <div className="flex items-center gap-2 text-yellow-300 text-sm mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold">Sprawdź email</span>
                </div>
                <p className="text-white/70 text-sm">
                  Link aktywacyjny został wysłany na adres:{' '}
                  <strong className="text-white">{user.email}</strong>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const fetchUserStatusAgain = async () => {
                      if (!user) return;
                      try {
                        const token = await user.getIdToken();
                        const response = await fetch('/api/auth/sync', {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        });
                        if (response.ok) {
                          const data = await response.json();
                          setUserStatus(data.user);
                        }
                      } catch (error) {
                        console.error('Błąd pobierania statusu użytkownika:', error);
                      }
                    };
                    fetchUserStatusAgain();
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                >
                  Sprawdź ponownie
                </button>
                <Link
                  href="/auth/signin"
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                >
                  Zaloguj się ponownie
                </Link>
              </div>
            </div>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Panel Użytkownika</h1>
        <p className="text-white/70">Zarządzaj swoim kontem i ustawieniami</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            {/* User Info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {user.displayName || 'Użytkownik'}
              </h2>
              <p className="text-white/70 text-sm">{user.email}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Aktywne</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isDisabled = tab.requiresVerification && !isProfileComplete;
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : isDisabled
                          ? 'text-white/30 cursor-not-allowed opacity-50'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    title={
                      isDisabled
                        ? 'Wymaga uzupełnienia profilu i weryfikacji telefonu przez SMS'
                        : ''
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {isDisabled && <Shield className="w-3 h-3 ml-auto text-yellow-400" />}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Wyloguj się</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Informacje o profilu</h3>
                  <button
                    onClick={() => {
                      console.log('Kliknięto edytuj profil, aktualny stan:', isEditingProfile);
                      console.log('Aktualne dane profilu:', profileData);
                      setIsEditingProfile(!isEditingProfile);
                      console.log('Nowy stan edycji:', !isEditingProfile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditingProfile ? 'Anuluj' : 'Edytuj profil'}</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Podstawowe informacje */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-white/70 text-sm">Imię i nazwisko</label>
                      {isEditingProfile ? (
                        <select
                          value={profileData.displayName}
                          onChange={e =>
                            setProfileData({ ...profileData, displayName: e.target.value })
                          }
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Wybierz imię i nazwisko"
                        >
                          <option value="">Wybierz imię i nazwisko</option>
                          <option value="Jan Kowalski">Jan Kowalski</option>
                          <option value="Anna Nowak">Anna Nowak</option>
                          <option value="Piotr Wiśniewski">Piotr Wiśniewski</option>
                          <option value="Maria Kowalczyk">Maria Kowalczyk</option>
                          <option value="Tomasz Zieliński">Tomasz Zieliński</option>
                          <option value="Katarzyna Szymańska">Katarzyna Szymańska</option>
                          <option value="Marcin Lewandowski">Marcin Lewandowski</option>
                          <option value="Agnieszka Dąbrowska">Agnieszka Dąbrowska</option>
                          <option value="Paweł Kamiński">Paweł Kamiński</option>
                          <option value="Magdalena Kozłowska">Magdalena Kozłowska</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-3 p-3 card">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-white">
                            {profileData.displayName || 'Nie ustawiono'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/70 text-sm">Email</label>
                      <div className="flex items-center gap-3 p-3 card">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-white">{user.email}</span>
                        {user.emailVerified ? (
                          <div title="Email zweryfikowany" className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-xs">Zweryfikowany</span>
                          </div>
                        ) : (
                          <div title="Email niezweryfikowany" className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 text-xs">Niezweryfikowany</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Numer telefonu */}
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Numer telefonu</label>
                    <div className="flex items-center gap-3">
                      {isEditingProfile ? (
                        <select
                          value={profileData.phoneNumber}
                          onChange={e =>
                            setProfileData({ ...profileData, phoneNumber: e.target.value })
                          }
                          className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Wybierz numer telefonu"
                        >
                          <option value="">Wybierz numer telefonu</option>
                          <option value="+48 123 456 789">+48 123 456 789</option>
                          <option value="+48 234 567 890">+48 234 567 890</option>
                          <option value="+48 345 678 901">+48 345 678 901</option>
                          <option value="+48 456 789 012">+48 456 789 012</option>
                          <option value="+48 567 890 123">+48 567 890 123</option>
                          <option value="+48 678 901 234">+48 678 901 234</option>
                          <option value="+48 789 012 345">+48 789 012 345</option>
                          <option value="+48 890 123 456">+48 890 123 456</option>
                          <option value="+48 901 234 567">+48 901 234 567</option>
                          <option value="+48 012 345 678">+48 012 345 678</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-3 p-3 card flex-1">
                          <Phone className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            {profileData.phoneNumber || 'Nie ustawiono'}
                          </span>
                        </div>
                      )}
                      {profileData.phoneNumber && (
                        <button
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                          title="Zweryfikuj numer telefonu"
                          onClick={() => {
                            // Tutaj będzie logika weryfikacji SMS
                            console.log(
                              'Rozpocznij weryfikację SMS dla numeru:',
                              profileData.phoneNumber
                            );
                          }}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Adres zamieszkania */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Adres zamieszkania</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Ulica i numer</label>
                        {isEditingProfile ? (
                          <AddressAutocomplete
                            value={profileData.address}
                            onChange={value => setProfileData({ ...profileData, address: value })}
                            placeholder="Wpisz nazwę ulicy..."
                            type="street"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 card">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">
                              {profileData.address || 'Nie ustawiono'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Miasto</label>
                        {isEditingProfile ? (
                          <AddressAutocomplete
                            value={profileData.city}
                            onChange={value => setProfileData({ ...profileData, city: value })}
                            placeholder="Wpisz nazwę miasta..."
                            type="city"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 card">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">
                              {profileData.city || 'Nie ustawiono'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Kod pocztowy</label>
                        {isEditingProfile ? (
                          <select
                            value={profileData.postalCode}
                            onChange={e =>
                              setProfileData({ ...profileData, postalCode: e.target.value })
                            }
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Wybierz kod pocztowy"
                          >
                            <option value="">Wybierz kod pocztowy</option>
                            <option value="00-001">00-001</option>
                            <option value="00-002">00-002</option>
                            <option value="00-003">00-003</option>
                            <option value="00-004">00-004</option>
                            <option value="00-005">00-005</option>
                            <option value="01-001">01-001</option>
                            <option value="01-002">01-002</option>
                            <option value="01-003">01-003</option>
                            <option value="01-004">01-004</option>
                            <option value="01-005">01-005</option>
                            <option value="02-001">02-001</option>
                            <option value="02-002">02-002</option>
                            <option value="02-003">02-003</option>
                            <option value="02-004">02-004</option>
                            <option value="02-005">02-005</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-3 p-3 card">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">
                              {profileData.postalCode || 'Nie ustawiono'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Kraj</label>
                        {isEditingProfile ? (
                          <select
                            value={profileData.country}
                            onChange={e =>
                              setProfileData({ ...profileData, country: e.target.value })
                            }
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Wybierz kraj"
                          >
                            <option value="Polska">Polska</option>
                            <option value="Niemcy">Niemcy</option>
                            <option value="Czechy">Czechy</option>
                            <option value="Słowacja">Słowacja</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-3 p-3 card">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{profileData.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informacje o koncie */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Informacje o koncie</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Data utworzenia konta</label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span className="text-white">
                            {user.metadata?.creationTime
                              ? new Date(user.metadata.creationTime).toLocaleDateString('pl-PL')
                              : 'Nieznana'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/70 text-sm">Ostatnie logowanie</label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span className="text-white">
                            {user.metadata?.lastSignInTime
                              ? new Date(user.metadata.lastSignInTime).toLocaleDateString('pl-PL')
                              : 'Nieznane'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Przyciski akcji */}
                {isEditingProfile && (
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => {
                        // Tutaj będzie logika zapisywania
                        console.log('Zapisywanie profilu:', profileData);
                        setIsEditingProfile(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Zapisz zmiany</span>
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                    >
                      <span>Anuluj</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'auctions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {userStatus.hasCompleteAccess ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-6">Moje aukcje</h3>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 card">
                          <div className="flex items-center gap-3">
                            <Gavel className="w-5 h-5 text-blue-400" />
                            <div>
                              <h4 className="text-white font-semibold">Aktywne aukcje</h4>
                              <p className="text-white/70 text-sm">0 aukcji</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 card">
                          <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-green-400" />
                            <div>
                              <h4 className="text-white font-semibold">Wygrane</h4>
                              <p className="text-white/70 text-sm">0 aukcji</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 card">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            <div>
                              <h4 className="text-white font-semibold">Sprzedane</h4>
                              <p className="text-white/70 text-sm">0 aukcji</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Link
                          href="/auctions"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                        >
                          <Search className="w-4 h-4" />
                          <span>Przeglądaj aukcje</span>
                        </Link>
                        <Link
                          href="/seller/create-auction"
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Utwórz aukcję</span>
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">Dostęp ograniczony</h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                      Aby uzyskać dostęp do aukcji, musisz uzupełnić swój profil i zweryfikować
                      numer telefonu przez SMS.
                    </p>
                    <Link
                      href="?tab=profile"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span>Uzupełnij profil i zweryfikuj telefon</span>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Wiadomości</h3>

                <div className="space-y-6">
                  <div className="p-4 card">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-semibold">Skrzynka odbiorcza</h4>
                        <p className="text-white/70 text-sm">Komunikuj się z innymi hodowcami</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">Brak nowych wiadomości</h4>
                          <p className="text-white/70 text-sm">Sprawdź ponownie później</p>
                        </div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/messages"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Otwórz wiadomości</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Osiągnięcia</h3>

                <div className="space-y-6">
                  <div className="p-4 card">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h4 className="text-white font-semibold">Twoje osiągnięcia</h4>
                        <p className="text-white/70 text-sm">Zbieraj odznaki i osiągnięcia</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 card">
                      <div className="flex items-center gap-3 mb-3">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-white font-semibold">Pierwsza aukcja</h4>
                      </div>
                      <p className="text-white/70 text-sm">Utwórz swoją pierwszą aukcję</p>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full w-0"></div>
                      </div>
                    </div>

                    <div className="p-4 card">
                      <div className="flex items-center gap-3 mb-3">
                        <Star className="w-5 h-5 text-blue-400" />
                        <h4 className="text-white font-semibold">Aktywny hodowca</h4>
                      </div>
                      <p className="text-white/70 text-sm">Bądź aktywny przez 30 dni</p>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full w-[15%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/achievements"
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Zobacz wszystkie</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'references' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Referencje</h3>

                <div className="space-y-6">
                  <div className="p-4 card">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-green-400" />
                      <div>
                        <h4 className="text-white font-semibold">Twoje referencje</h4>
                        <p className="text-white/70 text-sm">Zobacz opinie innych hodowców</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">Brak referencji</h4>
                          <p className="text-white/70 text-sm">
                            Zacznij handlować, aby otrzymać pierwsze opinie
                          </p>
                        </div>
                        <div className="text-yellow-400 text-sm">0/5</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/references"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Star className="w-4 h-4" />
                      <span>Zobacz referencje</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'meetings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Spotkania hodowców</h3>

                <div className="space-y-6">
                  <div className="p-4 card">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-white font-semibold">Spotkania i wydarzenia</h4>
                        <p className="text-white/70 text-sm">Dołącz do społeczności hodowców</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">Brak nadchodzących spotkań</h4>
                          <p className="text-white/70 text-sm">Sprawdź ponownie później</p>
                        </div>
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/breeder-meetings"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Users className="w-4 h-4" />
                      <span>Zobacz spotkania</span>
                    </Link>
                    <Link
                      href="/breeder-meetings/dodaj-zdjecie"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Dodaj zdjęcie</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Bezpieczeństwo</h3>

                {showChangePassword ? (
                  <ChangePasswordForm
                    onSuccess={() => setShowChangePassword(false)}
                    onCancel={() => setShowChangePassword(false)}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 card">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-white font-semibold">Konto zabezpieczone</h4>
                          <p className="text-white/70 text-sm">
                            Twoje konto jest chronione przez Firebase Authentication
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 card">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <div>
                            <h4 className="text-white font-semibold">Weryfikacja email</h4>
                            <p className="text-white/70 text-sm">
                              {user.emailVerified
                                ? 'Email zweryfikowany'
                                : 'Email niezweryfikowany'}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs ${
                            user.emailVerified
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {user.emailVerified ? 'Zweryfikowany' : 'Niezweryfikowany'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 card">
                        <div className="flex items-center gap-3">
                          <Key className="w-4 h-4 text-purple-400" />
                          <div>
                            <h4 className="text-white font-semibold">Hasło</h4>
                            <p className="text-white/70 text-sm">Zarządzaj swoim hasłem</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                        >
                          Zmień hasło
                        </button>
                      </div>

                      {!user.emailVerified && (
                        <div className="flex items-center justify-between p-4 card">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-yellow-400" />
                            <div>
                              <h4 className="text-white font-semibold">Weryfikacja email</h4>
                              <p className="text-white/70 text-sm">
                                Wyślij ponownie email weryfikacyjny
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await sendEmailVerification(user);
                                alert('Email weryfikacyjny został wysłany ponownie!');
                              } catch (error) {
                                console.error('Błąd wysyłania email:', error);
                                alert('Wystąpił błąd podczas wysyłania email. Spróbuj ponownie.');
                              }
                            }}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-300"
                          >
                            Wyślij ponownie
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Powiadomienia</h3>

                <div className="space-y-4">
                  <div className="p-4 card">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-semibold">Powiadomienia email</h4>
                        <p className="text-white/70 text-sm">
                          Otrzymuj powiadomienia o nowych aukcjach i aktualizacjach
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 card">
                      <span className="text-white">Nowe aukcje</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        defaultChecked
                        aria-label="Włącz powiadomienia o nowych aukcjach"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 card">
                      <span className="text-white">Aktualizacje konta</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        defaultChecked
                        aria-label="Włącz powiadomienia o aktualizacjach konta"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 card">
                      <span className="text-white">Powiadomienia SMS</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        aria-label="Włącz powiadomienia SMS"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Ustawienia</h3>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 card">
                      <div>
                        <h4 className="text-white font-semibold">Język</h4>
                        <p className="text-white/70 text-sm">Wybierz język interfejsu</p>
                      </div>
                      <select
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        aria-label="Wybierz język interfejsu"
                      >
                        <option value="pl">Polski</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 card">
                      <div>
                        <h4 className="text-white font-semibold">Motyw</h4>
                        <p className="text-white/70 text-sm">Wybierz motyw aplikacji</p>
                      </div>
                      <select
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        aria-label="Wybierz motyw aplikacji"
                      >
                        <option value="dark">Ciemny</option>
                        <option value="light">Jasny</option>
                        <option value="auto">Automatyczny</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 card">
                      <div>
                        <h4 className="text-white font-semibold">Tryb deweloperski</h4>
                        <p className="text-white/70 text-sm">
                          Włącz dodatkowe informacje debugowania
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle"
                        aria-label="Włącz tryb deweloperski"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300">
                      Zapisz ustawienia
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
