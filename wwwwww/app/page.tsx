'use client';

import { GlassPanel } from '@/components/home/GlassPanel';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Wyłącz scroll na stronie głównej
    document.body.style.overflow = 'hidden';

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup - przywróć scroll gdy komponent się odmontuje
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-black/30">
      <UnifiedLayout showFooter={false}>
        <div className="light-floor-fixed"></div>

        {/* Szklane panele dla efektu głębi */}
        <GlassPanel className="top-[10%] left-[5%] w-1/4 h-1/4" mousePosition={mousePosition} />
        <GlassPanel
          className="top-[50%] right-[8%] w-[20%] h-[30%]"
          mousePosition={mousePosition}
        />

        {/* Dodatkowe lampy teatralne ze środka */}
        <GlassPanel
          className="top-[30%] left-[10%] w-[15%] h-[20%]"
          mousePosition={mousePosition}
        />
        <GlassPanel
          className="top-[70%] right-[15%] w-[18%] h-[25%]"
          mousePosition={mousePosition}
        />

        {/* Koniec szklanych paneli */}

        <div className="pigeon-stage-lighting h-screen overflow-hidden">
          {/* Napis na górze */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
            style={{
              position: 'absolute',
              top: '3%',
              left: '40%',
              transform: `translate(-50%, -50%) translate(${mousePosition.x * 10}px, ${mousePosition.y * 5}px)`,
              zIndex: 25,
            }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl hero-title">
              Pałka MTM
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold drop-shadow-xl hero-subtitle">
              Mistrzowie Sprintu
            </h2>
          </motion.div>

          {/* Gołąb poniżej napisu */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3, delay: 6 }}
            style={{
              position: 'absolute',
              top: '45.5%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              perspective: '1000px', // Włącz perspektywę 3D
            }}
          >
            <motion.div
              className="flex items-center justify-center"
              style={{
                // Sprawia, że gołąb "patrzy" na kursor
                rotateY: mousePosition.x * 10,
                rotateX: mousePosition.y * -10,
                transformStyle: 'preserve-3d',
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              {/* Animowany GIF gołębia */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 2.5, ease: 'easeOut' }}
              >
                <Image
                  src="/pigeon.gif" // Zakładam, że plik GIF jest w folderze /public
                  alt="Animowany gołąb MTM Pałka"
                  width={120}
                  height={150}
                  className="object-contain max-w-[120px] max-h-[150px]"
                  priority // Dodaj priority dla LCP
                  unoptimized // Ważne dla animowanych GIFów, aby uniknąć optymalizacji do statycznego obrazu
                />
              </motion.div>
            </motion.div>
          </motion.section>
        </div>
      </UnifiedLayout>
    </div>
  );
}
