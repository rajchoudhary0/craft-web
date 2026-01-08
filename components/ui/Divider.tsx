'use client';

import { motion } from 'framer-motion';

interface DividerProps {
  variant?: 'wave' | 'brush' | 'dots' | 'line';
  className?: string;
  color?: string;
}

export default function Divider({ 
  variant = 'wave', 
  className = '',
  color = 'currentColor' 
}: DividerProps) {
  const variants = {
    wave: (
      <svg 
        viewBox="0 0 400 20" 
        className={`w-full h-5 ${className}`}
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 10 Q50 0 100 10 T200 10 T300 10 T400 10"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.4 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </svg>
    ),
    brush: (
      <svg 
        viewBox="0 0 400 30" 
        className={`w-full h-8 ${className}`}
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 15 C30 10, 60 20, 100 15 S150 8, 200 15 S260 22, 300 15 S360 10, 400 15"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
        <motion.path
          d="M20 18 C50 12, 80 22, 120 16 S180 10, 220 18 S280 24, 320 16 S380 12, 400 18"
          stroke={color}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: 'easeInOut', delay: 0.3 }}
        />
      </svg>
    ),
    dots: (
      <div className={`flex items-center justify-center gap-3 py-4 ${className}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.4 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        ))}
      </div>
    ),
    line: (
      <div className={`flex items-center gap-4 ${className}`}>
        <motion.div 
          className="flex-1 h-px"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.svg 
          viewBox="0 0 20 20" 
          className="w-4 h-4"
          style={{ color }}
          initial={{ scale: 0, rotate: -45 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <path
            d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z"
            fill="currentColor"
            opacity="0.3"
          />
        </motion.svg>
        <motion.div 
          className="flex-1 h-px"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    ),
  };

  return variants[variant];
}
