'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Order, OrderItem, ShippingAddress, Product } from '@/lib/supabase/types';

export type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: (Product & { images: { image_url: string }[] | null } | null)
  })[];
  shipping_address: ShippingAddress | null;
};

interface UseOrdersReturn {
  orders: OrderWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    if (!supabase || !user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(*, images:product_images(image_url)))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Handle table not existing or other RLS errors gracefully
      if (queryError) {
        // If table doesn't exist or permission denied, just return empty
        if (queryError.code === '42P01' || queryError.code === 'PGRST116' || queryError.message?.includes('does not exist')) {
          setOrders([]);
          return;
        }
        throw queryError;
      }

      setOrders((data || []) as OrderWithDetails[]);
    } catch (err: any) {
      // Only log actual errors, not empty results
      if (err?.message) {
        // Error fetching orders
        setError(err.message);
      }
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

// Single order hook
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrder = useCallback(async () => {
    if (!supabase || !orderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(*, images:product_images(image_url))),
          shipping_address:shipping_addresses(*)
        `)
        .eq('id', orderId)
        .single();

      if (queryError) throw queryError;

      const orderData = data as any;
      if (Array.isArray(orderData.shipping_address)) {
        orderData.shipping_address = orderData.shipping_address[0] || null;
      }

      setOrder(orderData as OrderWithDetails);
    } catch (err: any) {
      // Error fetching order
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, isLoading, error, refetch: fetchOrder };
}

// Admin: All orders hook
export function useAdminOrders(status?: string) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(*, images:product_images(image_url))),
          shipping_address:shipping_addresses(*)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const formattedOrders = (data || []).map((order: any) => ({
        ...order,
        shipping_address: Array.isArray(order.shipping_address)
          ? order.shipping_address[0] || null
          : order.shipping_address
      }));

      setOrders(formattedOrders as OrderWithDetails[]);
    } catch (err: any) {
      // Error fetching admin orders
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;

    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      fetchOrders();
    } catch (err: any) {
      // Error updating order
      setError(err.message);
    }
  };

  return { orders, isLoading, error, refetch: fetchOrders, updateOrderStatus };
}
