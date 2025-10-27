'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Heart, Quote, Target, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
const philosophyValues = [
  {
    icon: Heart,
    title: 'Strategia 80/20',
    description:
      '80% gołębi spokrewnionych + 20% &quot;świeżej krwi&quot; z najlepszych hodowli europejskich',
  },
  {
    icon: Target,
    title: 'Selekcja &quot;w Ręku&quot;',
    description:
      'Intuicyjna ocena budowy, skrzydła i &quot;leżenia w ręku&quot; - dekady doświadczeń',
  },
  {
    icon: Users,
    title: 'Hodowla-Matka',
    description: 'Geny MTM Pałka w 95% hodowli Mieczysława Bogonosa i 100% hodowli Koryciński',
  },
];

export function PhilosophySection() {
  return (
    <section className="py-16 sm:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Philosophy Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="glass-container p-8 rounded-2xl">
              <div className="mb-10">
                <Quote className="w-12 h-12 text-primary-400 mb-6" />
                <blockquote className="text-xl sm:text-2xl font-display font-medium text-white leading-relaxed border-l-4 border-primary-400 pl-6 mb-8">
                  &quot;Dla gołębia trzeba być weterynarzem, dietetykiem, trenerem i opiekunem w
                  jednym. Mistrzostwo to suma tysięcy drobiazgowych, codziennych czynności.&quot;
                </blockquote>
                <cite className="block text-right text-secondary-200 mt-4 text-base">
                  — Tadeusz Pałka, MTM Pałka
                </cite>
              </div>
              <div>
                <p className="text-secondary-200 leading-relaxed mt-8 text-base">
                  Nasza historia to dekady pasji i dążenia do perfekcji. Od skromnych początków w
                  latach 70., przez budowę profesjonalnego gołębnika w 2000 roku, po dzisiejsze
                  sukcesy – zawsze kierowaliśmy się miłością do gołębi i chęcią osiągania
                  najlepszych wyników.
                </p>
              </div>
              <Link
                href="/achievements"
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 mt-8 shadow-lg hover:shadow-primary-500/50"
              >
                <span>Poznaj Naszą Historię</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {philosophyValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-container p-6 rounded-2xl flex items-start space-x-6 hover:bg-white/20 transition-colors duration-300"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/20">
                  <value.icon className="w-7 h-7 text-primary-400 animate-glow3D" />
                </div>
                <React.Fragment>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{value.title}</h3>
                    <p className="text-secondary-200 leading-relaxed mt-1 text-base">
                      {value.description}
                    </p>
                  </div>
                </React.Fragment>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
