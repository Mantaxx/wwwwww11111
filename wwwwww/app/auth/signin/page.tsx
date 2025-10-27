'use client'

import FirebaseAuthForm from '@/components/auth/FirebaseAuthForm'
import { UnifiedLayout } from '@/components/layout/UnifiedLayout'
import ClientProviders from '@/components/providers/ClientProviders' // Import ClientProviders
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Komponent wewnętrzny, który ma dostęp do kontekstu
function SignInContent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  console.log('SignInPage render - user:', user, 'loading:', loading)

  useEffect(() => {
    console.log('SignInPage useEffect - user:', user, 'loading:', loading)
    if (!loading && user) {
      console.log('Użytkownik już zalogowany, przekierowuję do dashboard...')
      // Używamy router.push dla bezpieczniejszej nawigacji po stronie klienta
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Ładowanie...</p>
        </div>
      </div>
    )
  }

  // Jeśli użytkownik jest zalogowany, nie renderuj niczego, ponieważ przekierowanie jest w toku.
  if (user) {
    return null
  }

  // Jeśli nie ma użytkownika i ładowanie jest zakończone, pokaż formularz
  return <FirebaseAuthForm />
}

// Główny komponent strony, który opakowuje zawartość w ClientProviders
export default function SignInPage() {
  return (
    <UnifiedLayout>
      <ClientProviders>
        <SignInContent />
      </ClientProviders>
    </UnifiedLayout>
  )
}
