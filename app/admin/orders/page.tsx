'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Eye, ChevronDown, X, Package, Truck, Check, Clock
} from 'lucide-react';
import {
  mockOrders, Order, formatDate, getStatusColor, getPaymentStatusColor
} from '@/lib/admin-data';
import { formatPrice } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = mockOrders
    .filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'total-asc': return a.total - b.total;
        case 'total-desc': return b.total - a.total;
        default: return 0;
      }
    });

  const handleExport = () => {
    const headers = ['Order #', 'Customer', 'Date', 'Total', 'Status', 'Payment'];
    const csv = [
      headers.join(','),
      ...filteredOrders.map(o => [
        o.orderNumber,
        `"${o.customerName}"`,
        new Date(o.createdAt).toLocaleDateString(),
        o.total,
        o.status,
        o.paymentStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const statusOptions: { value: Order['status'] | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
  ];

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return Check;
      default: return Package;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark">Orders</h1>
          <p className="text-text-muted">Manage customer orders</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-cream border border-clay/20 rounded-xl text-text-dark hover:border-terracotta hover:text-terracotta transition-colors"
        >
          <Filter className="w-4 h-4" /> {/* Configuring as export icon */}
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-cream border border-clay/20 rounded-xl text-text-dark placeholder:text-text-light focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>
          <div className="sm:w-48">
            <div className="relative h-full">
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="w-full h-full appearance-none bg-cream px-4 py-3 pr-10 border border-clay/20 rounded-xl text-text-dark focus:outline-none focus:border-terracotta cursor-pointer transition-colors"
               >
                 <option value="date-desc">Newest First</option>
                 <option value="date-asc">Oldest First</option>
                 <option value="total-desc">Amount: High to Low</option>
                 <option value="total-asc">Amount: Low to High</option>
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                statusFilter === option.value
                  ? 'bg-terracotta text-cream border-terracotta'
                  : 'bg-cream border-clay/20 text-text-muted hover:border-terracotta'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-cream rounded-2xl border border-clay/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-clay/10">
                <th className="text-left p-4 text-sm font-medium text-text-muted">Order</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Date</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Total</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Payment</th>
                <th className="text-right p-4 text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredOrders.map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <motion.tr
                      key={order.id}
                      className="border-b border-clay/10 last:border-0 hover:bg-sand/30 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="p-4">
                        <span className="font-medium text-text-dark">{order.orderNumber}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-text-dark">{order.customerName}</p>
                          <p className="text-xs text-text-muted">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-text-muted">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-text-dark">{formatPrice(order.total)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <motion.button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-lg text-text-light hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-text-light mx-auto mb-4" />
            <p className="text-text-muted">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-text-dark/50 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              className="relative bg-cream rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-semibold text-text-dark">
                  {selectedOrder.orderNumber}
                </h3>
                <button onClick={() => setSelectedOrder(null)}>
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer */}
                <div>
                  <p className="text-sm text-text-muted mb-1">Customer</p>
                  <p className="font-medium text-text-dark">{selectedOrder.customerName}</p>
                  <p className="text-sm text-text-muted">{selectedOrder.customerEmail}</p>
                </div>

                {/* Shipping */}
                <div>
                  <p className="text-sm text-text-muted mb-1">Shipping Address</p>
                  <p className="text-text-dark">{selectedOrder.shippingAddress}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm text-text-muted mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-clay/10">
                        <div>
                          <p className="text-text-dark">{item.productName}</p>
                          <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-text-dark">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 font-semibold">
                    <span>Total</span>
                    <span className="text-terracotta">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <p className="text-sm text-text-muted mb-2">Update Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value as Order['status'] })}
                    className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 px-4 border border-clay/20 rounded-xl text-text-dark hover:bg-sand transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 py-2.5 px-4 bg-terracotta text-cream rounded-xl hover:bg-terracotta-dark transition-colors">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
