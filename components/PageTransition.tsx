'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Transition variants - can be customized
const variants = {
  // Fade transition
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  // Slide up transition
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  // Slide left transition
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  // Scale transition
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
  // Elegant blur transition
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
  },
};

// Default transition configuration
const defaultTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1] as const, // Smooth cubic bezier
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    // Skip animation on initial page load
    setIsFirstRender(false);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={isFirstRender ? false : variants.slideUp.initial}
        animate={variants.slideUp.animate}
        exit={variants.slideUp.exit}
        transition={defaultTransition}
        className="page-transition-wrapper"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Export variants for custom usage
export { variants, defaultTransition };
