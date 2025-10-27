import { Facebook, Instagram, Mail, Twitter } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  company: [
    { name: 'O nas', href: '/about' },
    { name: 'Nasze Osiągnięcia', href: '/achievements' },
    { name: 'Kontakt', href: '/contact' },
  ],
  services: [
    { name: 'Aukcje', href: '/auctions' },
    { name: 'Championy', href: '/champions' },
    { name: 'Referencje', href: '/references' },
  ],
  legal: [
    { name: 'Regulamin', href: '/terms' },
    { name: 'Polityka Prywatności', href: '/privacy' },
    { name: 'Warunki Sprzedaży', href: '/sales-terms' },
  ],
};

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/PalkaGolebiepl/?locale=pl_PL',
    icon: Facebook,
  },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Twitter', href: '#', icon: Twitter },
];

export function Footer() {
  return (
    <footer className="bg-gray-800/30 backdrop-blur-sm border-t border-white/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Company Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <span className="font-display font-bold text-xl">MTM Pałka</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
              Witamy w świecie MTM Pałka – hodowli gołębi pocztowych, której fundamentem jest
              historia trzech pokoleń, a siłą napędową bezgraniczna miłość do lotu. W sercu Dolnego
              Śląska, pod niebem Lubania, od ponad czterdziestu pięciu lat piszemy sagę, w której
              precyzja genetyki łączy się z siłą rodzinnych więzi. Nasza nazwa to symbol jedności –
              Mariusz, Tadeusz, Marcin Pałka – ojciec i synowie, których połączyła wspólna pasja.
            </p>
            <div className="flex items-center space-x-4 text-gray-400 mt-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">kontakt@golebiepocztowe.pl</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Szczegółowe dane na stronie</span>
                <a
                  href="/contact"
                  className="text-white/60 hover:text-white/80 transition-colors underline text-sm"
                >
                  Kontakt
                </a>
              </div>
            </div>
          </div>

          {/* All Links - Right Side */}
          <div className="flex flex-wrap gap-6 lg:gap-8">
            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-sm mb-2 text-white">Firma</h3>
              <ul className="space-y-1">
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href as `/${string}`}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h3 className="font-semibold text-sm mb-2 text-white">Usługi</h3>
              <ul className="space-y-1">
                {footerLinks.services.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href as `/${string}`}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-sm mb-2 text-white">Prawne</h3>
              <ul className="space-y-1">
                {footerLinks.legal.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href as `/${string}`}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-4 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-400 text-xs text-center sm:text-left">
              © 2024 MTM Pałka. Wszystkie prawa zastrzeżone.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
