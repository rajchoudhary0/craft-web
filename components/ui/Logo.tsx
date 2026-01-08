'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 32, text: 'text-sm' },
  md: { icon: 48, text: 'text-xl' },
  lg: { icon: 64, text: 'text-2xl' },
  xl: { icon: 80, text: 'text-3xl' },
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  animate = true,
  className = ''
}: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Hand-drawn style logo mark */}
      <motion.div 
        className="relative flex-shrink-0"
        whileHover={animate ? { rotate: -5 } : undefined}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <svg width={icon} height={icon} viewBox="0 0 48 48" className="text-terracotta">
          {/* Outer irregular circle */}
          <motion.path
            d="M24 4 C32 4 42 10 44 20 C46 30 38 42 26 44 C14 46 4 38 4 26 C4 14 14 4 24 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          {/* Inner V shape */}
          <motion.path
            d="M16 18 L24 30 L32 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: animate ? 0.5 : 0 }}
          />
          {/* Decorative dots */}
          <circle cx="24" cy="14" r="2" fill="var(--gold)" />
          <circle cx="18" cy="36" r="1.5" fill="var(--sage)" />
          <circle cx="32" cy="34" r="1.5" fill="var(--sage)" />
        </svg>
      </motion.div>
      
      {/* Brand text */}
      {showText && (
        <div>
          <h1 className={`font-display ${text} font-semibold text-text-dark tracking-tight leading-none`}>
            The Vybe Store
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <svg width="24" height="6" viewBox="0 0 24 6">
              <motion.path
                d="M0 3 Q6 0 12 3 T24 3"
                stroke="var(--terracotta)"
                strokeWidth="1.5"
                fill="none"
                initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: animate ? 0.3 : 0 }}
              />
            </svg>
            <span className="text-[10px] tracking-[0.15em] uppercase text-text-muted font-medium">
              Neha Kumari
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone icon for smaller uses
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={`text-terracotta ${className}`}>
      <path
        d="M24 4 C32 4 42 10 44 20 C46 30 38 42 26 44 C14 46 4 38 4 26 C4 14 14 4 24 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 18 L24 30 L32 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="14" r="2" fill="var(--gold)" />
      <circle cx="18" cy="36" r="1.5" fill="var(--sage)" />
      <circle cx="32" cy="34" r="1.5" fill="var(--sage)" />
    </svg>
  );
}
