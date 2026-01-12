'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Check, X, Trash2, Plus, Loader2, 
  Search
} from 'lucide-react';
import { useAdminReviews } from '@/lib/hooks/use-reviews';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';

export default function AdminReviewsPage() {
  const { 
    reviews, isLoading, error, 
    approveReview, rejectReview, deleteReview, createReview 
  } = useAdminReviews();
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? !review.is_approved :
      review.is_approved;
    
    const matchesSearch = searchQuery === '' || 
      review.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await approveReview(id);
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await rejectReview(id);
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setProcessingId(id);
    await deleteReview(id);
    setProcessingId(null);
  };

  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-dark flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-terracotta" />
            Reviews Management
          </h1>
          <p className="text-text-muted mt-1">
            {reviews.length} total reviews • {pendingCount} pending approval
          </p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Review
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-clay/20 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All', count: reviews.length },
            { value: 'pending', label: 'Pending', count: pendingCount },
            { value: 'approved', label: 'Approved', count: approvedCount },
          ].map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-terracotta text-white'
                  : 'bg-sand text-text-dark hover:bg-clay/20'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      {error ? (
        <div className="text-center py-12 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-sand/30 rounded-xl">
          <MessageSquare className="w-12 h-12 text-text-muted/50 mx-auto mb-3" />
          <p className="text-text-muted">No reviews found</p>
        </div>
      ) : (
        <div className="bg-cream rounded-xl border border-clay/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sand/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clay/10">
                {filteredReviews.map((review) => (
                  <motion.tr 
                    key={review.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-sand/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-text-dark line-clamp-1">
                        {review.product?.name || 'Unknown Product'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-text-muted">
                        {review.reviewer_name || review.user?.full_name || review.user?.email?.split('@')[0] || 'Anonymous'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StarRating value={review.rating} readonly size="sm" />
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      {review.title && (
                        <p className="font-medium text-text-dark text-sm line-clamp-1">{review.title}</p>
                      )}
                      {review.comment && (
                        <p className="text-text-muted text-sm line-clamp-2">{review.comment}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        review.is_approved 
                          ? 'bg-sage/20 text-sage-dark' 
                          : 'bg-gold/20 text-gold-dark'
                      }`}>
                        {review.is_approved ? (
                          <><Check className="w-3 h-3" /> Approved</>
                        ) : (
                          <>Pending</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">
                      {new Date(review.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {processingId === review.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                        ) : (
                          <>
                            {!review.is_approved && (
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="p-2 rounded-lg text-sage hover:bg-sage/10 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {review.is_approved && (
                              <button
                                onClick={() => handleReject(review.id)}
                                className="p-2 rounded-lg text-gold hover:bg-gold/10 transition-colors"
                                title="Unapprove"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Review Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateReviewModal 
            onClose={() => setShowCreateModal(false)}
            onCreate={createReview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Create Review Modal Component
function CreateReviewModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void; 
  onCreate: (productId: string, rating: number, title: string, comment: string, reviewerName: string, isApproved: boolean) => Promise<boolean>;
}) {
  const [reviewerName, setReviewerName] = useState('');
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isApproved, setIsApproved] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      if (!supabase) return;
      
      const { data } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      setProducts(data || []);
      setIsLoadingData(false);
    }
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewerName.trim() || !productId) {
      setError('Please enter reviewer name and select a product');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const success = await onCreate(productId, rating, title, comment, reviewerName.trim(), isApproved);
    
    if (success) {
      onClose();
    } else {
      setError('Failed to create review. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <motion.div
        className="relative bg-cream rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <h2 className="text-xl font-serif font-bold text-text-dark mb-4">Create Review</h2>
        
        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Reviewer Name *</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter customer name..."
                className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                required
              />
              <p className="text-xs text-text-muted mt-1">For in-person buyers or customers not in the system</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Product *</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                required
              >
                <option value="">Select a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Rating</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Review title..."
                className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Review comment..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-clay/20 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-approved"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="w-4 h-4 rounded border-clay/20 text-terracotta focus:ring-terracotta/30"
              />
              <label htmlFor="is-approved" className="text-sm text-text-dark">
                Approve immediately
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1"
                disabled={isSubmitting || !reviewerName.trim() || !productId}
                leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Creating...' : 'Create Review'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
