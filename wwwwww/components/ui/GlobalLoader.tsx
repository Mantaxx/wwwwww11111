'use client';

import { Text3D } from '@/components/ui/Text3D';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface GlobalLoaderProps {
  isVisible: boolean;
  message?: string;
  variant?: 'minimal' | 'full' | 'overlay';
  progress?: number;
}

export function GlobalLoader({
  isVisible,
  message = 'Ładowanie...',
  variant = 'overlay',
  progress,
}: GlobalLoaderProps) {
  if (!isVisible) return null;

  const renderMinimal = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-4 right-4 z-50"
    >
      <UnifiedCard variant="glass" className="p-4 flex items-center space-x-3">
        <motion.div
          className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <Text3D variant="glow" intensity="low" className="text-sm">
          {message}
        </Text3D>
      </UnifiedCard>
    </motion.div>
  );

  const renderFull = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <UnifiedCard variant="3d" glow={false} className="p-8 text-center border-2 border-white/20">
        <motion.div
          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <Text3D variant="glow" intensity="medium" className="text-xl mb-4">
          {message}
        </Text3D>
        {progress !== undefined && (
          <div className="w-full max-w-xs mx-auto bg-gray-700/50 rounded-full h-2">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </UnifiedCard>
    </motion.div>
  );

  const renderOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <UnifiedCard
          variant="3d"
          glow={false}
          className="p-12 text-center border-2 border-white/30 shadow-2xl"
        >
          {/* Animowany spinner */}
          <div className="relative mb-8">
            <motion.div
              className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-amber-400 rounded-full mx-auto"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Tekst ładowania */}
          <Text3D variant="glow" intensity="high" className="text-2xl font-bold mb-2">
            {message}
          </Text3D>

          {/* Pasek postępu */}
          {progress !== undefined && (
            <div className="mt-6">
              <div className="w-full max-w-sm mx-auto bg-gray-700/50 rounded-full h-2 mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <Text3D variant="shimmer" intensity="low" className="text-sm">
                {Math.round(progress)}% ukończone
              </Text3D>
            </div>
          )}

          {/* Animowane kropki */}
          <motion.div
            className="flex justify-center space-x-1 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </UnifiedCard>
      </motion.div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {variant === 'minimal' && renderMinimal()}
          {variant === 'full' && renderFull()}
          {variant === 'overlay' && renderOverlay()}
        </>
      )}
    </AnimatePresence>
  );
}

// Hook do zarządzania globalnym loaderem
export function useGlobalLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Ładowanie...');
  const [progress, setProgress] = useState<number | undefined>(undefined);

  const showLoader = (msg?: string) => {
    setMessage(msg || 'Ładowanie...');
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setProgress(undefined);
  };

  const updateProgress = (prog: number) => {
    setProgress(prog);
  };

  return {
    isLoading,
    message,
    progress,
    showLoader,
    hideLoader,
    updateProgress,
  };
}
