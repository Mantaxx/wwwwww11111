'use client';

import GoogleMap from '@/components/contact/GoogleMap';
import { Text3D } from '@/components/ui/Text3D';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPageClient() {
  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="relative z-10 pt-4 pb-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">Kontakt</h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto"
          >
            Skontaktuj się z nami, aby dowiedzieć się więcej o naszych gołębiach i hodowli
          </motion.p>
        </div>
      </motion.section>

      {/* Content Sections */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <UnifiedCard
                variant="glass"
                glow={false}
                className="p-8 text-center rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl shadow-[0_0_14px_3px_rgba(255,255,255,0.55)]"
              >
                <motion.div
                  whileHover={{ rotateY: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 glass-morphism-strong rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white"
                  style={{
                    boxShadow:
                      '0 8px 32px rgba(255, 255, 255, 0.4), 0 16px 64px rgba(255, 255, 255, 0.2), 0 24px 96px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Phone className="w-8 h-8 text-white/60" />
                </motion.div>
                <Text3D variant="glow" intensity="medium" className="text-xl font-bold mb-4">
                  Telefon
                </Text3D>
                <p className="text-white/90 mb-4">75 722 47 29</p>
                <p className="text-white/70 text-sm">Dostępny 8:00 - 20:00</p>
              </UnifiedCard>

              <UnifiedCard
                variant="glass"
                glow={false}
                className="p-8 text-center rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl shadow-[0_0_14px_3px_rgba(255,255,255,0.55)]"
              >
                <motion.div
                  whileHover={{ rotateY: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 glass-morphism-strong rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white"
                  style={{
                    boxShadow:
                      '0 8px 32px rgba(255, 255, 255, 0.4), 0 16px 64px rgba(255, 255, 255, 0.2), 0 24px 96px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Mail className="w-8 h-8 text-white/60" />
                </motion.div>
                <Text3D variant="gradient" intensity="medium" className="text-xl font-bold mb-4">
                  Email
                </Text3D>
                <p className="text-white/90 mb-4">kontakt@palkamtm.pl</p>
                <p className="text-slate-200 text-sm">Odpowiadamy w ciągu 24h</p>
              </UnifiedCard>

              <UnifiedCard
                variant="glass"
                glow={false}
                className="p-8 text-center rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl shadow-[0_0_14px_3px_rgba(255,255,255,0.55)]"
              >
                <motion.div
                  whileHover={{ rotateY: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 glass-morphism-strong rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white"
                  style={{
                    boxShadow:
                      '0 8px 32px rgba(255, 255, 255, 0.4), 0 16px 64px rgba(255, 255, 255, 0.2), 0 24px 96px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <MapPin className="w-8 h-8 text-slate-300" />
                </motion.div>
                <Text3D variant="neon" intensity="medium" className="text-xl font-bold mb-4">
                  Adres
                </Text3D>
                <p className="text-white/90 mb-4">
                  Pałka MTM
                  <br />
                  ul. Stawowa 6<br />
                  59-800 Lubań
                  <br />
                  woj. dolnośląskie
                </p>
                <p className="text-slate-200 text-sm">Wizyty po umówieniu</p>
              </UnifiedCard>
            </div>
          </motion.section>

          {/* Google Map */}
          <GoogleMap />

          {/* Contact Form */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <UnifiedCard
              variant="glass"
              glow={false}
              className="p-8 rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl shadow-[0_0_14px_3px_rgba(255,255,255,0.55)]"
            >
              <Text3D
                variant="shimmer"
                intensity="high"
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
              >
                Napisz do nas
              </Text3D>

              <form className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-white/90 text-sm font-medium mb-2"
                    >
                      Imię i nazwisko
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300"
                      placeholder="Twoje imię i nazwisko"
                      aria-describedby="fullName-description"
                    />
                    <div id="fullName-description" className="sr-only">
                      Wprowadź swoje imię i nazwisko
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300"
                      placeholder="twoj@email.pl"
                      aria-describedby="email-description"
                    />
                    <div id="email-description" className="sr-only">
                      Wprowadź swój adres email
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-white/90 text-sm font-medium mb-2">
                    Temat
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    placeholder="Temat wiadomości"
                    aria-describedby="subject-description"
                  />
                  <div id="subject-description" className="sr-only">
                    Wprowadź temat wiadomości
                  </div>
                </div>

                <div className="mb-8">
                  <label htmlFor="message" className="block text-white/90 text-sm font-medium mb-2">
                    Wiadomość
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
                    placeholder="Napisz swoją wiadomość..."
                    aria-describedby="message-description"
                  ></textarea>
                  <div id="message-description" className="sr-only">
                    Wprowadź treść wiadomości
                  </div>
                </div>

                <div className="text-center">
                  <UnifiedButton
                    variant="primary"
                    size="lg"
                    intensity="high"
                    glow={false}
                    className="px-12"
                  >
                    Wyślij wiadomość
                  </UnifiedButton>
                </div>
              </form>
            </UnifiedCard>
          </motion.section>

          {/* Additional Info */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <UnifiedCard
              variant="glass"
              glow={false}
              className="relative p-8 rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl shadow-[0_0_14px_3px_rgba(255,255,255,0.55)]"
            >
              <Text3D
                variant="glow"
                intensity="medium"
                className="text-2xl md:text-3xl font-bold mb-6 text-center"
              >
                Godziny Pracy
              </Text3D>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">Hodowla</h4>
                  <p className="text-white/90 mb-2">Poniedziałek - Piątek: 8:00 - 18:00</p>
                  <p className="text-white/90 mb-2">Sobota: 9:00 - 15:00</p>
                  <p className="text-white/90">Niedziela: Zamknięte</p>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">Aukcje Online</h4>
                  <p className="text-white/90 mb-2">24/7 - Dostępne cały czas</p>
                  <p className="text-white/90 mb-2">Wsparcie: 8:00 - 20:00</p>
                  <p className="text-white/90">Email: 24h</p>
                </div>
              </div>
            </UnifiedCard>
          </motion.section>
        </div>
      </div>
    </>
  );
}
