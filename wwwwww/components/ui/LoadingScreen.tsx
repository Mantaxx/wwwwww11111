'use client';

import { Text3D } from '@/components/ui/Text3D';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'dots' | 'progress';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export function LoadingScreen({
  message = 'Ładowanie...',
  variant = 'spinner',
  size = 'medium',
  showProgress = false,
  progress = 0,
  className = '',
}: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (variant === 'dots') {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [variant]);

  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl',
  };

  const renderSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-gray-300 border-t-white rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  const renderPulse = () => (
    <motion.div
      className={`${sizeClasses[size]} bg-white rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-white rounded-full"
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
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-3 w-full max-w-xs">
      <motion.div
        className="h-4 bg-gray-300 rounded"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="h-4 bg-gray-300 rounded w-3/4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: 'easeInOut' }}
      />
      <motion.div
        className="h-4 bg-gray-300 rounded w-1/2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: 'easeInOut' }}
      />
    </div>
  );

  const renderProgress = () => (
    <div className="w-full max-w-xs">
      <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
        <motion.div
          className="bg-white h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <Text3D variant="glow" intensity="low" className="text-sm text-center">
        {progress}%
      </Text3D>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      case 'skeleton':
        return renderSkeleton();
      case 'progress':
        return renderProgress();
      default:
        return renderSpinner();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`min-h-screen flex items-center justify-center ${className}`}
    >
      <UnifiedCard
        variant="3d"
        glow={false}
        className="p-8 text-center border-2 border-white shadow-2xl"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          {renderLoader()}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Text3D variant="glow" intensity="medium" className={`${textSizeClasses[size]} mb-2`}>
            {message}
            {variant === 'dots' ? dots : ''}
          </Text3D>
        </motion.div>

        {showProgress && variant !== 'progress' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4"
          >
            <div className="w-full bg-gray-300 rounded-full h-1">
              <motion.div
                className="bg-white h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </UnifiedCard>
    </motion.div>
  );
}

// Komponent do ładowania z animacją sekwencyjną
export function SequentialLoadingScreen({
  steps = ['Inicjalizacja...', 'Ładowanie danych...', 'Przygotowywanie interfejsu...'],
  currentStep = 0,
  className = '',
}: {
  steps?: string[];
  currentStep?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex items-center justify-center ${className}`}
    >
      <UnifiedCard
        variant="3d"
        glow={false}
        className="p-8 text-center border-2 border-white shadow-2xl"
      >
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="h-12 w-12 border-4 border-gray-300 border-t-white rounded-full animate-spin mx-auto" />
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0,
              }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className={`flex items-center space-x-3 ${
                index === currentStep ? 'text-white' : 'text-gray-400'
              }`}
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-white' : 'bg-gray-500'
                }`}
                animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <Text3D
                variant="glow"
                intensity={index === currentStep ? 'medium' : 'low'}
                className="text-sm"
              >
                {step}
              </Text3D>
            </motion.div>
          ))}
        </div>
      </UnifiedCard>
    </motion.div>
  );
}
