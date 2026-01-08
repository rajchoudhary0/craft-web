'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { formatPrice } from '@/lib/data';
import { fadeInUp } from '@/lib/animations';

// Type matching the Supabase join structure
export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug?: string;
    price: number;
    original_price?: number | null;
    description?: string;
    rating?: number;
    reviews_count?: number;
    stock?: number;
    images: { image_url: string }[];
    category?: { name: string } | null;
    tags?: { name: string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  // Get first image or fallback
  const imageUrl = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800';

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
          <Link href={`/products/${product.slug || product.id}`} className="block w-full h-full">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>

          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.tags?.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-sm shadow-sm ${getTagStyle(tag.name)}`}
              >
                {tag.name.replace('-', ' ')}
              </span>
            ))}
          </div>

          {/* Quick Actions Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-3 bottom-3 flex gap-2 z-10"
              >
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-text-dark text-white py-2.5 rounded-xl font-medium text-sm hover:bg-terracotta transition-colors shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`w-10 flex items-center justify-center rounded-xl shadow-lg transition-colors ${
                    inWishlist ? 'bg-terracotta text-white' : 'bg-white text-text-dark hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
                <Link
                  href={`/products/${product.slug || product.id}`}
                  className="w-10 flex items-center justify-center bg-white text-text-dark rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <Link 
              href={`/products?category=${product.category?.name}`}
              className="text-xs text-text-muted hover:text-terracotta transition-colors"
            >
              {product.category?.name || 'Uncategorized'}
            </Link>
          </div>
          <Link href={`/products/${product.slug || product.id}`} className="block mb-2">
            <h3 className="font-medium text-text-dark group-hover:text-terracotta transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              {product.original_price && (
                <span className="text-xs text-text-muted line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
              <span className="font-semibold text-text-dark">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
