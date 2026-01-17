'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TemplateProps {
  children: ReactNode;
}

// Page transition animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
};

// Smooth easing for premium feel
const pageTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const, // Custom easing for elegant motion
};

export default function CustomerTemplate({ children }: TemplateProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="page-content"
    >
      {children}
    </motion.div>
  );
}
