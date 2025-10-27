'use client';

import { UserStatus } from '@/components/auth/UserStatus';
import { Footer } from '@/components/layout/Footer';
import { LogoGlow } from '@/components/layout/LogoGlow';
import { VerificationIndicator } from '@/components/ui/VerificationIndicator';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

const navItems = [
  { href: '/', icon: 'fas fa-home', title: 'Strona Główna', label: 'Strona Główna' },
  { href: '/auctions', icon: 'fas fa-gavel', title: 'Aukcje', label: 'Aukcje' },
  { href: '/achievements', icon: 'fas fa-crown', title: 'Nasze Osiągnięcia', label: 'Osiągnięcia' },
  { href: '/champions', icon: 'fas fa-trophy', title: 'Championy', label: 'Championy' },
  { href: '/breeder-meetings', icon: 'fas fa-users', title: 'Spotkania', label: 'Spotkania' },
  { href: '/references', icon: 'fas fa-star', title: 'Referencje', label: 'Referencje' },
  { href: '/press', icon: 'fas fa-newspaper', title: 'Prasa', label: 'Prasa' },
  { href: '/about', icon: 'fas fa-info-circle', title: 'O nas', label: 'O Nas' },
  { href: '/contact', icon: 'fas fa-envelope', title: 'Kontakt', label: 'Kontakt' },
];

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -50, rotate: -90 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 1.5, ease: 'easeOut' },
  },
};

interface UnifiedLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function UnifiedLayout({
  children,
  showNavigation = true,
  showFooter = true,
  className = '',
}: UnifiedLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className} relative`}>
      {/* Główna zawartość, która się rozciąga */}
      <main className="flex-grow relative">
        {/* overlay usunięty na prośbę użytkownika */}
        {/* Logo w lewym górnym rogu */}
        <LogoGlow />

        {/* Navigation Menu */}
        {showNavigation && (
          <>
            <nav className="absolute top-8 left-80 z-[1001] pointer-events-auto">
              <motion.div
                className="flex items-center gap-3"
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {navItems.map(item => (
                  <motion.div key={item.href} variants={navItemVariants}>
                    <Link
                      href={item.href as `/${string}`}
                      className="glass-nav-button"
                      title={item.title}
                      onClick={() => {
                        /* console.log('Clicked:', item.href) */
                      }}
                    >
                      <i className={`${item.icon} relative z-10 text-3xl`}></i>
                      <span className="relative z-10 text-sm">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </nav>

            {/* User Status w prawym górnym rogu */}
            <div className="absolute top-8 right-8 z-[1001] pointer-events-auto">
              <div className="flex flex-col items-end space-y-2">
                <UserStatus />
                <VerificationIndicator />
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="relative z-10">{children}</div>
      </main>

      {/* Stopka */}
      {showFooter && <Footer />}
    </div>
  );
}
