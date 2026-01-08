'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import Button from '@/components/ui/Button';

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

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
                        src={item.product.images[0]}
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
                      <motion.button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
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
              <div className="mb-6">
                <label className="block text-sm text-text-muted mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-sand border-transparent text-text-dark placeholder:text-text-light focus:outline-none focus:border-terracotta transition-colors"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-clay/20">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
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
                <span className="text-terracotta">{formatPrice(totalPrice)}</span>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="w-full mb-4"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Checkout
              </Button>

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
