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

// Format price in INR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

// Product Card Component
function ProductCard({ product }: { product: ProductWithDetails }) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  // Get first image or fallback
  const imageUrl = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800';

  // Get first tag name
  const tagName = product.tags?.[0]?.name;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      // Convert to wishlist format
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price || undefined,
        images: product.images?.map(i => i.image_url) || [],
        category: product.category?.name || '',
        description: product.description || '',
        rating: product.rating,
        reviewsCount: product.reviews_count,
        stock: product.stock,
        tags: product.tags?.map(t => t.name) || [],
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Convert to cart format
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price || undefined,
      images: product.images?.map(i => i.image_url) || [],
      category: product.category?.name || '',
      description: product.description || '',
      rating: product.rating,
      reviewsCount: product.reviews_count,
      stock: product.stock,
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
            
          {/* Tag Badge */}
          {tagName && (
            <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getTagStyle(tagName)}`}>
              {tagName === 'best-seller' && <Sparkles className="w-3 h-3" />}
              {tagName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          )}

          {/* Featured Badge */}
          {product.is_featured && !tagName && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-terracotta text-white">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
              inWishlist 
                ? 'bg-terracotta text-white' 
                : 'bg-white text-gray-600 hover:bg-terracotta hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Hover Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-gray-900 rounded-full font-medium text-sm hover:bg-terracotta hover:text-white transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <Link 
                    href={`/products/${product.slug || product.id}`}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-terracotta hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
            {product.category?.name || 'Uncategorized'}
          </p>
          <Link href={`/products/${product.slug || product.id}`} className="block flex-1">
            <h3 className="font-serif text-base font-semibold text-gray-900 leading-tight mb-2 group-hover:text-terracotta transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-bold text-terracotta">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Fetch from Supabase
  const { products, isLoading, error } = useProducts();
  const { categories } = useCategories();

  // All categories including "All"
  const allCategories = useMemo(() => {
    return ['All', ...categories.map(c => c.name)];
  }, [categories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === 'All' 
      ? [...products] 
      : products.filter(p => p.category?.name === activeCategory);

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'featured':
      default:
        // Featured first, then by date
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
    }

    return filtered;
  }, [products, activeCategory, sortBy]);

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
                {filteredProducts.length} items
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
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProducts.length === 0 && (
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
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
