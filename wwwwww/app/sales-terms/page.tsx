export const metadata = {
  title: 'Warunki Sprzedaży - Gołębie Pocztowe',
  description:
    'Warunki Sprzedaży w Serwisie Aukcyjnym Gołębie Pocztowe - zasady zawierania i realizacji transakcji.',
};

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function SalesTermsPage() {
  return (
    <UnifiedLayout>
      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Warunki Sprzedaży</h1>
            <p className="text-xl text-white">Warunki Sprzedaży w Serwisie Gołębie Pocztowe</p>
          </div>

          {/* Sales Terms Content */}
          <div className="rounded-lg border-2 border-white p-8 bg-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(255,255,255,0.4),0_16px_64px_rgba(255,255,255,0.2),0_24px_96px_rgba(255,255,255,0.1)]">
            <div className="prose prose-lg max-w-none text-white/90">
              <div className="bg-white bg-opacity-10 border-l-4 border-red-400 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-300 font-medium">
                      <strong>UWAGA!</strong> Niniejszy dokument stanowi integralną część Regulaminu
                      Serwisu. Każdy Użytkownik wystawiający ofertę (Sprzedający) lub biorący udział
                      w licytacji (Kupujący) w pełni akceptuje poniższe warunki. Umowa sprzedaży
                      jest zawierana bezpośrednio i wyłącznie pomiędzy Sprzedającym a Kupującym.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">§ 1. Postanowienia Ogólne</h2>
              <p className="mb-4">
                Niniejsze Warunki Sprzedaży określają szczegółowe zasady dotyczące zawierania i
                realizacji umów kupna-sprzedaży gołębi pocztowych za pośrednictwem Serwisu Gołębie
                Pocztowe.
              </p>
              <ul className="space-y-3 mb-8">
                <li>
                  Serwis pełni jedynie rolę platformy technologicznej, umożliwiającej kojarzenie
                  stron transakcji. Serwis nie jest sprzedawcą, pośrednikiem, ani stroną umowy
                  sprzedaży.
                </li>
                <li>
                  Wszystkie zobowiązania, roszczenia i obowiązki wynikające z umowy sprzedaży
                  istnieją wyłącznie pomiędzy Sprzedającym a Kupującym.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 2. Obowiązki Sprzedającego</h2>
              <p className="mb-4">
                Sprzedający ponosi pełną i wyłączną odpowiedzialność za zgodność oferty ze stanem
                faktycznym. Opis aukcji musi być rzetelny, dokładny i nie może wprowadzać w błąd.
              </p>
              <p className="mb-4">
                W szczególności Sprzedający jest zobowiązany do podania prawdziwych informacji
                dotyczących:
              </p>
              <ul className="space-y-3 mb-4">
                <li>
                  Pochodzenia i rodowodu gołębia (dołączenie czytelnego skanu lub zdjęcia
                  oryginalnego rodowodu jest obligatoryjne).
                </li>
                <li>
                  Płci gołębia (w przypadku braku 100% pewności, Sprzedający musi to wyraźnie
                  zaznaczyć w opisie).
                </li>
                <li>Stanu zdrowia, kondycji fizycznej oraz odbytych szczepień.</li>
                <li>Wyników lotowych gołębia lub jego przodków, jeśli są podawane w ofercie.</li>
              </ul>
              <ul className="space-y-3 mb-8">
                <li>
                  Wszystkie zdjęcia zamieszczone w ofercie muszą przedstawiać oferowanego gołębia.
                </li>
                <li>
                  Sprzedający oświadcza, że posiada pełne prawo do rozporządzania oferowanym
                  gołębiem i jego sprzedaż nie narusza praw osób trzecich ani obowiązujących
                  przepisów.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">
                § 3. Przebieg Aukcji i Zawarcie Umowy
              </h2>
              <ul className="space-y-3 mb-8">
                <li>
                  Każde postąpienie w licytacji (złożenie oferty) przez Kupującego jest prawnie
                  wiążące i nie może być wycofane.
                </li>
                <li>
                  Zakończenie aukcji z najwyższą ofertą jest równoznaczne z zawarciem prawnie
                  wiążącej umowy kupna-sprzedaży pomiędzy Sprzedającym a Kupującym, który złożył
                  najwyższą ofertę.
                </li>
                <li>
                  Serwis automatycznie generuje powiadomienie dla obu stron o zakończeniu aukcji i
                  danych kontaktowych drugiej strony, jednak nie jest odpowiedzialny za ich
                  poprawność ani za nawiązanie kontaktu przez Użytkowników.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 4. Płatność i Odbiór</h2>
              <ul className="space-y-3 mb-4">
                <li>
                  Po zakończeniu aukcji, Kupujący i Sprzedający są zobowiązani do nawiązania
                  kontaktu w terminie do 72 godzin w celu ustalenia szczegółów płatności i dostawy.
                </li>
                <li>
                  Forma płatności (przelew bankowy, płatność przy odbiorze itp.) jest ustalana
                  bezpośrednio między stronami. Serwis nie pośredniczy w żadnych płatnościach i nie
                  ponosi odpowiedzialności za ich realizację.
                </li>
                <li>
                  Zapłata pełnej wylicytowanej kwoty przez Kupującego powinna nastąpić w terminie do
                  7 dni od zakończenia aukcji, chyba że strony indywidualnie postanowią inaczej.
                </li>
              </ul>
              <ul className="space-y-3 mb-8">
                <li>
                  Organizacja, koszt i ryzyko związane z transportem gołębia leżą w całości po
                  stronie Kupującego, chyba że Sprzedający i Kupujący uzgodnią inne warunki.
                </li>
                <li>
                  Serwis nie oferuje, nie poleca ani nie ponosi odpowiedzialności za żadne firmy
                  transportowe czy metody wysyłki. Wybór sposobu dostawy jest wyłączną decyzją i
                  ryzykiem stron transakcji.
                </li>
                <li>
                  Wydanie gołębia Kupującemu lub przewoźnikowi powinno nastąpić niezwłocznie po
                  zaksięgowaniu wpłaty na koncie Sprzedającego.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">
                § 5. Odpowiedzialność, Rękojmia i Reklamacje
              </h2>
              <ul className="space-y-3 mb-4">
                <li>
                  Przedmiot sprzedaży (gołąb) jest sprzedawany w stanie &quot;tak jak jest&quot;
                  (ang. as is).
                </li>
                <li>
                  Wyłączną odpowiedzialność za wady fizyczne i prawne sprzedawanego gołębia ponosi
                  Sprzedający na zasadach określonych w Kodeksie Cywilnym (rękojmia), o ile nie
                  została ona przez niego skutecznie ograniczona lub wyłączona w treści oferty
                  (dotyczy to w szczególności transakcji między osobami fizycznymi).
                </li>
                <li>
                  Wszelkie roszczenia i reklamacje dotyczące przedmiotu sprzedaży, w tym jego stanu
                  zdrowia po odbiorze, niezgodności z opisem, autentyczności rodowodu itp., muszą
                  być kierowane przez Kupującego bezpośrednio i wyłącznie do Sprzedającego.
                </li>
              </ul>
              <ul className="space-y-3 mb-8">
                <li>
                  Serwis nie będzie rozpatrywał żadnych reklamacji dotyczących transakcji, nie
                  będzie mediatorem w sporach i nie ponosi żadnej odpowiedzialności z tytułu rękojmi
                  lub gwarancji.
                </li>
                <li>
                  Ryzyko przypadkowej utraty lub uszkodzenia gołębia przechodzi na Kupującego z
                  chwilą jego wydania przez Sprzedającego (odbioru osobistego lub przekazania
                  przewoźnikowi).
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-4">§ 6. Postanowienia Końcowe</h2>
              <ul className="space-y-3 mb-8">
                <li>
                  Niniejsze Warunki Sprzedaży są nierozerwalnie związane z Regulaminem Serwisu.
                </li>
                <li>
                  W sprawach nieuregulowanych w niniejszym dokumencie stosuje się postanowienia
                  Regulaminu Serwisu oraz odpowiednie przepisy prawa polskiego, w szczególności
                  Kodeksu Cywilnego.
                </li>
                <li>
                  Wszelkie indywidualne ustalenia między Sprzedającym a Kupującym, odmienne od
                  powyższych warunków, muszą być dokonywane bezpośrednio między nimi i nie rodzą
                  żadnych zobowiązań po stronie Serwisu.
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
