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
  md: { icon: 40, text: 'text-lg' },
  lg: { icon: 48, text: 'text-xl' },
  xl: { icon: 56, text: 'text-2xl' },
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  animate = true,
  className = ''
}: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* New Logo Icon - Star with sparkle */}
      <motion.div 
        className="relative flex-shrink-0"
        whileHover={animate ? { scale: 1.05 } : undefined}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <div 
          className="flex items-center justify-center rounded-xl bg-terracotta"
          style={{ width: icon, height: icon }}
        >
          <svg 
            width={icon * 0.6} 
            height={icon * 0.6} 
            viewBox="0 0 24 24" 
            fill="none"
            className="text-white"
          >
            {/* Main 4-point star */}
            <motion.path
              d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
              fill="currentColor"
              initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
            {/* Small sparkle/plus at top right */}
            <motion.g
              initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: animate ? 0.2 : 0 }}
            >
              <circle cx="19" cy="5" r="1" fill="currentColor" />
              <path d="M19 3V7M17 5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </motion.g>
          </svg>
        </div>
      </motion.div>
      
      {/* Brand text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif ${text} font-semibold text-text-dark tracking-tight leading-none`}>
            The Vybe Store
          </span>
          <span className="text-[9px] tracking-[0.2em] uppercase text-terracotta font-medium mt-0.5">
            by Neha Kumari
          </span>
        </div>
      )}
    </div>
  );
}

// Standalone icon for smaller uses (e.g., favicon, small buttons)
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div 
      className={`flex items-center justify-center rounded-xl bg-terracotta ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none"
        className="text-white"
      >
        {/* Main 4-point star */}
        <path
          d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
          fill="currentColor"
        />
        {/* Small sparkle/plus */}
        <circle cx="19" cy="5" r="1" fill="currentColor" />
        <path d="M19 3V7M17 5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
