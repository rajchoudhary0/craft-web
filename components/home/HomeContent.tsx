'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';

interface Product {
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
  category: { name: string } | null;
  tags: { name: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string; // Fallback or real image
}

interface HomeContentProps {
  featuredProducts: Product[];
  newArrivals: Product[];
  categories: Category[];
}

export default function HomeContent({ featuredProducts, newArrivals, categories }: HomeContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax for Hero
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="bg-cream dark:bg-gray-950 min-h-screen">
      {/* 1. HERO SECTION: Minimal, Split/Full Layout */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center text-center px-4 pt-20">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto space-y-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
             <span className="inline-block py-1 px-3 border border-text-muted/30 rounded-full text-xs font-medium uppercase tracking-widest text-text-muted mb-6">
               The Vybe Store
             </span>
             <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-text-dark dark:text-white leading-[1.1] md:leading-[1.1] tracking-tight">
               Elevate <span className="italic text-terracotta">the</span><br/> Everyday
             </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl text-text-muted max-w-xl mx-auto font-light"
          >
            Curated collections of ceramics, textiles, and artifacts designed to bring soul to your living space.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link href="/products">
              <Button size="lg" className="rounded-full px-8 py-6 text-base shadow-xl shadow-terracotta/20">
                Explore Collection
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(216,180,166,0.15),transparent_70%)]" />
          <div className="absolute -left-[10%] top-[20%] w-[40vw] h-[40vw] rounded-full bg-sage/5 blur-[100px]" />
          <div className="absolute -right-[10%] bottom-[10%] w-[35vw] h-[35vw] rounded-full bg-terracotta/5 blur-[100px]" />
        </div>
        
