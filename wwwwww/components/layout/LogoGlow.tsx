'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function LogoGlow() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 2.5, delay: 0.8 }}
      className="relative z-60"
    >
      <Link href="/">
        <motion.div className="relative">
          {/* Główne logo */}
          <Image
            src="/logo.png"
            alt="Pałka M.T.M. Mistrzowie Sprintu"
            width={240}
            height={240}
            className="h-60 w-auto object-contain cursor-pointer brightness-125 contrast-125 drop-shadow-[0_20px_40px_rgba(255,255,255,0.6)] drop-shadow-[0_30px_60px_rgba(255,255,255,0.4)]"
            style={{ width: 'auto', height: 'auto' }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
