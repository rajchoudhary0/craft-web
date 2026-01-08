'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Eye, Sparkles, ArrowRight } from 'lucide-react';
import { getFeaturedProducts, formatPrice, Product } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import Button from '@/components/ui/Button';

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'best-seller': return 'bg-terracotta text-cream';
      case 'limited-edition': return 'bg-gold text-text-dark';
      case 'new': return 'bg-sage text-cream';
      default: return 'bg-clay text-cream';
    }
  };

  return (
    <motion.article
      className="group"
      variants={fadeInUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Image container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <Link href={`/products/${product.id}`} className="block w-full h-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
            
          {/* Tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            {product.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getTagColor(tag)}`}
              >
                {tag === 'best-seller' && <Sparkles className="w-3 h-3" />}
                {tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            ))}
          </div>

          {/* Wishlist button */}
          <motion.button
            onClick={handleWishlistToggle}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              inWishlist 
                ? 'bg-terracotta text-cream' 
                : 'bg-white/90 text-text-dark hover:bg-terracotta hover:text-cream'
            }`}
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Add to cart overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-x-0 bottom-0 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-2">
                  <motion.button
                    onClick={(e) => { e.preventDefault(); addItem(product); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-text-dark text-cream rounded-full font-medium text-sm hover:bg-terracotta transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                     <ShoppingBag className="w-4 h-4" />
                     Add to Cart
                  </motion.button>
                  <Link href={`/products/${product.id}`}>
                    <motion.div
                      className="w-12 h-12 bg-cream rounded-full flex items-center justify-center text-text-dark hover:bg-terracotta hover:text-cream transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Eye className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product info */}
        <div className="p-5">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
            {product.category}
          </p>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-serif text-lg font-semibold text-text-dark mb-2 group-hover:text-terracotta transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-terracotta">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-text-light line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedProducts() {
  const products = getFeaturedProducts();

  return (
    <section className="section-padding bg-background-alt">
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-medium mb-4"
            variants={fadeInUp}
          >
            <Sparkles className="w-4 h-4" />
            Bestsellers
          </motion.span>
          <motion.h2
            className="heading-lg text-text-dark mb-4"
            variants={fadeInUp}
          >
            Featured <span className="text-gradient">Handcrafts</span>
          </motion.h2>
          <motion.p
            className="text-text-muted max-w-xl mx-auto"
            variants={fadeInUp}
          >
            Our most loved pieces, carefully selected from our collection. 
            Each item is handmade with love by Neha Kumari.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/products">
            <Button 
              variant="outline" 
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              View All Products
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
