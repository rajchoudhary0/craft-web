'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreSettings } from '@/lib/store-context';

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const settings = useStoreSettings();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'exiting' | 'done'>('loading');
  const [mounted, setMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);

  // Check sessionStorage only after component mounts (client-side)
  useEffect(() => {
    setMounted(true);
    
    // Check if already shown this session
    const hasVisited = sessionStorage.getItem('splashShown');
    if (hasVisited) {
      setShouldShow(false);
      onComplete?.();
    } else {
      setShouldShow(true);
    }
  }, []);

  // Progress animation - only runs when shouldShow is true
  useEffect(() => {
    if (shouldShow !== true) return;

    const duration = 2500; // 2.5 seconds
    const interval = 25;
    const increment = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [shouldShow]);

  // Handle completion
  useEffect(() => {
    if (progress >= 100 && phase === 'loading') {
      // Wait at 100%, then start exit
      const timeout = setTimeout(() => {
        setPhase('exiting');
        sessionStorage.setItem('splashShown', 'true');
        
        // After exit animation, mark complete
        setTimeout(() => {
          setPhase('done');
          onComplete?.();
        }, 700);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [progress, phase, onComplete]);

  // Don't render anything until we've checked sessionStorage
  if (!mounted || shouldShow === null) return null;
  
  // Skip if already shown
  if (!shouldShow) return null;
  
  // Skip if animation is done
  if (phase === 'done') return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="splash"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-cream dark:bg-[var(--background)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-terracotta/5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-sage/5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
            />
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Animated Logo */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Logo container with pulsing glow */}
              <motion.div
                className="relative rounded-2xl"
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(196, 107, 83, 0)',
                    '0 0 60px 15px rgba(196, 107, 83, 0.25)',
                    '0 0 0 0 rgba(196, 107, 83, 0)',
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center shadow-2xl">
                  <motion.svg 
                    width="55%" 
                    height="55%" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className="text-white"
                  >
                    {/* Main 4-point star */}
                    <motion.path
                      d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
                      fill="currentColor"
                      initial={{ scale: 0, opacity: 0, rotate: -180 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {/* Sparkle */}
                    <motion.g
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <circle cx="19" cy="5" r="1.2" fill="currentColor" />
                      <motion.path 
                        d="M19 2.5V7.5M16.5 5H21.5" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                      />
                    </motion.g>
                  </motion.svg>
                </div>
              </motion.div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            >
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-text-dark tracking-tight">
                {settings?.store_name || "The Vybe Store"}
              </h1>
              <motion.p 
                className="text-xs sm:text-sm tracking-[0.3em] uppercase text-terracotta font-medium mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {settings?.tagline || "by Raj Choudhary"}
              </motion.p>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              className="w-56 sm:w-72"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {/* Progress bar */}
              <div className="relative h-1.5 bg-clay/15 rounded-full overflow-hidden mb-5">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-terracotta via-terracotta to-terracotta-dark rounded-full"
                  style={{ width: `${progress}%` }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Percentage counter */}
              <motion.div 
                className="flex justify-center items-baseline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <span className="font-mono text-4xl sm:text-5xl font-extralight text-text-dark tabular-nums tracking-tight">
                  {Math.floor(progress)}
                </span>
                <span className="text-terracotta text-2xl sm:text-3xl font-light ml-0.5">%</span>
              </motion.div>
            </motion.div>

            {/* Loading text */}
            <motion.p
              className="text-text-muted/70 text-sm mt-8 tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Preparing your experience...
            </motion.p>
          </div>
      </motion.div>
    </AnimatePresence>
  );
}
