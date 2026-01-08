import type { Variants } from 'framer-motion';

// Custom easing
const easeOut = [0.25, 0.1, 0.25, 1] as const;

// Animation variants for Framer Motion
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

export const slideInRight: Variants = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
};

export const slideInLeft: Variants = {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
};

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

export const staggerContainerFast: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
};

export const staggerContainerSlow: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

export const letterStagger: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.03,
        },
    },
};

export const letterFadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export const cardHover: Variants = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 4px 20px rgba(45, 42, 38, 0.08)',
    },
    hover: {
        scale: 1.02,
        y: -8,
        boxShadow: '0 16px 40px rgba(45, 42, 38, 0.16)',
    },
};

export const imageHover: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
};

export const buttonHover: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
};

// Transition presets
export const springTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
};

export const smoothTransition = {
    duration: 0.5,
    ease: easeOut,
};

export const slowTransition = {
    duration: 0.8,
    ease: easeOut,
};

export const fastTransition = {
    duration: 0.3,
    ease: easeOut,
};

// Page transitions
export const pageTransition: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.4, ease: 'easeOut' }
    },
};

// Scroll reveal variants
export const scrollReveal: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    },
};

export const scrollRevealLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    },
};

export const scrollRevealRight: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    },
};

export const scrollRevealScale: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    },
};
