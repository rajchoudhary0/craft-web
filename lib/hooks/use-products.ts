'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, ProductImage, Category, Tag } from '@/lib/supabase/types';

export type ProductWithDetails = Product & {
  images: ProductImage[];
  category: Category | null;
  tags: Tag[];
};

interface UseProductsOptions {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
  search?: string;
}

interface UseProductsReturn {
  products: ProductWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Base query
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('is_active', true)
        .neq('type', 'gift_card') // Exclude gift cards from general listings
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.categorySlug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', options.categorySlug)
          .single();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }

      if (options.featured) {
        query = query.eq('is_featured', true);
      }

      if (options.isNew) {
        query = query.eq('is_new', true);
      }

      if (options.search) {
        query = query.ilike('name', `%${options.search}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Fetch tags for each product
      const productsWithTags = await Promise.all(
        (data || []).map(async (product: any) => {
          const { data: tagData } = await supabase
            .from('product_tags')
            .select('tag:tags(*)')
            .eq('product_id', product.id);
          
          return {
            ...product,
            tags: (tagData || []).map((t: any) => t.tag).filter(Boolean),
          } as ProductWithDetails;
        })
      );

      setProducts(productsWithTags);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, options.categorySlug, options.featured, options.isNew, options.limit, options.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

// Single product hook
export function useProduct(idOrSlug: string) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      if (!supabase || !idOrSlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try by slug first, then by id
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            images:product_images(*)
          `);

        // Check if it's a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        
        if (isUUID) {
          query = query.eq('id', idOrSlug);
        } else {
          query = query.eq('slug', idOrSlug);
        }

        const { data, error: queryError } = await query.single();

        if (queryError) throw queryError;

        // Fetch tags
        const { data: tagData } = await supabase
          .from('product_tags')
          .select('tag:tags(*)')
          .eq('product_id', data.id);

        setProduct({
          ...data,
          tags: (tagData || []).map((t: any) => t.tag).filter(Boolean),
        } as ProductWithDetails);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [supabase, idOrSlug]);

  return { product, isLoading, error };
}

// Categories hook
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  return { categories, isLoading };
}
