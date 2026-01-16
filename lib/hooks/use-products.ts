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

      // Handle search - query by name, and also by category
      let allProducts: any[] = [];

      if (options.search) {
        // Get category info if filtering by category
        let categoryId: string | null = null;
        let categoryName: string | null = null;
        if (options.categorySlug) {
          const { data: cat } = await supabase
            .from('categories')
            .select('id, name')
            .eq('slug', options.categorySlug)
            .single();
          if (cat) {
            categoryId = cat.id;
            categoryName = cat.name;
          }
        }

        // Check if search term matches the selected category name
        const searchMatchesCategory = categoryName &&
          categoryName.toLowerCase().includes(options.search.toLowerCase());

        // Search by product name
        let nameQuery = supabase
          .from('products')
          .select(`*, category:categories(*), images:product_images(*)`)
          .eq('is_active', true)
          .neq('type', 'gift_card')
          .order('created_at', { ascending: false });

        // Apply category filter if selected
        if (categoryId) {
          nameQuery = nameQuery.eq('category_id', categoryId);
        }

        // Only filter by name if search doesn't match category name
        if (!searchMatchesCategory) {
          nameQuery = nameQuery.ilike('name', `%${options.search}%`);
        }

        if (options.limit) nameQuery.limit(options.limit);
        const { data: nameData } = await nameQuery;

        // Search by category name (only if no specific category filter)
        let catData: any[] = [];
        if (!categoryId) {
          const catQuery = supabase
            .from('products')
            .select(`*, category:categories!inner(*), images:product_images(*)`)
            .eq('is_active', true)
            .neq('type', 'gift_card')
            .ilike('category.name', `%${options.search}%`)
            .order('created_at', { ascending: false });

          if (options.limit) catQuery.limit(options.limit);
          const { data } = await catQuery;
          catData = data || [];
        }

        // Merge and dedupe
        allProducts = [...(nameData || [])];
        catData.forEach((p: any) => {
          if (!allProducts.find((existing: any) => existing.id === p.id)) {
            allProducts.push(p);
          }
        });

        if (options.limit) {
          allProducts = allProducts.slice(0, options.limit);
        }
      } else {
        // No search - use standard query
        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        allProducts = data || [];
      }

      // Fetch tags for each product
      const productsWithTags = await Promise.all(
        allProducts.map(async (product: any) => {
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
      // Error fetching products
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
        // Error fetching product
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
        // Error fetching categories
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  return { categories, isLoading };
}
