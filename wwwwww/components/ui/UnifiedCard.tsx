'use client';

import { motion } from 'framer-motion';
import { memo, ReactNode } from 'react';

interface UnifiedCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | '3d' | 'floating' | 'gradient';
  glow?: boolean;
  hover?: boolean;
  delay?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export const UnifiedCard = memo(function UnifiedCard({
  children,
  className = '',
  variant = 'default',
  glow = false,
  hover = true,
  delay = 0,
  intensity = 'medium',
}: UnifiedCardProps) {
  const variantClasses = {
    default: 'card',
    glass: 'card-glass',
    '3d': 'card-3d',
    floating: 'card-floating',
    gradient: 'card-gradient',
  };

  const intensityMap = {
    low: { scale: 1.01, y: -2 },
    medium: { scale: 1.02, y: -4 },
    high: { scale: 1.05, y: -6 },
  };

  const currentIntensity = intensityMap[intensity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      whileHover={
        hover
          ? {
              scale: currentIntensity.scale,
              y: currentIntensity.y,
              rotateX: 5,
              rotateY: 5,
            }
          : {}
      }
      transition={{
        initial: { duration: 0.8, delay, type: 'spring', stiffness: 100 },
        hover: { duration: 0.3, type: 'spring', stiffness: 300 },
      }}
      className={`
        ${variantClasses[variant]}
        ${glow ? 'animate-glow3D' : ''}
        ${hover ? 'hover-3d-lift' : ''}
        transform-3d perspective-1000
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
});
