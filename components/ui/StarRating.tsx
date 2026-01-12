'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const isFilled = star <= value;
        const isHalf = star === Math.ceil(value) && value % 1 !== 0;

        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            disabled={readonly}
            className={`relative ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            whileHover={readonly ? {} : { scale: 1.2 }}
            whileTap={readonly ? {} : { scale: 0.9 }}
          >
            {/* Empty star */}
            <Star
              className={`${sizeClasses[size]} text-clay/30`}
              strokeWidth={1.5}
            />
            {/* Filled star overlay */}
            {(isFilled || isHalf) && (
              <Star
                className={`${sizeClasses[size]} absolute inset-0 text-gold fill-gold`}
                strokeWidth={1.5}
                style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
              />
            )}
          </motion.button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm text-text-muted">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
