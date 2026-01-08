'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, CartItem } from './data';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

const STORAGE_KEY = 'cart';
const SYNC_DEBOUNCE_MS = 500;

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // Load cart from appropriate source
  const loadCart = useCallback(async () => {
    setIsLoading(true);

    try {
      if (user && supabase) {
        // User is logged in - fetch from Supabase
        const serverItems = await fetchServerCart();
        const localItems = getLocalCart();

        if (localItems.length > 0) {
          // Merge local items with server items
          const merged = mergeCartItems(localItems, serverItems);
          setItems(merged);
          // Push merged cart to server and clear local
          await syncToServer(merged);
          clearLocalCart();
        } else {
          setItems(serverItems);
        }
      } else {
        // Guest user - load from localStorage
        setItems(getLocalCart());
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to local storage on error
      setItems(getLocalCart());
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  // Get cart from localStorage
  const getLocalCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Save to localStorage
  const saveLocalCart = (items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  // Clear localStorage
  const clearLocalCart = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  };

  // Fetch cart from Supabase
  const fetchServerCart = async (): Promise<CartItem[]> => {
    if (!supabase || !user) return [];

    try {
      // Get or create cart for user
      const { data: cartData } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let cartId = cartData?.id;

      if (!cartId) {
        // Create new cart
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        cartId = newCart?.id;
      }

      if (!cartId) return [];

      // Fetch cart items with product details
      const { data: itemsData } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:products(
            id, name, slug, description, price, original_price,
            stock, rating, reviews_count,
            category:categories(name),
            images:product_images(image_url),
            tags:product_tags(tag:tags(name))
          )
        `)
        .eq('cart_id', cartId);

      if (!itemsData) return [];

      // Convert to CartItem format
      return itemsData.map((item: any) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description || '',
          price: item.product.price,
          originalPrice: item.product.original_price,
          stock: item.product.stock,
          rating: item.product.rating,
          reviewsCount: item.product.reviews_count,
          category: item.product.category?.name || '',
          images: item.product.images?.map((i: any) => i.image_url) || [],
          tags: item.product.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
        },
        quantity: item.quantity,
      }));
    } catch (error) {
      console.error('Error fetching server cart:', error);
      return [];
    }
  };

  // Merge local cart items with server cart items
  const mergeCartItems = (local: CartItem[], server: CartItem[]): CartItem[] => {
    const merged = [...server];

    for (const localItem of local) {
      const existingIndex = merged.findIndex(
        (s) => s.product.id === localItem.product.id
      );

      if (existingIndex >= 0) {
        // Add quantities, cap at 99
        merged[existingIndex].quantity = Math.min(
          merged[existingIndex].quantity + localItem.quantity,
          99
        );
      } else {
        merged.push(localItem);
      }
    }

    return merged;
  };

  // Sync cart to Supabase (debounced)
  const syncToServer = async (cartItems: CartItem[]) => {
    if (!supabase || !user) return;

    try {
      // Get or create cart
      let { data: cartData } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cartData) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        cartData = newCart;
      }

      if (!cartData?.id) return;

      // Delete existing items
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartData.id);

      // Insert new items
      if (cartItems.length > 0) {
        const itemsToInsert = cartItems.map((item) => ({
          cart_id: cartData.id,
          product_id: item.product.id,
          quantity: item.quantity,
        }));

        await supabase.from('cart_items').insert(itemsToInsert);
      }

      // Update cart timestamp
      await supabase
        .from('carts')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', cartData.id);
    } catch (error) {
      console.error('Error syncing cart to server:', error);
      // Save to localStorage as backup
      saveLocalCart(cartItems);
    }
  };

  // Debounced sync
  const debouncedSync = useCallback(
    (cartItems: CartItem[]) => {
      if (syncTimeout) clearTimeout(syncTimeout);

      const timeout = setTimeout(() => {
        if (user) {
          syncToServer(cartItems);
        } else {
          saveLocalCart(cartItems);
        }
      }, SYNC_DEBOUNCE_MS);

      setSyncTimeout(timeout);
    },
    [user, syncTimeout]
  );

  // Update items and sync
  const updateItems = useCallback(
    (newItems: CartItem[]) => {
      setItems(newItems);
      debouncedSync(newItems);
    },
    [debouncedSync]
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addItem = (product: Product, quantity = 1) => {
    const newItems = [...items];
    const existingItem = newItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, 99);
    } else {
      newItems.push({ product, quantity });
    }

    updateItems(newItems);
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    const newItems = items.filter((item) => item.product.id !== productId);
    updateItems(newItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const newItems = items.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(quantity, 99) }
        : item
    );
    updateItems(newItems);
  };

  const clearCart = () => {
    updateItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isLoading,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
