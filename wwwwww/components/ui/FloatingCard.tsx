'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  intensity?: 'low' | 'medium' | 'high';
  glow?: boolean;
}

export function FloatingCard({
  children,
  className = '',
  delay = 0,
  intensity = 'medium',
  glow = true,
}: FloatingCardProps) {
  const intensityMap = {
    low: { y: 5, duration: 4 },
    medium: { y: 10, duration: 6 },
    high: { y: 15, duration: 8 },
  };

  const currentIntensity = intensityMap[intensity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
      }}
      transition={{
        initial: { duration: 0.8, delay, type: 'spring', stiffness: 100 },
        hover: { duration: 0.3, type: 'spring', stiffness: 300 },
      }}
      className={`
        relative transform-3d perspective-1000
        ${glow ? 'animate-glow3D' : ''}
        ${className}
      `}
    >
      <motion.div
        animate={{
          y: [0, -currentIntensity.y, 0],
          rotateX: [0, 2, 0],
          rotateY: [0, 1, 0],
        }}
        transition={{
          duration: currentIntensity.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="card-floating hover-3d-lift"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
