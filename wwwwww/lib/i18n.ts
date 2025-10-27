import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  pl: {
    translation: {
      // Common
      'common.save': 'Zapisz',
      'common.cancel': 'Anuluj',
      'common.delete': 'Usuń',
      'common.edit': 'Edytuj',
      'common.add': 'Dodaj',
      'common.search': 'Szukaj',
      'common.filter': 'Filtruj',
      'common.sort': 'Sortuj',
      'common.loading': 'Ładowanie...',
      'common.error': 'Błąd',
      'common.success': 'Sukces',
      'common.confirm': 'Potwierdź',
      'common.back': 'Wstecz',
      'common.next': 'Dalej',
      'common.previous': 'Poprzedni',
      'common.close': 'Zamknij',
      'common.open': 'Otwórz',

      // Navigation
      'nav.home': 'Strona główna',
      'nav.auctions': 'Aukcje',
      'nav.sell': 'Sprzedaj',
      'nav.messages': 'Wiadomości',
      'nav.profile': 'Profil',
      'nav.settings': 'Ustawienia',
      'nav.logout': 'Wyloguj',

      // Auth
      'auth.signin': 'Zaloguj się',
      'auth.signup': 'Zarejestruj się',
      'auth.signout': 'Wyloguj się',
      'auth.email': 'Email',
      'auth.password': 'Hasło',
      'auth.confirmPassword': 'Potwierdź hasło',
      'auth.forgotPassword': 'Zapomniałeś hasła?',
      'auth.resetPassword': 'Resetuj hasło',
      'auth.noAccount': 'Nie masz konta?',
      'auth.hasAccount': 'Masz już konto?',
      'auth.signinWith': 'Zaloguj się przez {{provider}}',
      'auth.signupWith': 'Zarejestruj się przez {{provider}}',

      // Auctions
      'auction.title': 'Tytuł',
      'auction.description': 'Opis',
      'auction.category': 'Kategoria',
      'auction.price': 'Cena',
      'auction.currentPrice': 'Aktualna cena',
      'auction.startingPrice': 'Cena wywoławcza',
      'auction.buyNowPrice': 'Kup teraz',
      'auction.reservePrice': 'Cena minimalna',
      'auction.bids': 'Oferty',
      'auction.watchers': 'Obserwujący',
      'auction.timeLeft': 'Pozostały czas',
      'auction.endsAt': 'Kończy się',
      'auction.seller': 'Sprzedawca',
      'auction.status': 'Status',
      'auction.active': 'Aktywna',
      'auction.ended': 'Zakończona',
      'auction.cancelled': 'Anulowana',

      // Forms
      'form.required': 'Pole wymagane',
      'form.invalidEmail': 'Nieprawidłowy adres email',
      'form.invalidPassword': 'Hasło musi mieć co najmniej 8 znaków',
      'form.passwordMismatch': 'Hasła nie są identyczne',
      'form.invalidPhone': 'Nieprawidłowy numer telefonu',

      // Messages
      'message.send': 'Wyślij wiadomość',
      'message.sent': 'Wiadomość wysłana',
      'message.new': 'Nowa wiadomość',
      'message.conversation': 'Rozmowa',

      // Errors
      'error.network': 'Błąd połączenia',
      'error.server': 'Błąd serwera',
      'error.notFound': 'Nie znaleziono',
      'error.forbidden': 'Brak dostępu',
      'error.unauthorized': 'Nieautoryzowany',
      'error.validation': 'Błąd walidacji',

      // Success
      'success.saved': 'Zapisano pomyślnie',
      'success.deleted': 'Usunięto pomyślnie',
      'success.updated': 'Zaktualizowano pomyślnie',

      // PWA
      'pwa.install': 'Zainstaluj aplikację',
      'pwa.offline': 'Jesteś offline',
      'pwa.online': 'Połączenie przywrócone',
    },
  },
  en: {
    translation: {
      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.confirm': 'Confirm',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.close': 'Close',
      'common.open': 'Open',

      // Navigation
      'nav.home': 'Home',
      'nav.auctions': 'Auctions',
      'nav.sell': 'Sell',
      'nav.messages': 'Messages',
      'nav.profile': 'Profile',
      'nav.settings': 'Settings',
      'nav.logout': 'Logout',

      // Auth
      'auth.signin': 'Sign In',
      'auth.signup': 'Sign Up',
      'auth.signout': 'Sign Out',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.resetPassword': 'Reset Password',
      'auth.noAccount': "Don't have an account?",
      'auth.hasAccount': 'Already have an account?',
      'auth.signinWith': 'Sign in with {{provider}}',
      'auth.signupWith': 'Sign up with {{provider}}',

      // Auctions
      'auction.title': 'Title',
      'auction.description': 'Description',
      'auction.category': 'Category',
      'auction.price': 'Price',
      'auction.currentPrice': 'Current Price',
      'auction.startingPrice': 'Starting Price',
      'auction.buyNowPrice': 'Buy Now Price',
      'auction.reservePrice': 'Reserve Price',
      'auction.bids': 'Bids',
      'auction.watchers': 'Watchers',
      'auction.timeLeft': 'Time Left',
      'auction.endsAt': 'Ends At',
      'auction.seller': 'Seller',
      'auction.status': 'Status',
      'auction.active': 'Active',
      'auction.ended': 'Ended',
      'auction.cancelled': 'Cancelled',

      // Forms
      'form.required': 'Required field',
      'form.invalidEmail': 'Invalid email address',
      'form.invalidPassword': 'Password must be at least 8 characters',
      'form.passwordMismatch': 'Passwords do not match',
      'form.invalidPhone': 'Invalid phone number',

      // Messages
      'message.send': 'Send Message',
      'message.sent': 'Message Sent',
      'message.new': 'New Message',
      'message.conversation': 'Conversation',

      // Errors
      'error.network': 'Network Error',
      'error.server': 'Server Error',
      'error.notFound': 'Not Found',
      'error.forbidden': 'Forbidden',
      'error.unauthorized': 'Unauthorized',
      'error.validation': 'Validation Error',

      // Success
      'success.saved': 'Saved Successfully',
      'success.deleted': 'Deleted Successfully',
      'success.updated': 'Updated Successfully',

      // PWA
      'pwa.install': 'Install App',
      'pwa.offline': 'You are offline',
      'pwa.online': 'Connection restored',
    },
  },
};

const i18n = createInstance({
  resources,
  lng: 'pl', // default language
  fallbackLng: 'pl',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false,
  },
});

i18n.use(initReactI18next).init();

export default i18n;

// Helper functions
export const getCurrentLanguage = () => i18n.language;

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('language', lng);
};

export const getSupportedLanguages = () => [
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

// Initialize language from localStorage
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && i18n.options.resources?.[savedLanguage]) {
    i18n.changeLanguage(savedLanguage);
  }
}
