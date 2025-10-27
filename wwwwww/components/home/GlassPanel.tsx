'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassPanelProps {
  children?: ReactNode;
  className?: string;
  mousePosition: { x: number; y: number };
}

export const GlassPanel = ({ children, className, mousePosition }: GlassPanelProps) => {
  return (
    <div className={`glass-panel ${className}`}>
      {children}
      <motion.div
        className="glass-shine"
        style={{
          left: `${(mousePosition.x + 1) * 50}%`,
          top: `${(mousePosition.y + 1) * 50}%`,
        }}
      />
    </div>
  );
};