        {/* Floating Product Teasers (Modern touch) */}
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="hidden lg:block absolute right-12 top-1/3 w-64 aspect-[4/5] bg-white p-2 shadow-2xl rotate-3 rounded-xl z-20"
        >
           <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
             <Image 
               src={featuredProducts[0]?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1595356700395-6f14b5c1f33f?w=600"} 
               alt={featuredProducts[0]?.name || "Hero Product"} 
               fill 
               className="object-cover"
             />
           </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="hidden lg:block absolute left-12 bottom-1/4 w-56 aspect-[4/5] bg-white p-2 shadow-2xl -rotate-6 rounded-xl z-20"
        >
           <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
             <Image 
               src={featuredProducts[1]?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"} 
               alt={featuredProducts[1]?.name || "Hero Product"} 
               fill 
               className="object-cover"
             />
           </div>
        </motion.div>
      </section>

      {/* 2. CATEGORIES COLLAGE - Masonry Style */}
      <section className="py-24 bg-white dark:bg-black/20 overflow-hidden">
        <div className="container-custom max-w-7xl">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-serif text-text-dark dark:text-white mb-4">Curated Collections</h2>
             <p className="text-text-muted text-lg font-light max-w-xl mx-auto">
               Explore our hand-picked categories, thoughtfully arranged for your discovery.
             </p>
           </div>

           {/* Collage Grid: 3 Columns base with dense packing */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]" style={{ gridAutoFlow: 'dense' }}>
             {categories.length > 0 ? (
               categories.slice(0, 6).map((cat, idx) => {
                 const count = Math.min(categories.length, 6);
                 
                 // Dynamic Collage Logic based on item count
                 let spanClass = "md:col-span-1 md:row-span-1";
                 
                 if (count === 4) {
                   // 3-col x 2-row = 6 cells for 4 items
                   if (idx === 0) spanClass = "md:col-span-2 md:row-span-1"; // Wide top-left
                   if (idx === 1) spanClass = "md:col-span-1 md:row-span-2"; // Tall right
                   // Items 2 & 3 stay 1x1 (bottom left, bottom middle)
                 } else if (count === 5) {
                   // 3-col x 3-row = 9 cells for 5 items
                   if (idx === 0) spanClass = "md:col-span-2 md:row-span-2"; // Big square
                   // Items 1 & 2 stay 1x1 (top right stack)
                   if (idx === 3) spanClass = "md:col-span-3 md:row-span-1"; // Full-width bottom
                   // Item 4 stays 1x1 (fills gap if any)
                 } else if (count >= 6) {
                   // 3-col x 4-row = 12 cells for 6 items
                   if (idx === 0) spanClass = "md:col-span-2 md:row-span-2";
                   if (idx === 3) spanClass = "md:col-span-2 md:row-span-1";
                   if (idx === 4) spanClass = "md:col-span-1 md:row-span-2";
                   if (idx === 5) spanClass = "md:col-span-2 md:row-span-1";
                 }
                 
                 return (
                   <Link 
                     key={cat.id}
                     href={`/products?category=${cat.slug}`}
                     className={`group relative rounded-xl overflow-hidden cursor-pointer ${spanClass}`}
                   >
                      <Image 
                        src={cat.image_url || `https://images.unsplash.com/photo-${['1565193566173-7a0ee3dbe261', '1555041469-a586c61ea9bc', '1513519245088-0e12902e5a38', '1535632066927-ab7c9ab60908'][idx % 4]}?w=800`}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/40 transition-colors duration-500" />
                      
                      {/* Text Overlay - Centered for big, bottom for small */}
                      <div className={`absolute inset-0 flex flex-col justify-end p-6 ${idx === 0 ? 'md:justify-center md:items-center md:text-center' : ''} text-white`}>
                         <h3 className={`${idx === 0 ? 'text-4xl md:text-5xl' : 'text-2xl'} cat-name font-serif italic mb-2 drop-shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500`}>
                           {cat.name}
                         </h3>
                         <span className={`text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${idx === 0 ? 'mx-auto' : ''}`}>
                           Explore
                         </span>
                      </div>
                   </Link>
                 );
               })
             ) : (
                <div className="col-span-full py-12 text-center text-text-muted">
                    No categories found.
                </div>
             )}
           </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS - Grid */}
      <section className="py-24 bg-cream dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-terracotta font-medium uppercase tracking-widest text-xs">Hand-Picked for You</span>
            <h2 className="text-4xl md:text-5xl font-serif text-text-dark dark:text-white mt-3 mb-6">Featured Products</h2>
            <p className="text-text-muted">Our most loved pieces, curated by our artisans.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/products?featured=true">
              <Button variant="outline" className="rounded-full border-text-muted text-text-muted hover:border-terracotta hover:text-terracotta">
                View All Featured
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS - Grid */}
      <section className="py-24 bg-sage/5 border-y border-sage/10">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-terracotta font-medium uppercase tracking-widest text-xs">Fresh from the Kiln</span>
            <h2 className="text-4xl md:text-5xl font-serif text-text-dark dark:text-white mt-3 mb-6">New Arrivals</h2>
            <p className="text-text-muted">Be the first to explore our latest handcrafted additions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.slice(0, 4).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/products?sort=newest">
              <Button variant="outline" className="rounded-full border-text-muted text-text-muted hover:border-terracotta hover:text-white">
                View All New Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED / EDITORIAL */}
      <section className="py-32 px-4 relative overflow-hidden bg-text-dark text-white">
        <div className="absolute inset-0 opacity-20">
           <Image src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600" alt="Background" fill className="object-cover" />
        </div>
        <div className="container-custom relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
           <div className="flex-1 space-y-8 text-center md:text-left">
             <h2 className="text-4xl md:text-6xl font-serif leading-tight">
               Crafted for the <br/><span className="text-cream italic">modern home</span>
             </h2>
             <p className="text-gray-300 text-lg max-w-md mx-auto md:mx-0">
               We believe in the power of slow design. Items that age gracefully, tell a story, and bring warmth to industrial spaces.
             </p>
             <Link href="/about">
               <Button variant="primary" className="bg-cream text-text-white hover:bg-white border-none hover:text-text-dark">
                 Read Our Story
               </Button>
             </Link>
           </div>
           
           {/* Featured Product Highlight */}
           <div className="flex-1 w-full relative">
             <div className="relative aspect-square w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-full p-8 border border-white/10 flex items-center justify-center">
                {featuredProducts[0] && (
                  <Link href={`/products/${featuredProducts[0].slug || featuredProducts[0].id}`} className="group relative w-3/4 h-3/4">
                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                       <Image 
                         src={featuredProducts[0].images?.[0]?.image_url || ''} 
                         alt={featuredProducts[0].name}
                         fill
                         className="object-cover"
                       />
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-white text-text-dark p-6 rounded-xl shadow-xl max-w-[200px]">
                      <p className="font-serif text-lg leading-tight mb-1">{featuredProducts[0].name}</p>
                      <p className="text-sm text-terracotta font-bold">Featured Pick</p>
                    </div>
                  </Link>
                )}
             </div>
           </div>
        </div>
      </section>
      
      {/* 5. NEWSLETTER / FOOTER TEASER - Simplistic */}
      <section className="py-24 bg-cream text-center">
        <div className="container-custom max-w-2xl">
          <Sparkles className="w-8 h-8 text-terracotta mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-text-dark mb-4">Join the community</h2>
          <p className="text-text-muted mb-8">Get 10% off your first order when you sign up.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-terracotta bg-white"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
