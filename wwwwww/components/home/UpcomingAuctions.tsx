'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Typ dla aukcji
interface Auction {
  id: string | number;
  title: string;
  description?: string;
  currentPrice: number;
  endTime: string;
  createdAt?: string;
  image: string;
  bids: number;
}

// Pusta lista nadchodzących aukcji - będzie pobierana z localStorage
const getUpcomingAuctions = (): Auction[] => {
  if (typeof window !== 'undefined') {
    const auctions = JSON.parse(localStorage.getItem('auctions') || '[]');
    return auctions.filter((auction: unknown): auction is Auction => {
      if (!auction || typeof auction !== 'object') return false;
      const a = auction as Record<string, unknown>;
      return (
        'id' in a &&
        'title' in a &&
        'currentPrice' in a &&
        'endTime' in a &&
        'image' in a &&
        'bids' in a &&
        typeof a.endTime === 'string' &&
        new Date(a.endTime) > new Date()
      );
    });
  }
  return [];
};

export function UpcomingAuctions() {
  const [upcomingAuctions, setUpcomingAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    setUpcomingAuctions(getUpcomingAuctions());
  }, []);

  if (upcomingAuctions.length === 0) {
    return null; // Nie pokazuj sekcji, jeśli nie ma aukcji
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Nadchodzące Aukcje
        </h2>
        <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-secondary-200">
          Nie przegap okazji na zdobycie wyjątkowych championów.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {upcomingAuctions.map((auction, index) => (
          <motion.div
            key={auction.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Link href={`/auctions/${auction.id}`} className="block h-full">
              <div className="bg-secondary-800 rounded-2xl p-8 h-full flex flex-col group transition-all duration-300 hover:bg-secondary-700 hover:shadow-xl">
                <h3 className="font-display font-bold text-xl text-white">{auction.title}</h3>
                <p className="text-secondary-200 mt-2 text-base flex-grow">{auction.description}</p>
                <div className="mt-6 space-y-3 text-base">
                  <div className="flex items-center text-secondary-200">
                    <Calendar className="w-5 h-5 mr-3 text-primary-400" />
                    <span>
                      Zakończenie:{' '}
                      {format(new Date(auction.endTime), 'dd MMMM yyyy', { locale: pl })}
                    </span>
                  </div>
                  <div className="flex items-center text-secondary-200">
                    <Clock className="w-5 h-5 mr-3 text-primary-400" />
                    <span>o {format(new Date(auction.endTime), 'HH:mm', { locale: pl })}</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-primary-400 group-hover:text-white transition-colors">
                  Zobacz aukcję
                  <ArrowRight className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/auctions"
          className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
        >
          <span>Zobacz Wszystkie Aukcje</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </section>
  );
}
