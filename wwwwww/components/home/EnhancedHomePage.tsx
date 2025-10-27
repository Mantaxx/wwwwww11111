'use client';

import { Button3D } from '@/components/ui/Button3D';
import { FloatingCard } from '@/components/ui/FloatingCard';
import { GlassContainer } from '@/components/ui/GlassContainer';
import { Text3D } from '@/components/ui/Text3D';
import { motion } from 'framer-motion';
import { Award, Star, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Star,
    title: 'Legendarne Championy',
    description: 'Najlepsze gołębie z linii MTM Pałka',
    delay: 0.1,
  },
  {
    icon: Award,
    title: 'Ekskluzywne Aukcje',
    description: 'Unikatowe okazy dostępne tylko u nas',
    delay: 0.2,
  },
  {
    icon: Users,
    title: 'Społeczność Hodowców',
    description: 'Dołącz do elitarnego grona hodowców',
    delay: 0.3,
  },
  {
    icon: Zap,
    title: 'Nowoczesne Metody',
    description: 'Najnowsze technologie w hodowli',
    delay: 0.4,
  },
];

export function EnhancedHomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced 3D Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 xl:w-[32rem] xl:h-[32rem] 2xl:w-[40rem] 2xl:h-[40rem] bg-slate-500/20 rounded-full blur-3xl xl:blur-[4rem] 2xl:blur-[6rem] animate-float3D"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 xl:w-[28rem] xl:h-[28rem] 2xl:w-[36rem] 2xl:h-[36rem] bg-slate-400/20 rounded-full blur-3xl xl:blur-[4rem] 2xl:blur-[6rem] animate-float3D animate-delay-3s"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96 bg-gradient-to-r from-slate-400/30 to-slate-300/30 rounded-full blur-2xl xl:blur-[3rem] 2xl:blur-[4rem] animate-morph3D"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 xl:py-20 2xl:py-24">
        {/* Hero Section with 3D Effects */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <Text3D
            variant="neon"
            intensity="high"
            className="text-6xl md:text-8xl xl:text-9xl font-bold mb-6"
          >
            MTM Pałka
          </Text3D>

          <Text3D
            variant="gradient"
            intensity="medium"
            className="text-2xl md:text-4xl xl:text-5xl mb-8"
          >
            Mistrzowie Sprintu
          </Text3D>

          <GlassContainer
            variant="ultra"
            className="max-w-6xl mx-auto p-8 xl:p-12 2xl:p-16 mb-12"
            glow={false}
          >
            <p className="text-lg md:text-xl xl:text-2xl text-white/90 leading-relaxed">
              Pasja, tradycja i nowoczesność w hodowli gołębi pocztowych. Tworzymy historię
              polskiego sportu gołębiarskiego poprzez doskonałą hodowlę i nieustanne dążenie do
              perfekcji.
            </p>
          </GlassContainer>

          <div className="flex flex-wrap justify-center gap-4 xl:gap-6 2xl:gap-8">
            <Button3D
              variant="primary"
              size="lg"
              intensity="high"
              glow={false}
              className="mr-4 xl:mr-6 2xl:mr-8 xl:text-lg 2xl:text-xl xl:px-8 2xl:px-12 xl:py-4 2xl:py-6"
            >
              Zobacz Championy
            </Button3D>
            <Button3D
              variant="glass"
              size="lg"
              intensity="medium"
              className="xl:text-lg 2xl:text-xl xl:px-8 2xl:px-12 xl:py-4 2xl:py-6"
            >
              Ekskluzywne Aukcje
            </Button3D>
          </div>
        </motion.div>

        {/* Features Grid with 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-8 xl:gap-12 2xl:gap-16 mb-20 xl:mb-24 2xl:mb-32">
          {features.map(feature => (
            <FloatingCard
              key={feature.title}
              delay={feature.delay}
              intensity="medium"
              glow={false}
              className="h-full"
            >
              <div className="text-center p-8 xl:p-10 2xl:p-12">
                <motion.div
                  whileHover={{ rotateY: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 xl:w-24 xl:h-24 2xl:w-28 2xl:h-28 mx-auto mb-6 glass-morphism rounded-full flex items-center justify-center"
                >
                  <feature.icon className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 text-blue-400 animate-glow3D" />
                </motion.div>

                <Text3D
                  variant="glow"
                  intensity="medium"
                  className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-4 block"
                >
                  {feature.title}
                </Text3D>

                <p className="text-white/80 text-base xl:text-lg 2xl:text-xl leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </FloatingCard>
          ))}
        </div>

        {/* Call to Action with 3D Effects */}
        <GlassContainer
          variant="gradient"
          className="max-w-6xl mx-auto p-12 xl:p-16 2xl:p-20 text-center"
          glow={false}
        >
          <Text3D
            variant="neon"
            intensity="high"
            className="text-4xl md:text-6xl xl:text-7xl font-bold mb-6"
          >
            Dołącz do Elity
          </Text3D>

          <p className="text-xl xl:text-2xl text-white/90 mb-8 leading-relaxed">
            Stań się częścią największej społeczności hodowców gołębi pocztowych w Polsce
          </p>

          <div className="flex flex-wrap justify-center gap-6 xl:gap-8 2xl:gap-10">
            <Button3D
              variant="primary"
              size="lg"
              intensity="high"
              glow={false}
              className="xl:text-lg 2xl:text-xl xl:px-8 2xl:px-12 xl:py-4 2xl:py-6"
            >
              Rozpocznij Hodowlę
            </Button3D>
            <Button3D
              variant="outline"
              size="lg"
              intensity="medium"
              className="xl:text-lg 2xl:text-xl xl:px-8 2xl:px-12 xl:py-4 2xl:py-6"
            >
              Dowiedz się Więcej
            </Button3D>
          </div>
        </GlassContainer>
      </div>
    </div>
  );
}
