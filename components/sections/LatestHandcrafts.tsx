'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Loader2 } from 'lucide-react';
import { staggerContainer } from '@/lib/animations';
import ProductCard from '@/components/ui/ProductCard';
import { createClient } from '@/lib/supabase/client';

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

export default function LatestHandcrafts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLatest() {
      if (!supabase) return;
      // Fetch latest products marked as 'is_new' or sorted by created_at
      const { data } = await supabase
        .from('products')
        .select(`
          id, name, slug, price, original_price, description, rating, reviews_count, stock,
          images:product_images(image_url),
          category:categories(name),
          tags:product_tags(tag:tags(name))
        `)
        .eq('is_active', true)
        // You can filter by is_new or just sort by date
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (data) {
        // Transform the tags structure
        const transformedData = data.map((p: any) => ({
          ...p,
          tags: p.tags?.map((t: any) => t.tag) || []
        }));
        setProducts(transformedData);
      }
      setIsLoading(false);
    }
    fetchLatest();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="container-custom flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-terracotta"></span>
              <span className="text-terracotta font-medium uppercase tracking-wider text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Just Arrived
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-dark">
              Latest Handcrafts
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/products?sort=newest" 
              className="group inline-flex items-center gap-2 text-text-dark hover:text-terracotta transition-colors font-medium"
            >
              View New Arrivals
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No new arrivals yet. Check back soon!</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products.map((product) => (
              <div key={product.id} className="h-[500px]">
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
