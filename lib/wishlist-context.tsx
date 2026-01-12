'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

const STORAGE_KEY = 'wishlist';
const SYNC_DEBOUNCE_MS = 500;

interface WishlistContextType {
  items: Product[];
  isLoading: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const supabase = createClient();



  // Load wishlist from appropriate source
  const loadWishlist = useCallback(async () => {
    setIsLoading(true);

    try {
      if (user && supabase) {
        // User is logged in - fetch from Supabase
        const serverItems = await fetchServerWishlist();
        const localItems = getLocalWishlist();

        if (localItems.length > 0) {
          // Merge local items with server items
          const merged = mergeWishlistItems(localItems, serverItems);
          setItems(merged);
          // Push merged wishlist to server and clear local
          await syncToServer(merged);
          clearLocalWishlist();
        } else {
          setItems(serverItems);
        }
      } else {
        // Guest user - load from localStorage
        setItems(getLocalWishlist());
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Fallback to local storage on error
      setItems(getLocalWishlist());
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);
  
  // Load wishlist on mount and when user changes
  useEffect(() => {
    loadWishlist();
  }, [user, loadWishlist]);

  // Get wishlist from localStorage
  const getLocalWishlist = (): Product[] => {
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
  const saveLocalWishlist = (items: Product[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  // Clear localStorage
  const clearLocalWishlist = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  };

  // Fetch wishlist from Supabase
  const fetchServerWishlist = async (): Promise<Product[]> => {
    if (!supabase || !user) return [];

    try {
      // Get or create wishlist for user
      let { data: wishlistData } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!wishlistData) {
        // Create new wishlist
        const { data: newWishlist } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        wishlistData = newWishlist;
      }

      if (!wishlistData?.id) return [];

      // Fetch wishlist items with product details
      const { data: itemsData } = await supabase
        .from('wishlist_items')
        .select(`
          product:products(
            id, name, slug, description, price, original_price,
            stock, rating, reviews_count,
            category:categories(name),
            images:product_images(image_url),
            tags:product_tags(tag:tags(name))
          )
        `)
        .eq('wishlist_id', wishlistData.id);

      if (!itemsData) return [];

      // Convert to Product format
      return itemsData
        .filter((item: any) => item.product)
        .map((item: any) => ({
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
        }));
    } catch (error) {
      console.error('Error fetching server wishlist:', error);
      return [];
    }
  };

  // Merge local wishlist items with server wishlist items
  const mergeWishlistItems = (local: Product[], server: Product[]): Product[] => {
    const merged = [...server];
    const serverIds = new Set(server.map((p) => p.id));

    for (const localItem of local) {
      if (!serverIds.has(localItem.id)) {
        merged.push(localItem);
      }
    }

    return merged;
  };

  // Sync wishlist to Supabase
  const syncToServer = async (wishlistItems: Product[]) => {
    if (!supabase || !user) return;

    try {
      // Get or create wishlist
      let { data: wishlistData } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!wishlistData) {
        const { data: newWishlist } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        wishlistData = newWishlist;
      }

      if (!wishlistData?.id) return;

      // Delete existing items
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlistData.id);

      // Insert new items
      if (wishlistItems.length > 0) {
        const itemsToInsert = wishlistItems.map((item) => ({
          wishlist_id: wishlistData.id,
          product_id: item.id,
        }));

        await supabase.from('wishlist_items').insert(itemsToInsert);
      }

      // Update wishlist timestamp
      await supabase
        .from('wishlists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', wishlistData.id);
    } catch (error) {
      console.error('Error syncing wishlist to server:', error);
      // Save to localStorage as backup
      saveLocalWishlist(wishlistItems);
    }
  };

  // Debounced sync
  const debouncedSync = useCallback(
    (wishlistItems: Product[]) => {
      if (syncTimeout) clearTimeout(syncTimeout);

      const timeout = setTimeout(() => {
        if (user) {
          syncToServer(wishlistItems);
        } else {
          saveLocalWishlist(wishlistItems);
        }
      }, SYNC_DEBOUNCE_MS);

      setSyncTimeout(timeout);
    },
    [user, syncTimeout]
  );

  // Update items and sync
  const updateItems = useCallback(
    (newItems: Product[]) => {
      setItems(newItems);
      debouncedSync(newItems);
    },
    [debouncedSync]
  );

  const addToWishlist = (product: Product) => {
    if (items.find((p) => p.id === product.id)) return;
    updateItems([...items, product]);
  };

  const removeFromWishlist = (productId: string) => {
    updateItems(items.filter((p) => p.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((p) => p.id === productId);
  };

  const clearWishlist = () => {
    updateItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
