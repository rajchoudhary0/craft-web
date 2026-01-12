'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { formatPrice } from '@/lib/data';
import Button from '@/components/ui/Button';

export default function CartDrawer() {
  const { items, isOpen, closeCart, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleMoveToWishlist = (item: typeof items[0]) => {
    addToWishlist(item.product);
    removeItem(item.product.id);
    setOpenMenuId(null);
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
    setOpenMenuId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-text-dark/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-cream shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-clay/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-terracotta" />
                <h2 id="cart-title" className="font-serif text-xl font-semibold text-text-dark">
                  Your Cart
                </h2>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 bg-terracotta text-cream text-sm rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <motion.button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-sand transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-text-dark" />
              </motion.button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-text-light" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-text-dark mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-text-muted mb-6">
                    Looks like you haven&apos;t added any handcrafted treasures yet.
                  </p>
                  <Button onClick={closeCart} variant="primary">
                    Start Shopping
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        className="flex gap-4 bg-sand/50 rounded-xl p-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
                        layout
                      >
                        {/* Product image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                          <Image
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.product.id}`}
                            onClick={closeCart}
                            className="font-serif font-medium text-text-dark hover:text-terracotta transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-text-muted">{item.product.category}</p>
                          <p className="text-terracotta font-semibold mt-1">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-end justify-between">
                        {/* Remove options menu */}
                        <div className="relative">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === item.product.id ? null : item.product.id);
                            }}
                            className={`p-2 rounded-full transition-all duration-200 ${
                              openMenuId === item.product.id 
                                ? 'bg-sand text-terracotta' 
                                : 'text-text-muted hover:bg-sand/50 hover:text-text-dark'
                            }`}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Remove options"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>

                          {/* Dropdown menu */}
                          <AnimatePresence>
                            {openMenuId === item.product.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.95, y: -10, filter: 'blur(4px)' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                                className="absolute right-0 top-10 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/20 ring-1 ring-black/5 overflow-hidden z-[70] w-52 origin-top-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleMoveToWishlist(item)}
                                  disabled={isInWishlist(item.product.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left text-text-dark hover:bg-sand/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:bg-sand/50"
                                >
                                  <div className={`p-1.5 rounded-full ${isInWishlist(item.product.id) ? 'bg-terracotta/10' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
                                    <Heart className={`w-3.5 h-3.5 ${isInWishlist(item.product.id) ? 'fill-terracotta text-terracotta' : 'text-text-muted'}`} />
                                  </div>
                                  <span className="font-medium">{isInWishlist(item.product.id) ? 'Saved' : 'Save for later'}</span>
                                </button>
                                <div className="h-px bg-gradient-to-r from-transparent via-clay/10 to-transparent" />
                                <button
                                  onClick={() => handleRemove(item.product.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left text-red-600 hover:bg-red-50/50 transition-all group active:bg-red-50"
                                >
                                  <div className="p-1.5 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </div>
                                  <span className="font-medium">Remove</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                          <div className="flex items-center gap-2 bg-cream rounded-full">
                            <motion.button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sand transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <motion.button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sand transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                className="border-t border-clay/20 p-6 bg-cream"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-lg font-semibold text-text-dark">{formatPrice(totalPrice)}</span>
                </div>

                {/* Shipping note */}
                <p className="text-sm text-text-muted text-center mb-4">
                  Shipping & taxes calculated at checkout
                </p>

                {/* Checkout button */}
                <Link href="/cart" onClick={closeCart}>
                  <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Continue shopping */}
                <button
                  onClick={closeCart}
                  className="w-full mt-3 py-3 text-center text-text-muted hover:text-terracotta transition-colors text-sm"
                >
                  Continue Shopping
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-clay/20">
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <svg className="w-4 h-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <svg className="w-4 h-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Handmade Quality
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

