'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye, Plus, Star } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { formatPrice } from '@/lib/data';
import { fadeInUp } from '@/lib/animations';

// Type matching the Supabase join structure
export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug?: string | null;
    price: number;
    original_price?: number | null;
    description?: string | null;
    rating?: number | null;
    reviews_count?: number | null;
    stock?: number | null;
    images: { image_url: string }[];
    category?: { name: string } | null;
    tags?: { name: string }[];
    type?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const inWishlist = isInWishlist(product.id);

  // Get first image or fallback
  const imageUrl = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800';
  
  // Calculate discount percentage
  const discountPercent = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price || undefined,
        images: product.images?.map(i => i.image_url) || [],
        category: product.category?.name || '',
        description: product.description || '',
        rating: product.rating || 0,
        reviewsCount: product.reviews_count || 0,
        stock: product.stock || 0,
        tags: product.tags?.map(t => t.name) || [],
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price || undefined,
      images: product.images?.map(i => i.image_url) || [],
      category: product.category?.name || '',
      description: product.description || '',
      rating: product.rating || 0,
      reviewsCount: product.reviews_count || 0,
      stock: product.stock || 0,
      tags: product.tags?.map(t => t.name) || [],
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'best-seller': return 'bg-terracotta text-white';
      case 'limited-edition': return 'bg-gold text-text-dark';
      case 'new': return 'bg-sage text-white';
      default: return 'bg-clay/80 text-white';
    }
  };

  return (
    <motion.article
      className="group h-full"
      variants={fadeInUp}
      layout
    >
      <div className="h-full bg-white dark:bg-[var(--background-alt)] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-xl hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300 flex flex-col">
        
        {/* Image Container */}
        <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-white/5">
          <Link href={`/products/${product.slug || product.id}`} className="block w-full h-full">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>

          {/* Top Left: Tags */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.tags?.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded ${getTagStyle(tag.name)}`}
              >
                {tag.name.replace('-', ' ')}
              </span>
            ))}
          </div>

          {/* Top Right: Wishlist Button - Always visible */}
          <motion.button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
              inWishlist 
                ? 'bg-terracotta text-white' 
                : 'bg-white/90 dark:bg-black/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-terracotta'
            }`}
            whileTap={{ scale: 0.9 }}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 right-14 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}

          {/* Bottom Action Bar - Different for mobile vs desktop */}
          {/* Desktop: Hover overlay */}
          <div className="hidden md:flex absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2 w-full">
              <motion.button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-text-dark py-3 rounded-xl font-medium text-sm hover:bg-terracotta hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </motion.button>
              <Link
                href={`/products/${product.slug || product.id}`}
                className="w-12 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white hover:text-text-dark transition-colors"
              >
                <Eye className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile: Always visible compact bar */}
          <div className="md:hidden absolute bottom-3 right-3 z-10">
            <motion.button
              onClick={handleAddToCart}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isAdding 
                  ? 'bg-sage text-white scale-110' 
                  : 'bg-text-dark text-white active:bg-terracotta'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label="Add to cart"
            >
              {isAdding ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-lg"
                >
                  ✓
                </motion.div>
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <Link href={`/products/${product.slug || product.id}`} className="flex flex-col flex-grow p-3 sm:p-4">
          {/* Category */}
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-text-muted mb-1">
            {product.category?.name || 'Uncategorized'}
          </span>
          
          {/* Name */}
          <h3 className="font-medium text-sm sm:text-base text-text-dark dark:text-gray-100 group-hover:text-terracotta transition-colors line-clamp-2 mb-1 leading-tight">
            {product.name}
          </h3>
          
          {/* Star Rating - Only show if product has actual reviews */}
          {Number(product.reviews_count) > 0 && Number(product.rating) > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(product.rating || 0)
                        ? 'text-gold fill-gold'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-text-muted">
                {(product.rating || 0).toFixed(1)} ({product.reviews_count})
              </span>
            </div>
          )}
          
          {/* Price Row */}
          <div className="mt-auto flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg text-text-dark dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-xs sm:text-sm text-text-muted dark:text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </Link>
      </div>
    </motion.article>
  );
}
