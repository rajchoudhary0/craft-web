'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, animate, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { products, formatPrice, categories, Product } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { staggerContainer, fadeInUp } from '@/lib/animations';

export default function LatestHandcrafts() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const x = useMotionValue(0);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const filtered = activeCategory === 'All' 
      ? products 
      : products.filter(p => p.category === activeCategory);
    setFilteredProducts(filtered);
    x.set(0);
  }, [activeCategory, x]);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const scrollWidth = (filteredProducts.length * 320) + ((filteredProducts.length - 1) * 24);
      setConstraints({
        left: -(scrollWidth - containerWidth),
        right: 0,
      });
    }
  }, [filteredProducts]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Calculate momentum-based scroll
    const momentum = velocity * 0.5;
    const newX = x.get() + offset + momentum;
    
    // Clamp to constraints
    const clampedX = Math.max(constraints.left, Math.min(constraints.right, newX));
    
    animate(x, clampedX, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    });
  };

  const scroll = (direction: 'left' | 'right') => {
    const amount = direction === 'left' ? 340 : -340;
    const newX = Math.max(constraints.left, Math.min(constraints.right, x.get() + amount));
    animate(x, newX, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    });
  };

  return (
    <section className="section-padding bg-cream overflow-hidden">
      <div className="container-custom">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <div>
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-sage/20 text-sage-dark text-sm font-medium mb-4"
              variants={fadeInUp}
            >
              New Arrivals
            </motion.span>
            <motion.h2
              className="heading-lg text-text-dark"
              variants={fadeInUp}
            >
              Latest <span className="text-gradient">Handcrafts</span>
            </motion.h2>
          </div>

          {/* Navigation arrows */}
          <motion.div
            className="hidden md:flex items-center gap-3"
            variants={fadeInUp}
          >
            <motion.button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-text-dark hover:bg-terracotta hover:text-cream transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-text-dark hover:bg-terracotta hover:text-cream transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Category filters */}
        <motion.div
          className="flex flex-wrap gap-3 mb-10"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-terracotta text-cream shadow-md'
                  : 'bg-sand text-text-dark hover:bg-clay/30'
              }`}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              layout
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Horizontal scroll container */}
        <div ref={containerRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
          <motion.div
            className="flex gap-6"
            style={{ x }}
            drag="x"
            dragConstraints={constraints}
            onDragEnd={handleDragEnd}
            dragElastic={0.1}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="flex-shrink-0 w-80"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <div className="group bg-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-sand">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        draggable={false}
                      />
                      
                      {/* Tags */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {product.tags.includes('new') && (
                          <span className="px-3 py-1 bg-sage text-cream text-xs font-medium rounded-full">
                            New
                          </span>
                        )}
                        {product.tags.includes('limited-edition') && (
                          <span className="px-3 py-1 bg-gold text-text-dark text-xs font-medium rounded-full">
                            Limited
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                      {product.category}
                    </p>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-serif font-semibold text-text-dark mb-2 group-hover:text-terracotta transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-text-muted mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-terracotta">
                        {formatPrice(product.price)}
                      </span>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(product);
                        }}
                        className="w-10 h-10 bg-text-dark text-cream rounded-full flex items-center justify-center hover:bg-terracotta transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Drag hint for mobile */}
        <p className="text-center text-sm text-text-muted mt-6 md:hidden">
          ← Drag to explore →
        </p>
      </div>
    </section>
  );
}
