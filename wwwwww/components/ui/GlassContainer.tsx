'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'ultra' | 'gradient';
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  glow?: boolean;
  hover?: boolean;
}

export function GlassContainer({
  children,
  className = '',
  variant = 'default',
  blur = 'xl',
  glow = false,
  hover = true,
}: GlassContainerProps) {
  const variantClasses = {
    default: 'glass-morphism',
    strong: 'glass-morphism-strong',
    ultra: 'glass-morphism-ultra',
    gradient: 'card-gradient',
  };

  const blurClasses = {
    sm: '',
    md: '',
    lg: '',
    xl: '',
    '2xl': '',
    '3xl': '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -4,
              boxShadow: 'var(--shadow-glow-strong)',
            }
          : {}
      }
      transition={{
        initial: { duration: 0.6, ease: 'easeOut' },
        hover: { duration: 0.3, ease: 'easeOut' },
      }}
      className={`
        ${variantClasses[variant]}
        ${blurClasses[blur]}
        ${glow ? 'animate-glow3D' : ''}
        ${hover ? 'hover-3d-lift' : ''}
        transform-3d perspective-1000
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
