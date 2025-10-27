export const metadata = {
  title: 'Regulamin - Gołębie Pocztowe',
  description: 'Regulamin Serwisu Aukcyjnego Gołębie Pocztowe - zasady korzystania z platformy.',
};

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function TermsPage() {
  return (
    <UnifiedLayout>
      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Regulamin</h1>
            <p className="text-xl text-white/90">Regulamin Serwisu Aukcyjnego Gołębie Pocztowe</p>
          </div>

          {/* Terms Content */}
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
              <div className="bg-white bg-opacity-10 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-300 font-medium">
                      <strong>UWAGA!</strong> Prosimy o dokładne zapoznanie się z treścią
                      niniejszego regulaminu. Korzystanie z serwisu jest równoznaczne z akceptacją
                      wszystkich jego postanowień. Serwis pełni rolę wirtualnej platformy kojarzącej
                      Sprzedających i Kupujących i nie jest stroną zawieranych transakcji.
                      Właściciel serwisu nie ponosi jakiejkolwiek odpowiedzialności za treść
                      ogłoszeń, przedmiot aukcji oraz przebieg i wykonanie transakcji.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">§ 1. Definicje</h2>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>
                  <strong>Serwis</strong> – platforma internetowa dostępna pod adresem
                  gołębiepocztowe.pl, umożliwiająca Użytkownikom publikowanie Ofert sprzedaży gołębi
                  pocztowych i udział w Aukcjach.
                </li>
                <li>
                  <strong>Usługodawca</strong> – właściciel i administrator Serwisu.
                </li>
                <li>
                  <strong>Użytkownik</strong> – każda osoba fizyczna posiadająca pełną zdolność do
                  czynności prawnych, osoba prawna lub jednostka organizacyjna nieposiadająca
                  osobowości prawnej, która dokonała Rejestracji i korzysta z Serwisu.
                </li>
                <li>
                  <strong>Sprzedający</strong> – Użytkownik publikujący Ofertę sprzedaży gołębia
                  pocztowego.
                </li>
                <li>
                  <strong>Kupujący</strong> – Użytkownik biorący udział w licytacji w celu zakupu
                  gołębia pocztowego.
                </li>
                <li>
                  <strong>Aukcja</strong> – procedura prowadząca do zawarcia umowy sprzedaży
                  pomiędzy Sprzedającym a Kupującym, który zaoferował najwyższą cenę.
                </li>
                <li>
                  <strong>Regulamin</strong> – niniejszy dokument.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 2. Postanowienia Ogólne</h2>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>
                  Serwis jest jedynie platformą technologiczną, która udostępnia Użytkownikom
                  narzędzia do publikowania ofert i licytacji.
                </li>
                <li>
                  Usługodawca nie jest pośrednikiem, komisantem, agentem ani przedstawicielem
                  żadnego z Użytkowników.
                </li>
                <li>
                  Umowa sprzedaży w wyniku wygranej Aukcji zawierana jest wyłącznie i bezpośrednio
                  między Sprzedającym a Kupującym. Usługodawca nie jest stroną tej umowy i nie
                  ponosi z jej tytułu żadnej odpowiedzialności.
                </li>
                <li>
                  Rejestracja i korzystanie z Serwisu oznaczają pełną akceptację postanowień
                  niniejszego Regulaminu.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">
                § 3. Obowiązki i Odpowiedzialność Użytkownika
              </h2>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>
                  Użytkownik zobowiązany jest do podania prawdziwych i kompletnych danych podczas
                  rejestracji.
                </li>
                <li>
                  Sprzedający ponosi pełną i wyłączną odpowiedzialność za treść publikowanej przez
                  siebie oferty, w tym za:
                  <ul className="ml-6 mt-2 space-y-2 text-white/90">
                    <li>Opis gołębia, jego pochodzenie, wyniki, cechy i stan zdrowia.</li>
                    <li>Dołączone zdjęcia, skany rodowodów i inne materiały.</li>
                    <li>Legalność pochodzenia oferowanego ptaka.</li>
                    <li>Posiadanie wszelkich praw do publikowanych treści i materiałów.</li>
                  </ul>
                </li>
                <li>Użytkownik korzysta z Serwisu na własne ryzyko.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">
                § 4. Wyłączenie Odpowiedzialności Usługodawcy
              </h2>
              <p className="mb-4 text-white/90">
                Usługodawca, w najszerszym dopuszczalnym przez prawo zakresie, nie ponosi żadnej
                odpowiedzialności za:
              </p>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>
                  <strong>a.</strong> <strong>Treść i prawdziwość ofert:</strong> Usługodawca nie
                  weryfikuje informacji podawanych przez Sprzedających. Wszelkie dane dotyczące
                  zdrowia, płci, wieku, kondycji, szczepień, wyników lotowych czy autentyczności
                  rodowodu pochodzą wyłącznie od Sprzedającego.
                </li>
                <li>
                  <strong>b.</strong> <strong>Przedmiot Aukcji:</strong> Usługodawca nie gwarantuje
                  jakości, stanu zdrowia, wartości, zdolności rozpłodowych ani lotowych oferowanych
                  gołębi. Gołębie sprzedawane są w stanie &quot;tak jak jest&quot; (as is).
                </li>
                <li>
                  <strong>c.</strong> <strong>Przebieg i realizację transakcji:</strong> Usługodawca
                  nie ponosi odpowiedzialności za niewykonanie lub nienależyte wykonanie umowy
                  zawartej między Użytkownikami, w tym za brak zapłaty przez Kupującego lub
                  niewydanie gołębia przez Sprzedającego.
                </li>
                <li>
                  <strong>d.</strong> <strong>Wypłacalność Użytkowników:</strong> Usługodawca nie
                  weryfikuje zdolności finansowej Użytkowników.
                </li>
                <li>
                  <strong>e.</strong> <strong>Transport i dostawę:</strong> Wszelkie kwestie
                  związane z organizacją, kosztami i ryzykiem transportu gołębia leżą wyłącznie po
                  stronie Sprzedającego i Kupującego. Usługodawca nie ponosi odpowiedzialności za
                  uszkodzenia, zaginięcie lub śmierć ptaka w trakcie transportu.
                </li>
                <li>
                  <strong>f.</strong> <strong>Działania Użytkowników:</strong> Usługodawca nie
                  odpowiada za jakiekolwiek czyny lub zaniechania Użytkowników, w tym za naruszenie
                  przez nich praw autorskich, dóbr osobistych czy innych praw osób trzecich.
                </li>
                <li>
                  <strong>g.</strong> <strong>Działanie Serwisu:</strong> Usługodawca nie gwarantuje
                  nieprzerwanego i bezbłędnego działania Serwisu. Nie ponosi odpowiedzialności za
                  straty wynikające z awarii technicznych, przerw w dostępie do sieci, utraty danych
                  czy działania złośliwego oprogramowania.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 5. Reklamacje i Spory</h2>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>
                  Wszelkie roszczenia, reklamacje i spory wynikające z zawartej umowy sprzedaży
                  (dotyczące np. niezgodności gołębia z opisem, jego stanu zdrowia, problemów z
                  płatnością czy dostawą) mogą być kierowane wyłącznie przez jedną stronę transakcji
                  do drugiej strony transakcji.
                </li>
                <li>
                  Usługodawca nie jest stroną w tych sporach, nie pośredniczy w ich rozwiązywaniu i
                  nie będzie rozpatrywał tego typu reklamacji.
                </li>
                <li>
                  Reklamacje dotyczące wyłącznie technicznego funkcjonowania Serwisu mogą być
                  składane drogą mailową na adres kontakt@golebiepocztowe.pl, jednak nie gwarantuje
                  to podjęcia jakichkolwiek działań ani nie rodzi roszczeń odszkodowawczych.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 6. Rękojmia i Gwarancja</h2>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>
                  Wszelkie ewentualne uprawnienia z tytułu rękojmi za wady fizyczne lub prawne
                  przedmiotu sprzedaży dotyczą wyłącznie stosunku prawnego między Sprzedającym a
                  Kupującym. Usługodawca jest całkowicie wyłączony z jakiejkolwiek odpowiedzialności
                  z tego tytułu.
                </li>
                <li>Usługodawca nie udziela żadnej gwarancji na oferowane w Serwisie gołębie.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 7. Postanowienia Końcowe</h2>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>
                  Usługodawca zastrzega sobie prawo do zmiany niniejszego Regulaminu w dowolnym
                  momencie.
                </li>
                <li>
                  W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy
                  prawa polskiego.
                </li>
                <li>
                  Wszelkie spory wynikające z usług świadczonych przez Usługodawcę na podstawie
                  niniejszego Regulaminu będą rozstrzygane przez sąd właściwy dla siedziby
                  Usługodawcy.
                </li>
                <li>
                  Uznanie któregokolwiek z postanowień Regulaminu za nieważne lub nieskuteczne nie
                  wpływa na ważność pozostałych postanowień.
                </li>
              </ul>

              <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-lg border border-white">
                <p className="text-sm text-white text-center">
                  <strong>Ostatnia aktualizacja:</strong> 29.07.2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
