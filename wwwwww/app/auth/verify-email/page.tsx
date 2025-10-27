'use client'

import { UnifiedLayout } from '@/components/layout/UnifiedLayout'
import { UnifiedButton } from '@/components/ui/UnifiedButton'
import { auth } from '@/lib/firebase'
import { applyActionCode, sendEmailVerification } from 'firebase/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode')

      if (!oobCode) {
        setStatus('error')
        setMessage('Brak kodu weryfikacji w URL')
        return
      }

      try {
        await applyActionCode(auth, oobCode)
        setStatus('success')
        setMessage('Email został zweryfikowany pomyślnie! Możesz teraz korzystać z pełnej funkcjonalności aplikacji.')

        // Przekieruj do dashboard po 3 sekundach
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } catch (error: any) {
        console.error('Błąd weryfikacji email:', error)
        setStatus('error')
        setMessage('Wystąpił błąd podczas weryfikacji email. Kod może być nieprawidłowy lub wygasł.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      setStatus('error')
      setMessage('Nie jesteś zalogowany')
      return
    }

    setResendLoading(true)
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: false
      }

      await sendEmailVerification(auth.currentUser, actionCodeSettings)
      setStatus('resend')
      setMessage('Nowy email weryfikacyjny został wysłany. Sprawdź swoją skrzynkę odbiorczą.')
    } catch (error: any) {
      console.error('Błąd wysyłania email weryfikacyjnego:', error)
      setStatus('error')

      switch (error.code) {
        case 'auth/too-many-requests':
          setMessage('Zbyt wiele próśb o weryfikację. Spróbuj ponownie za chwilę.')
          break
        case 'auth/requires-recent-login':
          setMessage('Wymagane jest ponowne zalogowanie. Zaloguj się ponownie.')
          break
        default:
          setMessage('Wystąpił błąd podczas wysyłania email weryfikacyjnego.')
      }
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <UnifiedLayout>
      <div className="min-h-screen pt-20 pl-80 pr-8 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="text-center">
              {status === 'loading' && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <h1 className="text-2xl font-bold text-white mb-4">Weryfikacja email</h1>
                  <p className="text-white/70">Trwa weryfikacja Twojego adresu email...</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-4">Email zweryfikowany!</h1>
                  <p className="text-white/70 mb-6">{message}</p>
                  <p className="text-white/60 text-sm">Za chwilę zostaniesz przekierowany do panelu użytkownika...</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-4">Błąd weryfikacji</h1>
                  <p className="text-white/70 mb-6">{message}</p>
                  <div className="space-y-3">
                    <UnifiedButton
                      variant="primary"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="w-full"
                    >
                      {resendLoading ? 'Wysyłanie...' : 'Wyślij nowy email weryfikacyjny'}
                    </UnifiedButton>
                    <UnifiedButton
                      variant="outline"
                      onClick={() => router.push('/auth/signin')}
                      className="w-full"
                    >
                      Powrót do logowania
                    </UnifiedButton>
                  </div>
                </>
              )}

              {status === 'resend' && (
                <>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-4">Email wysłany!</h1>
                  <p className="text-white/70 mb-6">{message}</p>
                  <UnifiedButton
                    variant="primary"
                    onClick={() => router.push('/auth/signin')}
                    className="w-full"
                  >
                    Powrót do logowania
                  </UnifiedButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  )
}
