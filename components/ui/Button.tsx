'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';
import { buttonHover } from '@/lib/animations';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      fullWidth, // Destructure to prevent passing to DOM
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2
      font-medium rounded-full transition-all duration-300
      focus-ring disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden
    `;

    const variants = {
      primary: `
        bg-terracotta text-cream
        hover:bg-terracotta-dark
        shadow-md hover:shadow-lg
      `,
      secondary: `
        bg-sage text-cream
        hover:bg-sage-dark
        shadow-md hover:shadow-lg
      `,
      outline: `
        bg-transparent border-2 border-terracotta text-terracotta
        hover:bg-terracotta hover:text-cream
      `,
      ghost: `
        bg-transparent text-text-dark
        hover:bg-sand
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        variants={buttonHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Ripple effect container */}
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="ripple-effect" />
        </span>
        
        {isLoading ? (
          <motion.span
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className="relative z-10">{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
