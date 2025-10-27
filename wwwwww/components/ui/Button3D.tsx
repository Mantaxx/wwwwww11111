'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Button3DProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  glow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function Button3D({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  glow = true,
  intensity = 'medium',
}: Button3DProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    glass: 'glass-morphism hover:glass-morphism-strong',
  };

  const intensityMap = {
    low: { scale: 1.02, y: -2 },
    medium: { scale: 1.05, y: -4 },
    high: { scale: 1.08, y: -6 },
  };

  const currentIntensity = intensityMap[intensity];

  const buttonClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${glow ? 'animate-glow3D' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover-3d-lift'}
    transform-3d perspective-1000
    ${className}
  `;

  const buttonContent = (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? {
              scale: currentIntensity.scale,
              y: currentIntensity.y,
              rotateX: 5,
              rotateY: 5,
            }
          : {}
      }
      whileTap={
        !disabled
          ? {
              scale: 0.98,
              y: 0,
            }
          : {}
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={buttonClasses}
    >
      <motion.span
        className="relative z-10"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={buttonClasses}
        whileHover={{
          scale: currentIntensity.scale,
          y: currentIntensity.y,
          rotateX: 5,
          rotateY: 5,
        }}
        whileTap={{
          scale: 0.98,
          y: 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        <motion.span
          className="relative z-10"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {children}
        </motion.span>
      </motion.a>
    );
  }

  return buttonContent;
}
