'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  reviewer_name: string | null;
  is_approved: boolean;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string | null;
  };
  product?: {
    name: string;
  };
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

// Hook to fetch approved reviews for a product
export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchReviews = useCallback(async () => {
    if (!productId || !supabase) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch approved reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (reviewsData && reviewsData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(reviewsData.map((r: { user_id: string }) => r.user_id))];

        // Fetch profiles for these users
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        // Create lookup map
        const profilesMap = new Map(profilesData?.map((p: { id: string; full_name: string | null; email: string | null }) => [p.id, p]) || []);

        // Enrich reviews with user data
        const enrichedReviews = reviewsData.map((review: { user_id: string;[key: string]: unknown }) => ({
          ...review,
          user: profilesMap.get(review.user_id) || null,
        }));

        setReviews(enrichedReviews);
      } else {
        setReviews([]);
      }

      // Calculate stats manually since RPC might not exist yet
      if (reviewsData) {
        const ratings: number[] = reviewsData.map((r: { rating: number }) => r.rating);
        const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

        setStats({
          average_rating: Number(avgRating.toFixed(1)),
          total_reviews: ratings.length,
          rating_breakdown: {
            '5': ratings.filter((r: number) => r === 5).length,
            '4': ratings.filter((r: number) => r === 4).length,
            '3': ratings.filter((r: number) => r === 3).length,
            '2': ratings.filter((r: number) => r === 2).length,
            '1': ratings.filter((r: number) => r === 1).length,
          }
        });
      }
    } catch (err) {
      // Error fetching reviews
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [productId, supabase]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, stats, isLoading, error, refetch: fetchReviews };
}

// Hook to check if current user can review a product
export function useCanReview(productId: string) {
  const [canReview, setCanReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function checkCanReview() {
      if (!user || !productId || !supabase) {
        setCanReview(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('can_review_product', { p_product_id: productId });

        if (error) throw error;
        setCanReview(data === true);
      } catch (err) {
        // Error checking review eligibility
        setCanReview(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkCanReview();
  }, [user, productId, supabase]);

  return { canReview, isLoading, isLoggedIn: !!user };
}

// Hook to submit a review
export function useSubmitReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const submitReview = async (
    productId: string,
    rating: number,
    title: string,
    comment: string
  ): Promise<boolean> => {
    if (!user || !supabase) {
      setError('You must be logged in to submit a review');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          rating,
          title: title || null,
          comment: comment || null,
          is_approved: false, // Reviews need admin approval
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You have already reviewed this product');
        } else {
          throw insertError;
        }
        return false;
      }

      return true;
    } catch (err) {
      // Error submitting review
      setError('Failed to submit review. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitReview, isSubmitting, error };
}

// Hook for admin to manage all reviews
export function useAdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchReviews = useCallback(async () => {
    if (!supabase) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch reviews first
      const { data: reviewsData, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Get unique user and product IDs
      const userIds = [...new Set(reviewsData.map((r: { user_id: string }) => r.user_id))];
      const productIds = [...new Set(reviewsData.map((r: { product_id: string }) => r.product_id))];

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      // Create lookup maps
      const profilesMap = new Map(profilesData?.map((p: { id: string; full_name: string | null; email: string | null }) => [p.id, p]) || []);
      const productsMap = new Map(productsData?.map((p: { id: string; name: string }) => [p.id, p]) || []);

      // Enrich reviews with user and product data
      const enrichedReviews = reviewsData.map((review: { user_id: string; product_id: string;[key: string]: unknown }) => ({
        ...review,
        user: profilesMap.get(review.user_id) || null,
        product: productsMap.get(review.product_id) || null,
      }));

      setReviews(enrichedReviews);
    } catch (err) {
      // Error fetching admin reviews
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const approveReview = async (reviewId: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReviews();
      return true;
    } catch (err) {
      // Error approving review
      return false;
    }
  };

  const rejectReview = async (reviewId: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReviews();
      return true;
    } catch (err) {
      // Error rejecting review
      return false;
    }
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReviews();
      return true;
    } catch (err) {
      // Error deleting review
      return false;
    }
  };

  const createReview = async (
    productId: string,
    rating: number,
    title: string,
    comment: string,
    reviewerName: string,
    isApproved: boolean = true
  ): Promise<boolean> => {
    if (!supabase) return false;

    try {
      // Try to get user from session first
      const { data: { session } } = await supabase.auth.getSession();
      const realUserId = session?.user?.id;

      // Check if in demo mode
      let isDemoMode = false;
      if (!realUserId && typeof window !== 'undefined') {
        const demoUser = localStorage.getItem('demoAdminUser');
        isDemoMode = !!demoUser;
      }

      // Build insert data - try without user_id if in demo mode (requires migration)
      const insertData: Record<string, unknown> = {
        product_id: productId,
        rating,
        title: title || null,
        comment: comment || null,
        is_approved: isApproved,
      };

      // Only include user_id if we have a real UUID
      if (realUserId) {
        insertData.user_id = realUserId;
      }
      // For demo mode, try with reviewer_name column (requires migration)
      if (isDemoMode) {
        insertData.reviewer_name = reviewerName;
      }

      const { error } = await supabase
        .from('reviews')
        .insert(insertData);

      if (error) {
        // Check if it's a missing column or NOT NULL constraint error
        if (error.message?.includes('reviewer_name') || error.message?.includes('user_id')) {
          // Migration required for reviewer_name column
          throw new Error('Database migration required. Run lib/supabase/add_reviewer_name.sql in Supabase SQL Editor.');
        }
        throw error;
      }

      await fetchReviews();
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string; details?: string };
      // Error creating review
      return false;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    isLoading,
    error,
    refetch: fetchReviews,
    approveReview,
    rejectReview,
    deleteReview,
    createReview,
  };
}
