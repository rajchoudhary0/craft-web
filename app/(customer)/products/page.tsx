'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Filter, X, ChevronDown, Heart, Eye, Sparkles, Loader2, Search } from 'lucide-react';
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

// Wrapper component with Suspense for useSearchParams
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';
  
  const { categories } = useCategories();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchInput, setSearchInput] = useState(urlSearchQuery);
  
  // Sync search input with URL param on mount
  useEffect(() => {
    setSearchInput(urlSearchQuery);
  }, [urlSearchQuery]);
  
  // Parse sort option to hook options
  const hookOptions = useMemo(() => {
    const opts: any = {};
    if (activeCategory !== 'All') {
      const category = categories.find(c => c.name === activeCategory);
      if (category) opts.categorySlug = category.slug;
    }
    
    // Add search query
    if (searchInput.length > 0) {
      opts.search = searchInput;
    }
    
    return opts;
  }, [activeCategory, categories, searchInput]);

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
    <div className="min-h-screen pt-24 pb-20 bg-gray-50 dark:bg-[var(--background)] overflow-x-hidden">
      {/* Hero */}
      <section className="bg-white dark:bg-[var(--background)] py-12 md:py-16 border-b border-gray-100 dark:border-white/5">
        <div className="container-custom text-center">
          <h1 className="heading-xl text-text-dark mb-3">
            {searchInput ? (
              <>Search: <span className="text-gradient">{searchInput}</span></>
            ) : (
              <>Shop <span className="text-gradient">Handmade</span></>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-6">
            {searchInput 
              ? `Showing results for "${searchInput}"`
              : 'Browse our collection of unique, handcrafted treasures. Each piece is made with love by Neha Kumari.'
            }
          </p>
          
          {/* Search Box - Only show when user arrived via global search */}
          {urlSearchQuery && (
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[var(--background-alt)] text-text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="container-custom py-8">
        
        {/* Filters Sticky Bar */}
        <div className="sticky top-20 z-30 bg-gray-50/95 dark:bg-[var(--background)]/95 backdrop-blur-sm py-4 mb-8 border-b border-gray-200 dark:border-white/10">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            
            {/* Category Pills - Scrollable with fade edges */}
            <div className="relative flex-1 min-w-0">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
              
              <div className="overflow-x-auto scrollbar-sleek px-1 pb-2">
                <div className="flex items-center gap-2 px-4">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-terracotta text-white shadow-md'
                          : 'bg-white dark:bg-[var(--background-alt)] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                {sortedProducts.length} items
              </span>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white dark:bg-[var(--background-alt)] pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-terracotta/20 cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[var(--background)] rounded-t-2xl max-h-[75vh] overflow-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[var(--background)] z-10">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filter & Sort</h3>
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
              <div className="p-4 border-t border-gray-100 dark:border-white/10 sticky bottom-0 bg-white dark:bg-[var(--background)]">
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
