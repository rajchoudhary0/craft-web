'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Tag, Gift, AlertCircle, Heart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { formatPrice } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import Button from '@/components/ui/Button';

import { useState, useEffect } from 'react';

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, discount, finalPrice, giftCard, applyGiftCard, removeGiftCard, isPartialDiscount } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  // Unified Code Handler
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCode = async () => {
    if (!code) return;
    setIsApplying(true);
    setMsg('');

    // 1. Try Coupon First
    const couponRes = await applyCoupon(code);
    if (couponRes.success) {
      setMsg(couponRes.message);
      setCode('');
      setIsApplying(false);
      return;
    }

    // 2. Try Gift Card if Coupon Failed
    // (Only if error wasn't "already applied" etc, but simpler to just try)
    const giftRes = await applyGiftCard(code);
    if (giftRes.success) {
      setMsg(giftRes.message);
      setCode('');
    } else {
      // Both failed
      setMsg('Invalid coupon or gift card code');
    }
    
    setIsApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container-custom">
          <motion.div
            className="max-w-md mx-auto text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-text-light" />
            </div>
            <h1 className="heading-md text-text-dark mb-4">Your Cart is Empty</h1>
            <p className="text-text-muted mb-8">
              Looks like you haven't added any handcrafted treasures to your cart yet.
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1 
            className="heading-lg text-text-dark mb-2"
            variants={fadeInUp}
          >
            Shopping Cart
          </motion.h1>
          <motion.p 
            className="text-text-muted"
            variants={fadeInUp}
          >
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              className="space-y-4"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  className="flex gap-4 md:gap-6 bg-cream rounded-2xl p-4 md:p-6"
                  variants={fadeInUp}
                  layout
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-sand">
                      <Image
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200'}
                        alt={item.product.name}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                          {item.product.category}
                        </p>
                        <Link 
                          href={`/products/${item.product.id}`}
                          className="font-serif font-semibold text-text-dark hover:text-terracotta transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                      </div>
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
                          <Trash2 className="w-5 h-5" />
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
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 bg-sand rounded-full px-2 py-1">
                        <motion.button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-clay/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <motion.button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-clay/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-terracotta">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-text-muted">
                            {formatPrice(item.product.price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Continue Shopping */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-clay/20">
              <Link 
                href="/products"
                className="flex items-center gap-2 text-text-muted hover:text-terracotta transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-sm text-text-light hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <motion.div
              className="bg-cream rounded-2xl p-6 sticky top-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-serif text-xl font-semibold text-text-dark mb-6">
                Order Summary
              </h2>

              {/* Promo Code */}
              {/* Unified Promo & Gift Card Input */}
              <div className="mb-6">
                <label className="block text-sm text-text-muted mb-2">Promo or Gift Code</label>
                
                {/* Active Applied Codes List */}
                <div className="space-y-2 mb-3">
                  {discount && (
                    <div className="flex flex-col gap-1 p-3 bg-green-50 text-green-700 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          <div>
                            <span className="font-medium block">{discount.code}</span>
                            <span className="text-xs opacity-80">
                               {discount.type === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={removeCoupon}
                          className="text-xs hover:underline text-green-800 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      {isPartialDiscount && (
                        <p className="text-[10px] text-green-800/70 mt-1 pl-6 flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 inline mt-0.5" />
                          Applies only to physical products, not gift cards.
                        </p>
                      )}
                    </div>
                  )}

                  {giftCard && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <div>
                          <span className="font-medium block">{giftCard.code}</span>
                          <span className="text-xs opacity-80">
                            Balance: {formatPrice(giftCard.balance)}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={removeGiftCard}
                        className="text-xs hover:underline text-blue-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Field */}
                {(!discount || !giftCard) && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                      disabled={isApplying}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-sand border-transparent text-text-dark placeholder:text-text-light focus:outline-none focus:border-terracotta transition-colors uppercase"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleApplyCode}
                      disabled={isApplying || !code}
                    >
                      {isApplying ? '...' : 'Apply'}
                    </Button>
                  </div>
                )}
                
                {msg && (
                   <p className={`text-xs mt-2 ${msg.toLowerCase().includes('success') || msg.includes('applied') ? 'text-green-600' : 'text-red-500'}`}>
                     {msg}
                   </p>
                )}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-clay/20">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) - (giftCard ? finalPrice + Math.min(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), giftCard.balance) : finalPrice))}</span>
                  </div>
                )}
                {giftCard && (
                  <div className="flex justify-between text-blue-600">
                    <span>Gift Card</span>
                    <span>-{formatPrice(Math.min(finalPrice + (giftCard.balance), giftCard.balance))}</span> 
                  </div>
                )}
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span className="text-sage">Free</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold text-text-dark mb-6">
                <span>Total</span>
                <span className="text-terracotta">{formatPrice(finalPrice)}</span>
              </div>

              <Link href="/checkout" className="block">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full mb-4"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4 text-sage" />
                  Best Price
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
