'use client';

import { Review } from '@/lib/hooks/use-reviews';
import StarRating from '@/components/ui/StarRating';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const displayName = review.reviewer_name || review.user?.full_name || review.user?.email?.split('@')[0] || 'Anonymous';
  const initial = displayName.charAt(0).toUpperCase();
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-sand/50 rounded-xl p-5 hover:bg-sand/70 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-semibold">
            {initial}
          </div>
          {/* Name and Date */}
          <div>
            <p className="font-medium text-text-dark">{displayName}</p>
            <p className="text-xs text-text-muted">{formattedDate}</p>
          </div>
        </div>
        {/* Rating */}
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-text-dark mb-2">{review.title}</h4>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-text-muted leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
