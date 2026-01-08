'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Heart, Share2, ChevronLeft, ChevronRight, 
  Minus, Plus, Check, Truck, Shield, RefreshCw, ChevronDown, Loader2
} from 'lucide-react';
import { useProduct, useProducts } from '@/lib/hooks/use-products';
import { useCart } from '@/lib/cart-context';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import Button from '@/components/ui/Button';

// Format price in INR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { product, isLoading, error } = useProduct(resolvedParams.id);
  const { products: allProducts } = useProducts();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const { addItem } = useCart();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  // Not found state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-md text-text-dark mb-4">Product not found</h1>
          <Link href="/products" className="text-terracotta hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  // Get images array
  const productImages = product.images?.map(i => i.image_url) || ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'];
  const categoryName = product.category?.name || 'Uncategorized';

  const handleAddToCart = () => {
    // Convert to cart format
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price || undefined,
      images: productImages,
      category: categoryName,
      description: product.description || '',
      rating: product.rating,
      reviewsCount: product.reviews_count,
      stock: product.stock,
      tags: product.tags?.map(t => t.name) || [],
    }, quantity);
    setQuantity(1);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Get related products from same category
  const relatedProducts = allProducts.filter(
    p => p.category?.name === categoryName && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-text-muted">
            <li><Link href="/" className="hover:text-terracotta">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-terracotta">Shop</Link></li>
            <li>/</li>
            <li><Link href={`/products?category=${categoryName}`} className="hover:text-terracotta">{categoryName}</Link></li>
            <li>/</li>
            <li className="text-text-dark">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Main Image */}
            <motion.div
              className="relative aspect-square rounded-2xl overflow-hidden bg-sand mb-4"
              variants={fadeInUp}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={productImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Clickable overlay for zoom */}
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                aria-label="Zoom image"
              />

              {/* Navigation arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-cream transition-colors z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-cream transition-colors z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
                {(product.tags || []).map((tag) => (
                  <span
                    key={tag.id}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      tag.name === 'best-seller' ? 'bg-terracotta text-cream' :
                      tag.name === 'limited-edition' ? 'bg-gold text-text-dark' :
                      tag.name === 'new' ? 'bg-sage text-cream' :
                      'bg-clay text-cream'
                    }`}
                  >
                    {tag.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <motion.div 
                className="flex gap-3"
                variants={fadeInUp}
              >
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden bg-sand transition-all ${
                      selectedImage === index ? 'ring-2 ring-terracotta' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.p 
              className="text-sm uppercase tracking-wider text-text-muted mb-2"
              variants={fadeInUp}
            >
              {categoryName}
            </motion.p>

            <motion.h1 
              className="heading-lg text-text-dark mb-4"
              variants={fadeInUp}
            >
              {product.name}
            </motion.h1>

            <motion.div 
              className="flex items-center gap-4 mb-6"
              variants={fadeInUp}
            >
              <span className="text-3xl font-serif font-bold text-terracotta">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <>
                  <span className="text-xl text-text-light line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="px-2 py-1 bg-terracotta/10 text-terracotta text-sm font-medium rounded">
                    Save {Math.round((1 - product.price / product.original_price) * 100)}%
                  </span>
                </>
              )}
            </motion.div>

            <motion.p 
              className="body-lg text-text-muted mb-8"
              variants={fadeInUp}
            >
              {product.description}
            </motion.p>

            {/* Quantity & Add to Cart */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-3 bg-sand rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-cream flex items-center justify-center hover:bg-clay/20 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-cream flex items-center justify-center hover:bg-clay/20 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
                leftIcon={<ShoppingBag className="w-5 h-5" />}
              >
                Add to Cart
              </Button>

              <motion.button
                className="w-12 h-12 rounded-full bg-sand flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-clay/20"
              variants={fadeInUp}
            >
              {[
                { icon: Truck, text: 'Free Shipping' },
                { icon: Shield, text: 'Secure Payment' },
                { icon: RefreshCw, text: '30-Day Returns' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <item.icon className="w-6 h-6 text-sage mx-auto mb-2" />
                  <span className="text-xs text-text-muted">{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Accordions */}
            <motion.div className="space-y-4" variants={fadeInUp}>
              {/* Description */}
              <div className="border border-clay/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-text-dark">The Story</span>
                  <motion.div
                    animate={{ rotate: openAccordion === 'description' ? 180 : 0 }}
                  >
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openAccordion === 'description' && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-text-muted">
                        {product.story}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Materials */}
              <div className="border border-clay/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'materials' ? null : 'materials')}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-text-dark">Materials & Dimensions</span>
                  <motion.div
                    animate={{ rotate: openAccordion === 'materials' ? 180 : 0 }}
                  >
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openAccordion === 'materials' && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-text-muted">
                        <p className="mb-2"><strong>Materials:</strong></p>
                        <ul className="list-disc list-inside mb-4">
                          {product.materials.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                        <p><strong>Dimensions:</strong> {product.dimensions}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Care */}
              <div className="border border-clay/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-text-dark">Care Instructions</span>
                  <motion.div
                    animate={{ rotate: openAccordion === 'care' ? 180 : 0 }}
                  >
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openAccordion === 'care' && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-text-muted">
                        <ul className="space-y-2">
                          {product.careInstructions.map((instruction, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="heading-md text-text-dark mb-8 text-center">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const imageUrl = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400';
                return (
                  <Link key={p.id} href={`/products/${p.slug || p.id}`}>
                    <motion.div
                      className="group bg-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                      whileHover={{ y: -4 }}
                    >
                      <div className="relative aspect-square overflow-hidden bg-sand">
                        <Image
                          src={imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif font-medium text-text-dark group-hover:text-terracotta transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-terracotta font-semibold">{formatPrice(p.price)}</p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              className="relative w-full h-full max-w-4xl max-h-[85vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </motion.div>
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
