// Firebase Admin SDK - tylko dla serwera
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminAuth: ReturnType<typeof getAuth> | null = null;
let app: ReturnType<typeof initializeApp> | null = null;

// Sprawdź czy wszystkie wymagane zmienne środowiskowe są ustawione
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log('🔧 Firebase Admin SDK initialization check:');
console.log('- FIREBASE_PROJECT_ID:', projectId ? 'SET' : 'NOT SET');
console.log('- FIREBASE_CLIENT_EMAIL:', clientEmail ? 'SET' : 'NOT SET');
console.log('- FIREBASE_PRIVATE_KEY:', privateKey ? 'SET' : 'NOT SET');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Firebase Admin SDK credentials not configured!');
  console.error(
    'Required environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
  );
  console.error('Aplikacja nie będzie działać bez konfiguracji Firebase!');
} else {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    };

    console.log('🔧 Initializing Firebase Admin SDK...');

    // Initialize Firebase Admin
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    adminAuth = getAuth(app);
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Funkcje pomocnicze do bezpiecznego dostępu
export function getAdminAuth() {
  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  return adminAuth;
}

export function getAdminApp() {
  if (!app) {
    throw new Error('Firebase Admin App not initialized');
  }
  return app;
}

export { adminAuth, app };
