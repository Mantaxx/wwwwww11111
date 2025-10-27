'use client';

import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';

export default function GoogleMap() {
  const address = 'ul. Stawowa 6, 59-800 Lubań';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="mb-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mapa */}
        <div className="relative">
          <div
            className="aspect-video rounded-2xl overflow-hidden border-2 border-white bg-white/10 backdrop-blur-xl"
            style={{
              boxShadow: 'none',
            }}
          >
            <iframe
              src="https://maps.google.com/maps?q=ul.+Stawowa+6,+59-800+Lubań,+Poland&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa hodowli MTM Pałka - ul. Stawowa 6, Lubań"
            />
          </div>
        </div>

        {/* Informacje o dojeździe */}
        <div className="space-y-6">
          <div
            className="relative group p-6 rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl text-center lg:text-left transition-transform duration-300 hover:-translate-y-1"
            style={{ boxShadow: 'none' }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: '0 0 28px 8px rgba(255,255,255,0.9)' }}
            ></span>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center lg:justify-start">
              <MapPin className="w-6 h-6 mr-2 text-slate-300" />
              Jak do nas trafić
            </h3>
            <p className="text-slate-200">
              Nasza hodowla znajduje się w Lubaniu, w sercu Dolnego Śląska. Zapraszamy do
              odwiedzenia nas po wcześniejszym umówieniu.
            </p>
          </div>

          {/* Przyciski akcji */}
          <div className="space-y-4">
            <motion.a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block w-full p-4 rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
              style={{
                boxShadow: 'none',
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 28px 8px rgba(255,255,255,0.9)' }}
              ></span>
              <div className="flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-3 text-slate-300" />
                <span className="text-white font-medium">Zobacz na mapie</span>
                <ExternalLink className="w-4 h-4 ml-2 text-slate-300" />
              </div>
            </motion.a>

            <motion.a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block w-full p-4 rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
              style={{
                boxShadow: 'none',
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 28px 8px rgba(255,255,255,0.9)' }}
              ></span>
              <div className="flex items-center justify-center">
                <Navigation className="w-5 h-5 mr-3 text-slate-300" />
                <span className="text-white font-medium">Pobierz trasę</span>
                <ExternalLink className="w-4 h-4 ml-2 text-slate-300" />
              </div>
            </motion.a>
          </div>

          {/* Dodatkowe informacje */}
          <div
            className="relative group mt-8 p-6 rounded-2xl border-2 border-white bg-white/25 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            style={{
              boxShadow: 'none',
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: '0 0 28px 8px rgba(255,255,255,0.9)' }}
            ></span>
            <h4 className="text-lg font-semibold text-white mb-4">Wskazówki dojazdu</h4>
            <ul className="space-y-2 text-slate-200 text-sm">
              <li>• Z centrum Lubania: 5 minut samochodem</li>
              <li>• Z Wrocławia: około 1 godziny</li>
              <li>• Z Jeleniej Góry: około 30 minut</li>
              <li>• Parking dostępny na miejscu</li>
              <li>• Wizyty tylko po wcześniejszym umówieniu</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
