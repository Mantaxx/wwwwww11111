'use client';

import { Text3D } from '@/components/ui/Text3D';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { motion } from 'framer-motion';

export default function AboutPageClient() {
  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="relative z-10 pt-4 pb-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="w-full mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">O nas</h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-lg md:text-xl text-blue-100 mb-6 max-w-3xl mx-auto"
          >
            Poznaj historię i pasję stojącą za hodowlą gołębi pocztowych MTM Pałka
          </motion.p>
        </div>
      </motion.section>

      {/* Content Sections */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Historia MTM Pałka */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <UnifiedCard variant="glass" glow={false} className="p-12">
              <Text3D
                variant="gradient"
                intensity="medium"
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
              >
                MTM Pałka: Gdzie Rodzinna Pasja Spotyka Mistrzostwo Sprintu
              </Text3D>

              <div className="prose prose-lg max-w-none text-white/90 leading-relaxed">
                <p className="mb-6">
                  Witamy w świecie MTM Pałka – hodowli gołębi pocztowych, której fundamentem jest
                  historia trzech pokoleń, a siłą napędową bezgraniczna miłość do lotu. W sercu
                  Dolnego Śląska, pod niebem Lubania, od ponad czterdziestu pięciu lat piszemy sagę,
                  w której precyzja genetyki łączy się z siłą rodzinnych więzi. Nasza nazwa to
                  symbol jedności – Mariusz, Tadeusz, Marcin Pałka – ojciec i synowie, których
                  połączyła wspólna pasja.
                </p>

                <p className="mb-6">
                  Specjalizujemy się w tym, co najtrudniejsze i najbardziej ekscytujące: w lotach
                  sprinterskich. Dla nas gołębiarstwo to sztuka strategii, intuicji i codziennej,
                  ciężkiej pracy.
                </p>

                <h3 className="text-2xl font-bold text-blue-200 mb-4 mt-8">
                  Filozofia Mistrza: Ojciec Założyciel Tadeusz Pałka
                </h3>
                <p className="mb-6">
                  U steru naszej hodowli od samego początku, czyli od lat 80., stoi Tadeusz Pałka –
                  patriarcha, mentor i wizjoner. To on wpoił nam filozofię, że prawdziwego hodowcę
                  poznaje się nie po zasobności portfela, lecz po oddaniu. Przez 365 dni w roku
                  jesteśmy dla naszych ptaków weterynarzami, dietetykami i trenerami.
                </p>
                <p className="mb-6">
                  Tadeusz mawia: &quot;Ptaki to czują&quot;, a wyniki, które osiągamy, są tego
                  najlepszym dowodem. Jego dekady doświadczenia to kapitał, na którym budujemy nasze
                  dzisiejsze sukcesy.
                </p>

                <h3 className="text-2xl font-bold text-cyan-200 mb-4 mt-8">
                  Siła Pokoleń: Energia, Która Zmieniła Wszystko
                </h3>
                <p className="mb-6">
                  Prawdziwy przełom nastąpił, gdy do Tadeusza dołączyli synowie, wnosząc nową
                  energię i odwagę do działania. To właśnie Mariusz Pałka, jego prawa ręka, wraz z
                  ojcem na przełomie wieków zrewolucjonizował naszą hodowlę. Import elitarnych
                  gołębi z linii Janssen, Vandenabeele czy od mistrzów jak Gerhard Peters, nasycił
                  nasze stado genem zwycięzców i nadał mu niezrównaną szybkość.
                </p>
                <p className="mb-6">
                  Dziś tę misję kontynuuje Marcin Pałka, który od dziecka związany jest z
                  gołębnikiem. Jego precyzja w logistyce i organizacji lotów zapewnia, że każdy
                  start naszych podopiecznych jest przygotowany perfekcyjnie. To dzięki tej synergii
                  pokoleń MTM Pałka stało się synonimem &quot;mistrzów sprintu&quot;.
                </p>

                <h3 className="text-2xl font-bold text-blue-300 mb-4 mt-8">
                  W Cieniu Skrzydeł: Historia, Która Daje Nam Siłę
                </h3>
                <p className="mb-6">
                  Nasza droga nie była usłana wyłącznie sukcesami. 29 stycznia 2006 roku tragedia na
                  Międzynarodowych Targach Katowickich na zawsze zabrała nam Mariusza. Jego odejście
                  pozostawiło pustkę, ale jego pasja i marzenia stały się naszym największym
                  zobowiązaniem. Tadeusz, jako lider rodziny, przekuł niewyobrażalny ból w
                  determinację, by dziedzictwo syna trwało w każdym locie i każdym kolejnym
                  pokoleniu mistrzów z naszego gołębnika.
                </p>
                <p className="mb-6">
                  Adrenalina towarzysząca oczekiwaniu na powrót stada to dziś coś więcej niż sport –
                  to hołd dla pamięci i symbol niezłomności.
                </p>

                <h3 className="text-2xl font-bold text-cyan-300 mb-4 mt-8">
                  Tradycja w Nowoczesnym Wydaniu: MTM Pałka Dziś
                </h3>
                <p className="mb-6">
                  Dziś MTM Pałka to hodowla, która z szacunkiem patrzy w przeszłość, ale odważnie
                  spogląda w przyszłość.
                </p>
                <p className="mb-6">
                  Elitarne Pochodzenie: Nasz gołębnik jest domem dla potomków legendarnych
                  sprinterów, a ich jakość potwierdzają hodowcy w całej Polsce.
                </p>
                <p className="mb-8">
                  Zapraszamy do poznania naszej historii i naszych skrzydlatych atletów. MTM Pałka
                  to więcej niż hodowla – to dowód, że największe sukcesy rodzą się z serca,
                  wytrwałości i rodzinnych więzi.
                </p>
              </div>
            </UnifiedCard>
          </motion.section>
        </div>
      </div>
    </>
  );
}
