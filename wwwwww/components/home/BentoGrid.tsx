'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type GridItemType = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  image?: string;
};

const gridItems: GridItemType[] = [
  {
    id: 1,
    title: 'Złota Para 1360x1184',
    subtitle: 'Fundament Genetyczny',
    description:
      'Legendarna para - "1360" i samica 1184, współtwórcy genetycznego dziedzictwa MTM Pałka',
    link: '/champions/zlota-para',
  },
  {
    id: 2,
    title: 'Ekskluzywne Aukcje',
    subtitle: 'Unikatowe Okazy',
    description: 'Wnuki "Małego Toma" i inne wyjątkowe championy dostępne w aukcjach',
    link: '/auctions',
    image: '/aukcje.png', // Używamy aukcje.png
  },
  {
    id: 3,
    title: 'Strategia 80/20',
    subtitle: 'Filozofia Hodowli',
    description: '80% gołębi spokrewnionych + 20% "świeżej krwi" z linii Jansen i Gaby Vanebele',
    link: '/achievements',
  },
];

export function BentoGrid() {
  return (
    <section className="py-16 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Nasze Fundamenty
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-secondary-200">
            Odkryj kluczowe elementy, które definiują naszą hodowlę i prowadzą do sukcesu.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {gridItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -15 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{
              duration: 0.8,
              delay: index * 0.2,
              type: 'spring',
              stiffness: 100,
              damping: 20,
            }}
            viewport={{ once: true }}
            className="group transform-3d perspective-1000 w-full sm:w-auto flex-1 min-w-[300px] max-w-md h-64"
          >
            <Link href={item.link as `/${string}`} className="block h-full">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl h-full flex flex-col items-center justify-center group transition-all duration-300 hover:bg-white/20 border border-white/20 hover:shadow-xl overflow-hidden p-8">
                {item.image && (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={`Zdjęcie dla ${item.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
