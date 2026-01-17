'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useOrder } from '@/lib/hooks/use-orders';
import { useAuth } from '@/lib/auth-context';
import { ChevronLeft, Package, MapPin, CreditCard, Calendar, Clock, AlertCircle, X, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { AlertModal } from '@/components/ui/Modal';

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { order, isLoading, error, refetch } = useOrder(id);
  const { user } = useAuth();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string } | null>(null);
  const supabase = createClient();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user && !localStorage.getItem('demoAdminUser')) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'paid': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const { error } = await supabase.rpc('cancel_order', { p_order_id: order.id });
      if (error) throw error;
      
      // Close modal and refresh data
      setShowCancelModal(false);
      refetch(); 
    } catch (error) {
      console.error('Error cancelling order:', error);
      setAlertModal({ title: 'Error', message: 'Failed to cancel order. Please try again.' });
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen pt-32 pb-20 flex justify-center bg-cream dark:bg-[var(--background)]">
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (error || !order) {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 bg-cream dark:bg-[var(--background)]">
            <div className="max-w-3xl mx-auto text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-serif text-text-dark mb-2">Order not found</h1>
                <p className="text-text-muted mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
                <Link href="/account" className="text-terracotta hover:underline font-medium">
                    &larr; Back to My Orders
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-cream dark:bg-[var(--background)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <Link 
                href="/account"
                className="inline-flex items-center gap-2 text-text-muted hover:text-terracotta transition-colors mb-4"
            >
                <ChevronLeft className="w-4 h-4" /> Back to Orders
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-text-dark mb-2">Order #{order.id.slice(0, 8)}</h1>
                    <p className="text-text-muted flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Placed on {formatDate(order.created_at)}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-medium capitalize flex items-center gap-2 ${getStatusColor(order.status)}`}>
                    {order.status === 'processing' && <Clock className="w-4 h-4" />}
                    {order.status === 'delivered' && <Package className="w-4 h-4" />}
                    {order.status}
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="md:col-span-2 space-y-6">
                {/* Items */}
                <div className="bg-white dark:bg-[var(--background-alt)] rounded-2xl p-6 shadow-sm border border-clay/10 dark:border-white/10">
                    <h2 className="font-serif text-xl font-medium text-text-dark mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-terracotta" /> Order Items
                    </h2>
                    <div className="space-y-6">
                        {order.items.map((item) => (
                            <Link 
                                key={item.id} 
                                href={item.product_id ? `/products/${item.product_id}` : '#'}
                                className={`flex gap-4 group ${!item.product_id ? 'pointer-events-none' : ''} p-2 -mx-2 rounded-xl hover:bg-sand/30 transition-colors`}
                            >
                                <div className="relative w-20 h-20 bg-sand rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                    {(item.product?.images?.[0] || false) ? (
                                        <Image 
                                            src={typeof item.product!.images![0] === 'string' ? item.product!.images![0] : ((item.product!.images![0] as any).image_url || '')} 
                                            alt={item.product?.name || item.product_name || 'Product'} 
                                            fill 
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-sand text-text-muted text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="font-medium text-text-dark mb-1 group-hover:text-terracotta transition-colors truncate flex items-center gap-2">
                                        {item.product?.name || item.product_name || 'Unknown Product'}
                                        <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-terracotta" />
                                    </h3>
                                    <p className="text-sm text-text-muted mb-1">Qty: {item.quantity}</p>
                                    <p className="font-medium text-terracotta">{formatPrice(item.price_at_purchase)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Order Status Timeline */}
                <div className="bg-white dark:bg-[var(--background-alt)] rounded-2xl p-6 shadow-sm border border-clay/10 dark:border-white/10">
                    <h2 className="font-serif text-xl font-medium text-text-dark mb-6">Order Status</h2>
                    <div className="relative">
                        <div className="space-y-0">
                            {(order.status_history && order.status_history.length > 0) ? (
                                [...order.status_history]
                                    .filter(entry => entry.is_visible_to_user !== false)
                                    .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())
                                    .map((entry, index, arr) => {
                                        const isLatest = index === arr.length - 1;
                                        const isFirst = index === 0;
                                        const statusConfig = {
                                            pending: { color: 'bg-amber-500', icon: Clock },
                                            processing: { color: 'bg-blue-500', icon: Package },
                                            shipped: { color: 'bg-purple-500', icon: Package },
                                            delivered: { color: 'bg-green-500', icon: Package },
                                            cancelled: { color: 'bg-red-500', icon: AlertCircle },
                                        }[entry.status] || { color: 'bg-gray-400', icon: Clock };

                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <div key={entry.id} className="relative flex gap-4">
                                                {/* Timeline Column */}
                                                <div className="flex flex-col items-center">
                                                    {/* Dot with icon */}
                                                    <div className={`relative z-10 w-10 h-10 rounded-full ${statusConfig.color} flex items-center justify-center shadow-md ${isLatest ? 'ring-4 ring-white dark:ring-[var(--background-alt)] shadow-lg scale-110' : ''}`}>
                                                        <StatusIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    {/* Connecting line - only show if not last */}
                                                    {!isLatest && (
                                                        <div className="w-0.5 flex-1 min-h-[24px] bg-gradient-to-b from-clay/30 to-clay/10" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className={`flex-1 pb-6 ${isLatest ? 'pb-0' : ''}`}>
                                                    <div className={`p-4 rounded-xl transition-all ${isLatest ? 'bg-gradient-to-r from-sand/80 to-sand/40 border border-terracotta/20 shadow-sm' : 'hover:bg-sand/30'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <p className={`font-semibold capitalize ${isLatest ? 'text-text-dark text-lg' : 'text-text-muted'}`}>
                                                                {entry.status}
                                                            </p>
                                                            {isLatest && (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-terracotta/10 text-terracotta rounded-full">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-text-muted mt-1">
                                                            {new Date(entry.changed_at).toLocaleDateString('en-IN', {
                                                                weekday: 'short',
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {entry.notes && (
                                                            <p className="text-xs text-text-muted mt-2 italic bg-white/50 dark:bg-black/10 px-2 py-1 rounded">
                                                                "{entry.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                // Fallback if no history yet
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center shadow-md ring-4 ring-white dark:ring-[var(--background-alt)]">
                                        <Package className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 p-4 rounded-xl bg-gradient-to-r from-sand/80 to-sand/40 border border-terracotta/20">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-text-dark text-lg capitalize">{order.status}</p>
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-terracotta/10 text-terracotta rounded-full">
                                                Current
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted mt-1">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white dark:bg-[var(--background-alt)] rounded-2xl p-6 shadow-sm border border-clay/10 dark:border-white/10">
                    <h2 className="font-serif text-xl font-medium text-text-dark mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-terracotta" /> Shipping Address
                    </h2>
                    {order.shipping_address ? (
                        <div className="text-sm text-text-muted space-y-1">
                            <p className="font-medium text-text-dark text-base mb-2">{order.shipping_address.full_name}</p>
                            <p>{order.shipping_address.address_line1}</p>
                            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                            <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}</p>
                            <p className="mt-2">{order.shipping_address.phone}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted">No address details available.</p>
                    )}
                </div>

                {/* Payment Summary */}
                <div className="bg-white dark:bg-[var(--background-alt)] rounded-2xl p-6 shadow-sm border border-clay/10 dark:border-white/10">
                    <h2 className="font-serif text-xl font-medium text-text-dark mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-terracotta" /> Payment Summary
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-text-muted">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.total_amount + (order.discount_amount || 0))}</span>
                        </div>
                        <div className="flex justify-between text-text-muted">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-{formatPrice(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="border-t border-clay/10 pt-3 flex justify-between font-medium text-lg text-text-dark">
                            <span>Total</span>
                            <span>{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-clay/10 text-xs text-text-muted flex justify-between">
                         <span>Payment Method</span>
                         <span className="font-medium text-text-dark">Date</span>
                    </div>
                </div>

                {/* Actions */}
                {order.status === 'pending' && (
                    <button 
                        className="w-full py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                        onClick={() => setShowCancelModal(true)}
                    >
                        Cancel Order
                    </button>
                )}
                
                <Link 
                    href="/contact"
                    className="block w-full py-3 text-center border border-clay/20 text-text-dark rounded-xl hover:bg-sand transition-colors font-medium mt-4"
                >
                    Need Help?
                </Link>
            </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !cancelling && setShowCancelModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-[var(--background-alt)] rounded-2xl p-6 max-w-sm w-full shadow-xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif font-bold text-text-dark">Cancel Order?</h3>
                <button 
                  onClick={() => setShowCancelModal(false)} 
                  className="p-2 hover:bg-sand rounded-lg"
                  disabled={cancelling}
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              
              <p className="text-text-muted mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 py-2.5 border border-clay/20 text-text-dark rounded-xl hover:bg-sand transition-colors font-medium disabled:opacity-50"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal !== null}
        onClose={() => setAlertModal(null)}
        title={alertModal?.title || ''}
        message={alertModal?.message || ''}
        variant="error"
      />
    </div>
  );
}
