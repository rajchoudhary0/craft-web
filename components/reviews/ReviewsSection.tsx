'use client';

import { Review } from '@/lib/hooks/use-reviews';
import StarRating from '@/components/ui/StarRating';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { useProductReviews, useCanReview, ReviewStats } from '@/lib/hooks/use-reviews';
import { Loader2, MessageSquare, Star, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ReviewsSectionProps {
  productId: string;
  productRating?: number;
  reviewsCount?: number;
}

export default function ReviewsSection({ productId, productRating, reviewsCount }: ReviewsSectionProps) {
  const { reviews, stats, isLoading, refetch } = useProductReviews(productId);
  const { canReview, isLoading: checkingEligibility, isLoggedIn } = useCanReview(productId);

  // Use stats from API or fallback to props
  const displayRating = stats?.average_rating || productRating || 0;
  const displayCount = stats?.total_reviews || reviewsCount || 0;

  if (isLoading) {
    return (
      <section className="mt-16 pt-8 border-t border-clay/20">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 pt-8 border-t border-clay/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        {/* Title & Stats */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-text-dark mb-2 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-terracotta" />
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            <StarRating value={displayRating} readonly size="md" />
            <span className="text-lg font-semibold text-text-dark">{displayRating.toFixed(1)}</span>
            <span className="text-text-muted">({displayCount} review{displayCount !== 1 ? 's' : ''})</span>
          </div>
        </div>

        {/* Rating Breakdown */}
        {stats && displayCount > 0 && (
          <div className="flex-shrink-0 w-full md:w-auto md:min-w-[200px]">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.rating_breakdown[star.toString() as keyof typeof stats.rating_breakdown];
              const percentage = displayCount > 0 ? (count / displayCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-text-muted">{star}</span>
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  <div className="flex-1 h-2 bg-clay/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                    />
                  </div>
                  <span className="w-6 text-right text-text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Form or Login Prompt */}
      <div className="mb-8">
        {checkingEligibility ? (
          <div className="bg-sand/30 rounded-xl p-6 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-terracotta mx-auto" />
          </div>
        ) : canReview ? (
          <ReviewForm productId={productId} onSuccess={refetch} />
        ) : !isLoggedIn ? (
          <div className="bg-sand/30 rounded-xl p-6 text-center">
            <Lock className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted mb-3">Sign in to write a review</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="bg-sand/30 rounded-xl p-6 text-center">
            <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted">
              {reviews.some(r => r.user_id === '') 
                ? 'You have already reviewed this product.' 
                : 'Only customers who have purchased this item can write a review.'}
            </p>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-sand/20 rounded-xl">
          <MessageSquare className="w-12 h-12 text-text-muted/50 mx-auto mb-3" />
          <p className="text-text-muted">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}
    </section>
  );
}
