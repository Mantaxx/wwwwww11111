export const metadata = {
  title: 'Polityka Prywatności - Gołębie Pocztowe',
  description:
    'Polityka Prywatności Serwisu Aukcyjnego Gołębie Pocztowe - zasady przetwarzania i ochrony danych osobowych.',
};

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function PrivacyPage() {
  return (
    <UnifiedLayout>
      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Polityka Prywatności</h1>
            <p className="text-xl text-white">Polityka Prywatności Serwisu Gołębie Pocztowe</p>
            <p className="text-sm text-white/70 mt-2">
              Data wejścia w życie: {new Date().toLocaleDateString('pl-PL')}
            </p>
          </div>

          {/* Privacy Content */}
          <div
            className="rounded-lg border-2 border-white p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(2px)',
              boxShadow:
                '0 8px 32px rgba(255, 255, 255, 0.4), 0 16px 64px rgba(255, 255, 255, 0.2), 0 24px 96px rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="prose prose-lg max-w-none text-white/90">
              <h2 className="text-2xl font-bold text-white mb-4">§ 1. Postanowienia Ogólne</h2>
              <p className="mb-4">
                Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych
                osobowych Użytkowników Serwisu internetowego Gołębie Pocztowe, dostępnego pod
                adresem gołębiepocztowe.pl.
              </p>
              <p className="mb-4">
                Administratorem Danych Osobowych (dalej: &quot;Administrator&quot;) w rozumieniu
                Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016
                r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w
                sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)
                jest Pałka MTM, z siedzibą w Lubaniu, adres: ul. Stawowa 6, 59-800 Lubań, e-mail:
                kontakt@golebiepocztowe.pl.
              </p>
              <p className="mb-8">
                Dbamy o prywatność naszych Użytkowników i bezpieczeństwo ich danych. Dane
                przetwarzane są z zachowaniem wymogów bezpieczeństwa określonych w obowiązujących
                przepisach prawa.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">
                § 2. Cele, Podstawy Prawne i Zakres Przetwarzania Danych
              </h2>
              <p className="mb-4">
                Administrator przetwarza dane osobowe Użytkowników w następujących celach:
              </p>

              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    1. W celu świadczenia usług drogą elektroniczną (prowadzenie konta i obsługa
                    aukcji):
                  </h3>
                  <ul className="ml-6 space-y-2">
                    <li>
                      <strong>Zakres danych:</strong> Adres e-mail, login (nazwa użytkownika), hasło
                      (w formie zaszyfrowanej), historia licytacji i ofert. Opcjonalnie: imię i
                      nazwisko, numer telefonu, adres.
                    </li>
                    <li>
                      <strong>Podstawa prawna:</strong> Art. 6 ust. 1 lit. b RODO – niezbędność do
                      wykonania umowy o świadczenie usług drogą elektroniczną.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    2. W celu realizacji transakcji zawieranych między Użytkownikami:
                  </h3>
                  <ul className="ml-6 space-y-2">
                    <li>
                      <strong>Zakres danych:</strong> Imię i nazwisko, adres, numer telefonu, adres
                      e-mail Sprzedającego i Kupującego, który wygrał aukcję.
                    </li>
                    <li>
                      <strong>Podstawa prawna:</strong> Art. 6 ust. 1 lit. f RODO – prawnie
                      uzasadniony interes Administratora, polegający na umożliwieniu stronom
                      transakcji jej sfinalizowania.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    3. W celu wypełnienia obowiązków prawnych ciążących na Administratorze:
                  </h3>
                  <ul className="ml-6 space-y-2">
                    <li>
                      <strong>Zakres danych:</strong> Dane niezbędne do wystawienia faktur i
                      prowadzenia dokumentacji księgowej (jeśli dotyczy).
                    </li>
                    <li>
                      <strong>Podstawa prawna:</strong> Art. 6 ust. 1 lit. c RODO – niezbędność do
                      wypełnienia obowiązku prawnego (np. przepisy podatkowe).
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    4. W celach analitycznych i statystycznych:
                  </h3>
                  <ul className="ml-6 space-y-2">
                    <li>
                      <strong>Zakres danych:</strong> Adres IP, typ przeglądarki, system operacyjny,
                      dane o aktywności w Serwisie.
                    </li>
                    <li>
                      <strong>Podstawa prawna:</strong> Art. 6 ust. 1 lit. f RODO – prawnie
                      uzasadniony interes Administratora, polegający na poprawie funkcjonowania
                      Serwisu.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    5. W celu ewentualnego ustalenia, dochodzenia lub obrony przed roszczeniami:
                  </h3>
                  <ul className="ml-6 space-y-2">
                    <li>
                      <strong>Zakres danych:</strong> Wszelkie dane podane przez Użytkownika.
                    </li>
                    <li>
                      <strong>Podstawa prawna:</strong> Art. 6 ust. 1 lit. f RODO – prawnie
                      uzasadniony interes Administratora, polegający na ochronie jego praw.
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">§ 3. Odbiorcy Danych</h2>
              <p className="mb-4">
                Dane osobowe Użytkowników mogą być przekazywane podmiotom przetwarzającym dane na
                zlecenie Administratora, m.in.:
              </p>
              <ul className="space-y-2 mb-4">
                <li>Dostawcom usług hostingowych.</li>
                <li>Dostawcom usług IT i wsparcia technicznego.</li>
                <li>Firmom księgowym (jeśli dotyczy).</li>
                <li>Dostawcom narzędzi analitycznych (np. Google Analytics).</li>
              </ul>
              <div className="bg-white bg-opacity-10 border-l-4 border-slate-400 p-4 mb-4">
                <p className="text-sm text-white font-medium">
                  <strong>Kluczowe:</strong> W celu finalizacji transakcji, dane kontaktowe
                  Kupującego (imię, nazwisko, adres, e-mail, telefon) są udostępniane Sprzedającemu,
                  a dane Sprzedającego są udostępniane Kupującemu. Użytkownik, biorąc udział w
                  aukcji, wyraża na to zgodę, rozumiejąc, że jest to niezbędne do realizacji umowy
                  kupna-sprzedaży.
                </p>
              </div>
              <p className="mb-8">
                Dane mogą być również udostępnione organom publicznym na mocy obowiązujących
                przepisów prawa.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">
                § 4. Okres Przechowywania Danych
              </h2>
              <ul className="space-y-3 mb-8">
                <li>
                  Dane związane z kontem Użytkownika będą przechowywane przez cały okres jego
                  posiadania w Serwisie.
                </li>
                <li>
                  Po usunięciu konta dane mogą być przechowywane przez okres niezbędny do:
                  <ul className="ml-6 mt-2 space-y-2">
                    <li>
                      Dochodzenia lub obrony przed ewentualnymi roszczeniami (do czasu ich
                      przedawnienia).
                    </li>
                    <li>
                      Wypełnienia obowiązków prawnych (np. wynikających z przepisów podatkowych –
                      zazwyczaj 5 lat od końca roku kalendarzowego, w którym dokonano transakcji).
                    </li>
                  </ul>
                </li>
                <li>
                  Dane przetwarzane w celach analitycznych będą przechowywane do czasu wniesienia
                  sprzeciwu lub do momentu, gdy staną się nieaktualne.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 5. Prawa Użytkownika</h2>
              <p className="mb-4">
                Użytkownikowi przysługują następujące prawa związane z przetwarzaniem jego danych
                osobowych:
              </p>
              <ul className="space-y-2 mb-4">
                <li>
                  <strong>Prawo dostępu do danych</strong> – możliwość uzyskania informacji o
                  przetwarzanych danych oraz kopii tych danych.
                </li>
                <li>
                  <strong>Prawo do sprostowania (poprawiania) danych</strong> – możliwość żądania
                  poprawienia nieprawidłowych danych.
                </li>
                <li>
                  <strong>
                    Prawo do usunięcia danych (&quot;prawo do bycia zapomnianym&quot;)
                  </strong>{' '}
                  – możliwość żądania usunięcia danych, o ile nie istnieją nadrzędne podstawy prawne
                  do ich dalszego przetwarzania.
                </li>
                <li>
                  <strong>Prawo do ograniczenia przetwarzania danych.</strong>
                </li>
                <li>
                  <strong>Prawo do wniesienia sprzeciwu</strong> wobec przetwarzania danych na
                  podstawie prawnie uzasadnionego interesu Administratora.
                </li>
                <li>
                  <strong>Prawo do przenoszenia danych.</strong>
                </li>
                <li>
                  <strong>Prawo do wniesienia skargi</strong> do organu nadzorczego, tj. Prezesa
                  Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).
                </li>
              </ul>
              <p className="mb-8">
                W celu realizacji swoich praw prosimy o kontakt pod adresem e-mail:
                kontakt@golebiepocztowe.pl.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">
                § 6. Pliki Cookies (Ciasteczka)
              </h2>
              <p className="mb-4">
                Serwis wykorzystuje pliki cookies, czyli małe pliki tekstowe przechowywane na
                urządzeniu końcowym Użytkownika.
              </p>
              <p className="mb-4">Stosujemy następujące rodzaje plików cookies:</p>
              <ul className="space-y-3 mb-4">
                <li>
                  <strong>Cookies niezbędne:</strong> Konieczne do prawidłowego funkcjonowania
                  Serwisu, w tym do obsługi logowania i utrzymania sesji Użytkownika. Nie można ich
                  wyłączyć.
                </li>
                <li>
                  <strong>Cookies analityczne/opcjonalne:</strong> Wykorzystywane do zbierania
                  anonimowych danych statystycznych o sposobie korzystania z Serwisu w celu jego
                  optymalizacji (np. Google Analytics). Są one instalowane wyłącznie za zgodą
                  Użytkownika.
                </li>
              </ul>
              <p className="mb-8">
                Użytkownik może w każdej chwili zmienić ustawienia dotyczące plików cookies w swojej
                przeglądarce internetowej, w tym zablokować ich zapisywanie. Może to jednak wpłynąć
                na niektóre funkcjonalności Serwisu.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">§ 7. Postanowienia Końcowe</h2>
              <ul className="space-y-3 mb-8">
                <li>
                  Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce
                  Prywatności.
                </li>
                <li>
                  O wszelkich zmianach Użytkownicy zostaną poinformowani poprzez publikację nowej
                  wersji polityki w Serwisie.
                </li>
                <li>Niniejsza Polityka Prywatności wchodzi w życie z dniem opublikowania.</li>
              </ul>

              <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-lg border border-white">
                <p className="text-sm text-white text-center">
                  <strong>Ostatnia aktualizacja:</strong> {new Date().toLocaleDateString('pl-PL')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
