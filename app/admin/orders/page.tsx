'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, EyeOff, X, Package, Truck, Check, Clock, Loader2,
  ChevronLeft, ChevronRight, Download, Trash2
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { ConfirmModal } from '@/components/ui/Modal';

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  product: { name: string; images: { image_url: string }[] };
}

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  discount_amount: number;
  user: { email: string } | null;
  items: OrderItem[];
  razorpay_payment_id: string | null;
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
  } | null;
}

interface StatusHistoryEntry {
  id: string;
  order_id: string;
  status: string;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
  is_visible_to_user: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  // Status History
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Delete confirmation modal
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, status, total_amount, discount_amount, razorpay_payment_id,
        user:profiles(email),
        items:order_items(id, quantity, price_at_purchase, product:products(name, images:product_images(image_url))),
        shipping_address:shipping_addresses(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    }

    if (data) {
      // Handle array vs object for shipping_address
      const formattedOrders = data.map((order: any) => ({
        ...order,
        shipping_address: Array.isArray(order.shipping_address) 
          ? order.shipping_address[0] || null 
          : order.shipping_address
      }));
      setOrders(formattedOrders as Order[]);
    }
    setIsLoading(false);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, notes?: string) => {
    if (!supabase) return;
    setIsUpdating(true);
    
    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      // Log to status history (visible by default, admin can toggle later)
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: newStatus,
          changed_by: user?.id || null,
          notes: notes || null,
          is_visible_to_user: true
        });

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
        // Refresh history to show new entry
        fetchStatusHistory(orderId);
      }
    }
    setIsUpdating(false);
  };

  // Fetch status history for an order
  const fetchStatusHistory = useCallback(async (orderId: string) => {
    if (!supabase) return;
    setIsLoadingHistory(true);
    
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: true });
      
      if (!error && data) {
        setStatusHistory(data as StatusHistoryEntry[]);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingHistory(false);
    }
  }, [supabase]);

  // Toggle visibility of a history entry
  const toggleHistoryVisibility = async (entryId: string, currentVisibility: boolean) => {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('order_status_history')
      .update({ is_visible_to_user: !currentVisibility })
      .eq('id', entryId);
    
    if (!error) {
      setStatusHistory(statusHistory.map(h => 
        h.id === entryId ? { ...h, is_visible_to_user: !currentVisibility } : h
      ));
    }
  };

  // Delete a history entry
  const deleteHistoryEntry = async (entryId: string) => {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('order_status_history')
      .delete()
      .eq('id', entryId);
    
    if (!error) {
      setStatusHistory(statusHistory.filter(h => h.id !== entryId));
    }
    setDeleteEntryId(null);
  };

  // Fetch history when order is selected
  useEffect(() => {
    if (selectedOrder) {
      fetchStatusHistory(selectedOrder.id);
    } else {
      setStatusHistory([]);
    }
  }, [selectedOrder, fetchStatusHistory]);

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    if (!supabase) return;
    setIsBulkUpdating(true);
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .in('id', Array.from(selectedIds));
    
    if (!error) {
      // Log to status history for each order
      const { data: { user } } = await supabase.auth.getUser();
      const historyRecords = Array.from(selectedIds).map(orderId => ({
        order_id: orderId,
        status: newStatus,
        changed_by: user?.id || null,
        notes: 'Bulk status update'
      }));
      
      await supabase
        .from('order_status_history')
        .insert(historyRecords);

      setOrders(orders.map(o => 
        selectedIds.has(o.id) ? { ...o, status: newStatus as Order['status'] } : o
      ));
      setSelectedIds(new Set());
    }
    setIsBulkUpdating(false);
  };

  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Payment'];
    const csv = [
      headers.join(','),
      ...filteredOrders.map(o => [
        o.id.slice(0, 8),
        o.user?.email || 'Guest',
        new Date(o.created_at).toLocaleDateString(),
        o.total_amount,
        o.status,
        o.razorpay_payment_id ? 'Paid' : 'Pending'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Check className="w-4 h-4" />;
      default: return <X className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-dark">Orders</h1>
          <p className="text-text-muted">{orders.length} total orders</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-cream border border-clay/20 rounded-xl hover:border-terracotta transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 bg-terracotta/10 rounded-xl border border-terracotta/20"
          >
            <span className="text-sm font-medium text-text-dark">
              {selectedIds.size} order{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <select
                onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value)}
                disabled={isBulkUpdating}
                className="px-3 py-1.5 text-sm border border-clay/20 rounded-lg bg-white"
                defaultValue=""
              >
                <option value="" disabled>Change Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1.5 text-text-muted hover:text-text-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by order ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-cream rounded-2xl">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-dark mb-2">No orders found</h3>
          <p className="text-text-muted">Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <div className="bg-cream rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-clay/20">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-terracotta rounded"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Order ID</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Payment</th>
                  <th className="text-right p-4 text-sm font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-clay/10 hover:bg-sand/30">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="w-4 h-4 accent-terracotta rounded"
                      />
                    </td>
                    <td className="p-4 font-mono text-sm text-text-dark">#{order.id.slice(0, 8)}</td>
                    <td className="p-4 text-text-muted">{order.user?.email || 'Guest'}</td>
                    <td className="p-4 text-text-muted text-sm">{formatDate(order.created_at)}</td>
                    <td className="p-4 font-medium text-text-dark">{formatPrice(order.total_amount)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.razorpay_payment_id ? paymentStatusColors['paid'] : paymentStatusColors['pending']
                      }`}>
                        {order.razorpay_payment_id ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-sand rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-text-muted" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-clay/20">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-clay/20 rounded-lg bg-white"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>of {filteredOrders.length} orders</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-clay/20 rounded-lg hover:bg-sand disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage ? 'bg-terracotta text-cream' : 'hover:bg-sand text-text-muted'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 border border-clay/20 rounded-lg hover:bg-sand disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              className="bg-cream rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-text-dark">Order #{selectedOrder.id.slice(0, 8)}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-sand rounded-lg">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-muted">Customer</p>
                    <p className="font-medium text-text-dark">{selectedOrder.user?.email || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Date</p>
                    <p className="font-medium text-text-dark">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>

                {selectedOrder.shipping_address && (
                  <div className="bg-sand/20 p-4 rounded-xl border border-clay/10">
                    <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                       Shipping Address
                    </h4>
                    <div className="text-sm text-text-dark">
                      <p className="font-medium">{selectedOrder.shipping_address.full_name}</p>
                      <p>{selectedOrder.shipping_address.address_line1}</p>
                      {selectedOrder.shipping_address.address_line2 && <p>{selectedOrder.shipping_address.address_line2}</p>}
                      <p>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.postal_code}
                      </p>
                      <p className="mt-1 text-text-muted">{selectedOrder.shipping_address.phone}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Update Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 bg-white border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Status History Timeline */}
                <div>
                  <h4 className="font-medium text-text-dark mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Status History
                  </h4>
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
                    </div>
                  ) : statusHistory.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-clay/20 space-y-4">
                      {statusHistory.map((entry) => {
                        const statusColor = {
                          pending: 'bg-amber-500',
                          processing: 'bg-blue-500',
                          shipped: 'bg-purple-500',
                          delivered: 'bg-green-500',
                          cancelled: 'bg-red-500',
                        }[entry.status] || 'bg-gray-400';

                        return (
                          <div 
                            key={entry.id} 
                            className={`relative flex items-start gap-3 ${!entry.is_visible_to_user ? 'opacity-50' : ''}`}
                          >
                            <span className={`absolute -left-[31px] w-3 h-3 rounded-full ${statusColor} ring-2 ring-cream`} />
                            
                            <div className="flex-1">
                              <p className="font-medium text-text-dark capitalize text-sm">{entry.status}</p>
                              <p className="text-xs text-text-muted">
                                {new Date(entry.changed_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                              {entry.notes && (
                                <p className="text-xs text-text-muted italic mt-0.5">{entry.notes}</p>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleHistoryVisibility(entry.id, entry.is_visible_to_user)}
                                className={`p-1.5 rounded-lg transition-colors ${entry.is_visible_to_user ? 'hover:bg-sand text-text-muted' : 'bg-amber-100 text-amber-700'}`}
                                title={entry.is_visible_to_user ? 'Hide from user' : 'Show to user'}
                              >
                                {entry.is_visible_to_user ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => setDeleteEntryId(entry.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted italic">No status history yet.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-text-dark mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-sand/30 rounded-xl">
                        <div className="w-12 h-12 bg-sand rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-text-muted" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-dark">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-terracotta">
                          {formatPrice(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-clay/20">
                  <span className="font-medium text-text-dark">Total</span>
                  <span className="text-xl font-bold text-terracotta">{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteEntryId !== null}
        onClose={() => setDeleteEntryId(null)}
        onConfirm={() => deleteEntryId && deleteHistoryEntry(deleteEntryId)}
        title="Delete Status Entry"
        message="Are you sure you want to delete this status entry? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
