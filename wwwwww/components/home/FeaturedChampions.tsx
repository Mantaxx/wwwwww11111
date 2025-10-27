'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';

const featuredChampions = [
  {
    id: 1,
    name: 'Generał 1726',
    ringNumber: 'PL-xxxx-99-1726',
    bloodline: 'MTM Pałka - Fundament hodowli',
    achievements: ['"Wydał nam naprawdę lotników"', 'Ojciec i dziadek wielu czołowych lotników'],
    image: '/champions/general-1726.jpg',
    link: '/champions/general-1726',
  },
  {
    id: 2,
    name: 'Zawodowiec',
    ringNumber: 'PL-xxxx-xx-xxxx',
    bloodline: 'MTM Pałka - Linia szpak',
    achievements: ['2x 1. nagroda w oddziale', 'Dziadek gołębia 18071'],
    image: '/champions/zawodowiec.jpg',
    link: '/champions/zawodowiec',
  },
  {
    id: 3,
    name: 'Mały Tom',
    ringNumber: 'PL-xxxx-xx-xxxx',
    bloodline: 'MTM Pałka - Wysokie ceny',
    achievements: ['Wnuki osiągają 1000 zł na aukcjach', 'Niezwykle ceniona linia'],
    image: '/champions/maly-tom.jpg',
    link: '/champions/maly-tom',
  },
];

export function FeaturedChampions() {
  return (
    <section className="py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Nasze Championy</h2>
        <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-secondary-200">
          Poznaj fundamenty genetyczne, które ukształtowały sukces naszej hodowli.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredChampions.map((champion, index) => (
          <motion.div
            key={champion.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Link href={champion.link as `/${string}`} className="group block h-full">
              <div className="bg-transparent rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-56 bg-transparent">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                      {champion.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      Champion
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-display font-bold text-xl text-white">{champion.name}</h3>
                  <p className="text-secondary-200 mt-2 text-base flex-grow">
                    {champion.achievements[0]}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-medium text-primary-400 group-hover:text-white transition-colors">
                    Zobacz profil
                    <ArrowRight className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/champions"
          className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
        >
          <span>Zobacz Wszystkich Championów</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </section>
  );
}
