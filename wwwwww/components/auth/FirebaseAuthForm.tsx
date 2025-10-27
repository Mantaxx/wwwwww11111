'use client'

import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, FacebookAuthProvider, GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type AuthMode = 'signin' | 'signup'

export default function FirebaseAuthForm() {
    const [mode, setMode] = useState<AuthMode>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    // Usunięto stan phoneNumber - SMS służy tylko do autoryzacji już zarejestrowanych użytkowników
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [formErrors, setFormErrors] = useState<{email?: string, password?: string, confirmPassword?: string}>({})
    const router = useRouter()

    console.log('FirebaseAuthForm render - mode:', mode, 'isLoading:', isLoading)

    // Funkcja pomocnicza do synchronizacji i przekierowania
    const syncAndRedirect = async () => {
        try {
            // Pobierz token Firebase
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Brak zalogowanego użytkownika');
            }

            const token = await user.getIdToken();

            const response = await fetch('/api/auth/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Synchronizacja nie powiodła się');
            }

            const { user: syncedUser } = await response.json();

            // Sprawdź czy email jest zweryfikowany
            if (!user.emailVerified) {
                setError('Musisz zweryfikować swój email przed dostępem do panelu użytkownika. Sprawdź skrzynkę odbiorczą.');
                await signOut(auth);
                return;
            }

            // Jeśli email jest zweryfikowany, przekieruj do dashboardu
            console.log('Email zweryfikowany, przekierowuję do /dashboard...');
            router.push('/dashboard');
        } catch (error) {
            console.error('Błąd synchronizacji i przekierowania:', error);
            setError('Wystąpił błąd po zalogowaniu. Spróbuj ponownie.');
            await signOut(auth);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()

        // Reset form errors
        setFormErrors({})
        let hasErrors = false

        // Walidacja email
        if (!email.trim()) {
            setFormErrors(prev => ({ ...prev, email: 'Email jest wymagany' }))
            hasErrors = true
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormErrors(prev => ({ ...prev, email: 'Nieprawidłowy format email' }))
            hasErrors = true
        }

        // Walidacja hasła
        if (!password.trim()) {
            setFormErrors(prev => ({ ...prev, password: 'Hasło jest wymagane' }))
            hasErrors = true
        }

        if (hasErrors) {
            return
        }

        setIsLoading(true)
        setError('')

        try {
            // Ustaw persistence na podstawie opcji "Zapamiętaj mnie"
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
            await setPersistence(auth, persistence)

            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Sprawdź czy email jest zweryfikowany
            if (!user.emailVerified) {
                try {
                    const actionCodeSettings = {
                        url: `${window.location.origin}/auth/verify-email`,
                        handleCodeInApp: false
                    } as const
                    await sendEmailVerification(user, actionCodeSettings)
                    setSuccess('Wysłaliśmy ponownie email weryfikacyjny. Sprawdź skrzynkę (także SPAM).')
                } catch (emailError) {
                    console.error('Błąd ponownego wysłania email weryfikacyjnego:', emailError)
                }
                setError('Musisz zweryfikować swój email przed zalogowaniem. Sprawdź skrzynkę odbiorczą.')
                await signOut(auth)
                return
            }

            // Synchronizuj dane i przekieruj
            await syncAndRedirect();
        } catch (error: any) {
            console.error('Błąd logowania:', error)

            switch (error.code) {
                case 'auth/user-not-found':
                    setError('Nie znaleziono konta z tym adresem email')
                    break
                case 'auth/wrong-password':
                    setError('Nieprawidłowe hasło')
                    break
                case 'auth/invalid-email':
                    setFormErrors(prev => ({ ...prev, email: 'Nieprawidłowy format email' }))
                    break
                case 'auth/too-many-requests':
                    setError('Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut.')
                    break
                case 'auth/user-disabled':
                    setError('Konto zostało zablokowane. Skontaktuj się z administratorem.')
                    break
                case 'auth/network-request-failed':
                    setError('Błąd połączenia sieciowego. Sprawdź połączenie internetowe.')
                    break
                default:
                    setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError('')

        try {
            const provider = new GoogleAuthProvider()
            // Dodaj dodatkowe zakresy jeśli potrzebujesz
            provider.addScope('email')
            provider.addScope('profile')

            await signInWithPopup(auth, provider)
            // Synchronizuj dane i przekieruj
            await syncAndRedirect();
        } catch (error: any) {
            console.error('Błąd logowania przez Google:', error)

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    setError('Okno logowania zostało zamknięte')
                    break
                case 'auth/popup-blocked':
                    setError('Okno logowania zostało zablokowane przez przeglądarkę')
                    break
                case 'auth/cancelled-popup-request':
                    setError('Anulowano logowanie')
                    break
                case 'auth/account-exists-with-different-credential':
                    setError('Konto z tym emailem już istnieje z inną metodą logowania')
                    break
                case 'auth/unauthorized-domain':
                    setError('Domena nie jest autoryzowana w Firebase Console. Dodaj domenę 192.168.177.1 do autoryzowanych domen OAuth w ustawieniach projektu Firebase.')
                    break
                default:
                    setError(`Wystąpił błąd podczas logowania przez Google: ${error.message || error.code}`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleFacebookSignIn = async () => {
        setIsLoading(true)
        setError('')

        try {
            const provider = new FacebookAuthProvider()
            // Dodaj dodatkowe zakresy jeśli potrzebujesz
            provider.addScope('email')
            provider.addScope('public_profile')

            await signInWithPopup(auth, provider)

            // Użyj tej samej funkcji synchronizacji i przekierowania co inne metody
            await syncAndRedirect();
        } catch (error: any) {
            console.error('Błąd logowania przez Facebook:', error)

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    setError('Okno logowania zostało zamknięte')
                    break
                case 'auth/popup-blocked':
                    setError('Okno logowania zostało zablokowane przez przeglądarkę')
                    break
                case 'auth/cancelled-popup-request':
                    setError('Anulowano logowanie')
                    break
                case 'auth/account-exists-with-different-credential':
                    setError('Konto z tym emailem już istnieje z inną metodą logowania')
                    break
                case 'auth/facebook-auth-failed':
                    setError('Błąd autoryzacji Facebook')
                    break
                case 'auth/unauthorized-domain':
                    setError('Domena nie jest autoryzowana w Firebase Console. Dodaj domenę 192.168.177.1 do autoryzowanych domen OAuth w ustawieniach projektu Firebase.')
                    break
                default:
                    setError(`Wystąpił błąd podczas logowania przez Facebook: ${error.message || error.code}`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Usunięto funkcję handleSMSAuth - SMS służy tylko do autoryzacji już zarejestrowanych użytkowników

    // Usunięto funkcje handleSMSSuccess i handleSMSBack - SMS służy tylko do autoryzacji już zarejestrowanych użytkowników

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault()

        // Reset form errors
        setFormErrors({})
        let hasErrors = false

        // Walidacja email
        if (!email.trim()) {
            setFormErrors(prev => ({ ...prev, email: 'Email jest wymagany' }))
            hasErrors = true
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormErrors(prev => ({ ...prev, email: 'Nieprawidłowy format email' }))
            hasErrors = true
        }

        // Walidacja hasła
        if (!password.trim()) {
            setFormErrors(prev => ({ ...prev, password: 'Hasło jest wymagane' }))
            hasErrors = true
        } else if (password.length < 8) {
            setFormErrors(prev => ({ ...prev, password: 'Hasło musi mieć co najmniej 8 znaków' }))
            hasErrors = true
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            setFormErrors(prev => ({ ...prev, password: 'Hasło musi zawierać małe i wielkie litery oraz cyfry' }))
            hasErrors = true
        }

        // Walidacja potwierdzenia hasła
        if (!confirmPassword.trim()) {
            setFormErrors(prev => ({ ...prev, confirmPassword: 'Potwierdzenie hasła jest wymagane' }))
            hasErrors = true
        } else if (password !== confirmPassword) {
            setFormErrors(prev => ({ ...prev, confirmPassword: 'Hasła nie są identyczne' }))
            hasErrors = true
        }

        if (hasErrors) {
            return
        }

        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            // Utwórz konto Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Synchronizuj użytkownika z naszą bazą danych z retry logiką
            let syncAttempts = 0;
            const maxSyncAttempts = 3;

            while (syncAttempts < maxSyncAttempts) {
                try {
                    const token = await user.getIdToken();
                    
                    const syncResponse = await fetch('/api/auth/sync', {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json' 
                        }
                    });

                    if (syncResponse.ok) {
                        console.log('Synchronizacja użytkownika powiodła się');
                        break;
                    } else {
                        const errorData = await syncResponse.json();
                        throw new Error(errorData.error || `HTTP ${syncResponse.status}: ${syncResponse.statusText}`);
                    }
                } catch (syncError) {
                    syncAttempts++;
                    console.error(`Próba synchronizacji ${syncAttempts}/${maxSyncAttempts} nie powiodła się:`, syncError);

                    if (syncAttempts >= maxSyncAttempts) {
                        console.error('Wszystkie próby synchronizacji nie powiodły się, ale rejestracja Firebase się udała');
                        // Możemy kontynuować, ale powinniśmy ostrzec użytkownika
                        setError('Konto zostało utworzone, ale wystąpił problem z synchronizacją danych. Spróbuj się zalogować za chwilę.');
                        return;
                    }

                    // Czekaj przed kolejną próbą (wykładniczy backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, syncAttempts) * 1000));
                }
            }

            // Wyślij email weryfikacyjny
            try {
                const actionCodeSettings = {
                    url: `${window.location.origin}/auth/verify-email`,
                    handleCodeInApp: false
                }

                await sendEmailVerification(user, actionCodeSettings)
                console.log('✅ Email weryfikacyjny został wysłany na adres:', user.email)
                setSuccess('Konto zostało utworzone! Sprawdź email i kliknij link weryfikacyjny, aby aktywować konto.')
            } catch (emailError) {
                console.error('❌ Błąd wysyłania email weryfikacyjnego:', emailError)
                setError('Konto zostało utworzone, ale wystąpił problem z wysłaniem email weryfikacyjnego. Spróbuj wysłać go ponownie z panelu użytkownika.')
            }

            // Użytkownik pozostaje zalogowany, ale bez dostępu do panelu
            // Nie wylogowuj użytkownika - powinien pozostać zalogowany

        } catch (error: any) {
            console.error('Błąd rejestracji:', error)

            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('Konto z tym adresem email już istnieje')
                    break
                case 'auth/invalid-email':
                    setFormErrors(prev => ({ ...prev, email: 'Nieprawidłowy format email' }))
                    break
                case 'auth/weak-password':
                    setFormErrors(prev => ({ ...prev, password: 'Hasło jest za słabe - musi zawierać małe i wielkie litery oraz cyfry' }))
                    break
                case 'auth/network-request-failed':
                    setError('Błąd połączenia sieciowego. Sprawdź połączenie internetowe.')
                    break
                case 'auth/operation-not-allowed':
                    setError('Rejestracja przez email jest wyłączona. Skontaktuj się z administratorem.')
                    break
                default:
                    setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Usunięto obsługę trybu SMS - SMS służy tylko do autoryzacji już zarejestrowanych użytkowników

    return (
        <div className="min-h-screen flex items-start justify-center p-4 pt-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-lg"
            >
                <div className="card p-6">
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {mode === 'signin' ? 'Logowanie' : 'Rejestracja'}
                        </h1>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                                <p className="text-green-300 text-sm">{success}</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Google Sign In */}
                    <motion.button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-3 flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Logowanie...
                            </div>
                        ) : (
                            'Zaloguj się przez Google'
                        )}
                    </motion.button>

                    {/* Facebook Sign In */}
                    <motion.button
                        onClick={handleFacebookSignIn}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-[#1877F2] text-white font-semibold rounded-xl hover:bg-[#166FE5] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Logowanie...
                            </div>
                        ) : (
                            'Zaloguj się przez Facebook'
                        )}
                    </motion.button>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-white/70">lub</span>
                        </div>
                    </div>

                    <form onSubmit={mode === 'signin' ? handleEmailSignIn : mode === 'signup' ? handleEmailSignUp : undefined} className="space-y-4">
                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setError('')
                                    if (formErrors.email) {
                                        setFormErrors(prev => ({ ...prev, email: undefined }))
                                    }
                                }}
                                placeholder="Email"
                                className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                    formErrors.email ? 'border-red-500' : 'border-white/20'
                                }`}
                                disabled={isLoading}
                            />
                            {formErrors.email && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                            )}
                        </div>

                        {/* Hasło */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError('')
                                    if (formErrors.password) {
                                        setFormErrors(prev => ({ ...prev, password: undefined }))
                                    }
                                }}
                                placeholder="Hasło"
                                className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                    formErrors.password ? 'border-red-500' : 'border-white/20'
                                }`}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            {formErrors.password && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                            )}
                        </div>

                        {/* Potwierdzenie hasła - tylko dla rejestracji */}
                        {mode === 'signup' && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        setError('')
                                        if (formErrors.confirmPassword) {
                                            setFormErrors(prev => ({ ...prev, confirmPassword: undefined }))
                                        }
                                    }}
                                    placeholder="Potwierdź hasło"
                                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        formErrors.confirmPassword ? 'border-red-500' : 'border-white/20'
                                    }`}
                                />
                                {formErrors.confirmPassword && (
                                    <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
                                )}
                            </div>
                        )}

                        {/* Opcja "Zapamiętaj mnie" - tylko dla logowania */}
                        {mode === 'signin' && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="mr-2 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="text-white/70 text-sm">Zapamiętaj mnie</span>
                                </label>
                                <Link
                                    href="/auth/reset-password"
                                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                                >
                                    Zapomniałeś hasła?
                                </Link>
                            </div>
                        )}

                        {/* Usunięto pole numeru telefonu - SMS służy tylko do autoryzacji już zarejestrowanych użytkowników */}

                        {/* Przyciski */}
                        <div className="space-y-4">
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (mode === 'signup' ? 'Rejestracja...' : 'Logowanie...') : (mode === 'signup' ? 'Zarejestruj się' : 'Zaloguj się')}
                            </motion.button>

                            {/* Usunięto przycisk logowania przez SMS - SMS służy tylko do autoryzacji już zarejestrowanych użytkowników */}
                        </div>
                    </form>

                    <div className="mt-6 space-y-4 text-center">
                        <Link
                            href="/auth/reset-password"
                            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                        >
                            Zapomniałeś hasła?
                        </Link>

                        <div className="text-white/70 text-sm">
                            {mode === 'signin' ? (
                                <>
                                    Nie masz konta?{' '}
                                    <button
                                        onClick={() => setMode('signup')}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Zarejestruj się
                                    </button>
                                </>
                            ) : (
                                <>
                                    Masz już konto?{' '}
                                    <button
                                        onClick={() => setMode('signin')}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Zaloguj się
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
