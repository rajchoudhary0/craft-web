'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: typeof items[0]) => {
    addItem(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="pt-28 pb-20">
      <div className="container-custom">
        {/* Header with animated line */}
        <motion.div 
          className="text-center mb-12"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-terracotta fill-terracotta" />
            <span className="text-sm text-terracotta font-medium uppercase tracking-wider">Your Wishlist</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-serif font-semibold text-text-dark mb-4"
          >
            Saved <span className="text-terracotta font-display italic">Treasures</span>
          </motion.h1>

          {/* Animated decorative line */}
          <motion.div variants={fadeInUp} className="flex justify-center">
            <svg width="200" height="20" viewBox="0 0 200 20">
              <motion.path
                d="M0 10 Q50 0 100 10 T200 10"
                stroke="var(--terracotta)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sand flex items-center justify-center">
              <Heart className="w-8 h-8 text-clay" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-text-dark mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-text-muted mb-8">
              Save your favorite items to find them later
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Clear all button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={clearWishlist}
                className="text-sm text-text-muted hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            </div>

            {/* Wishlist grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence>
                {items.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="group bg-cream rounded-2xl overflow-hidden border border-clay/10 hover:shadow-xl transition-shadow"
                  >
                    {/* Image */}
                    <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Remove button */}
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 bg-cream/90 backdrop-blur-sm rounded-full flex items-center justify-center text-terracotta hover:bg-red-50 hover:text-red-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </motion.button>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-serif font-semibold text-text-dark hover:text-terracotta transition-colors mb-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-text-muted mb-3">{product.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-terracotta">
                          {formatPrice(product.price)}
                        </span>
                        <motion.button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium hover:bg-terracotta hover:text-cream transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* Bottom decorative line */}
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <svg width="300" height="30" viewBox="0 0 300 30">
            <motion.path
              d="M0 15 Q75 5 150 15 T300 15"
              stroke="var(--clay)"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="150"
              cy="15"
              r="4"
              fill="var(--terracotta)"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5, type: 'spring' }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
