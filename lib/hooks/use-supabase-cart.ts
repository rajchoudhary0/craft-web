'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { CartItem, Product, ProductImage } from '@/lib/supabase/types';

export type CartItemWithProduct = CartItem & {
  product: Product & { images: ProductImage[] };
};

interface UseSupabaseCartReturn {
  items: CartItemWithProduct[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

export function useSupabaseCart(): UseSupabaseCartReturn {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const fetchCart = useCallback(async () => {
    if (!supabase || !user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get or create cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        // Create cart
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (createError) throw createError;
        cart = newCart;
      }

      // Fetch cart items with products
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*, images:product_images(*))
        `)
        .eq('cart_id', cart.id);

      if (itemsError) throw itemsError;

      setItems((cartItems || []).filter((item: any) => item.product) as CartItemWithProduct[]);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId: string, quantity = 1) => {
    if (!supabase || !user) return;

    try {
      // Get cart id
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) return;

      // Check if item exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        // Insert new item
        await supabase
          .from('cart_items')
          .insert({ cart_id: cart.id, product_id: productId, quantity });
      }

      fetchCart();
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.message);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!supabase) return;

    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      fetchCart();
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      setError(err.message);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!supabase) return;

    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      fetchCart();
    } catch (err: any) {
      console.error('Error removing item:', err);
      setError(err.message);
    }
  };

  const clearCart = async () => {
    if (!supabase || !user) return;

    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cart) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);
      }

      setItems([]);
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.message);
    }
  };

  return {
    items,
    isLoading,
    error,
    totalItems,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refetch: fetchCart,
  };
}
