'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Filter, X, ChevronDown, Heart, Eye, Sparkles, Loader2 } from 'lucide-react';
import { useProducts, useCategories, ProductWithDetails } from '@/lib/hooks/use-products';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import ProductCard from '@/components/ui/ProductCard';

// Format price in INR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function ProductsPage() {
  const { categories } = useCategories();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Parse sort option to hook options
  const hookOptions = useMemo(() => {
    const opts: any = {};
    if (activeCategory !== 'All') {
      const category = categories.find(c => c.name === activeCategory);
      if (category) opts.categorySlug = category.slug;
    }
    
    // Sort is handled client-side for now in this simple hook, 
    // or we need to update hook to support detailed sorting.
    // For now, let's fetch all (or filtered by category) and sort client-side 
    // to match previous behavior if hook doesn't support generic sort.
    return opts;
  }, [activeCategory, categories]);

  const { products, isLoading, error } = useProducts(hookOptions);

  // All categories including "All"
  const allCategories = useMemo(() => {
    return ['All', ...categories.filter(c => c.name !== 'Gift Cards').map(c => c.name)];
  }, [categories]);

  // Client-side sorting (since hook does basic filtering)
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'featured':
      default:
        // Featured first, then by date
        return sorted.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }
  }, [products, sortBy]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      {/* Hero */}
      <section className="bg-white py-12 md:py-16 border-b border-gray-100">
        <div className="container-custom text-center">
          <h1 className="heading-xl text-text-dark mb-3">
            Shop <span className="text-gradient">Handmade</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Browse our collection of unique, handcrafted treasures. 
            Each piece is made with love by Neha Kumari.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-custom py-8">
        
        {/* Filters Sticky Bar */}
        <div className="sticky top-header z-30 bg-gray-50/95 backdrop-blur-sm py-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex-1 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex items-center gap-2 min-w-max">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-terracotta text-white shadow-md transform scale-105'
                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side Controls */}
              <div className="flex items-center gap-3 ml-auto pl-4 border-l border-gray-200">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                {sortedProducts.length} items
              </span>
              
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-gray-700 border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-terracotta/20 cursor-pointer transition-all"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none group-hover:text-terracotta transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-terracotta transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <p className="text-gray-400 mt-2">Please try again later.</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <AnimatePresence mode="popLayout">
            {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sortedProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products found in this category.</p>
          </div>
        )}
      </section>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] overflow-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="font-semibold text-gray-900">Filter & Sort</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-2 rounded-full text-sm ${
                          activeCategory === cat
                            ? 'bg-terracotta text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'featured', l: 'Featured' },
                      { v: 'newest', l: 'Newest' },
                      { v: 'price-low', l: 'Price ↑' },
                      { v: 'price-high', l: 'Price ↓' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setSortBy(opt.v)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                          sortBy === opt.v
                            ? 'bg-terracotta text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply */}
              <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 bg-terracotta text-white rounded-full font-medium"
                >
                  Show {sortedProducts.length} Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
