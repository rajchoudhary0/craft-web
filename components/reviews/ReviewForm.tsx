'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import { useSubmitReview } from '@/lib/hooks/use-reviews';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { submitReview, isSubmitting, error } = useSubmitReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      return;
    }

    const success = await submitReview(productId, rating, title, comment);
    
    if (success) {
      setShowSuccess(true);
      setRating(0);
      setTitle('');
      setComment('');
      onSuccess?.();
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sage/10 border border-sage/20 rounded-xl p-6 text-center"
      >
        <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="font-semibold text-text-dark mb-1">Thank you for your review!</h4>
        <p className="text-sm text-text-muted">Your review will be visible after approval.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-sand/30 rounded-xl p-6">
      <h4 className="font-serif font-semibold text-lg text-text-dark mb-4">
        Write a Review
      </h4>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-dark mb-2">
          Your Rating <span className="text-terracotta">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating === 0 && (
          <p className="text-xs text-text-muted mt-1">Click to rate</p>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="review-title" className="block text-sm font-medium text-text-dark mb-2">
          Title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="review-comment" className="block text-sm font-medium text-text-dark mb-2">
          Your Review (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors resize-none"
          maxLength={1000}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        disabled={rating === 0 || isSubmitting}
        leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
