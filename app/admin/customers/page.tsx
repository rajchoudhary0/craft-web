'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Phone, ShoppingBag, Filter, ChevronDown } from 'lucide-react';
import { mockOrders } from '@/lib/admin-data';
import { formatPrice } from '@/lib/data';

// Derive customers from orders
const customers = Array.from(
  new Map(
    mockOrders.map(order => [
      order.customerEmail,
      {
        name: order.customerName,
        email: order.customerEmail,
        orders: mockOrders.filter(o => o.customerEmail === order.customerEmail).length,
        totalSpent: mockOrders
          .filter(o => o.customerEmail === order.customerEmail)
          .reduce((sum, o) => sum + o.total, 0),
      },
    ])
  ).values()
);

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('spent-desc');

  const filteredCustomers = customers
    .filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'spent-desc': return b.totalSpent - a.totalSpent;
        case 'spent-asc': return a.totalSpent - b.totalSpent;
        case 'orders-desc': return b.orders - a.orders;
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Orders', 'Total Spent'];
    const csv = [
      headers.join(','),
      ...filteredCustomers.map(c => [
        `"${c.name}"`, 
        c.email, 
        c.orders, 
        c.totalSpent
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark">Customers</h1>
          <p className="text-text-muted">View customer information</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-cream border border-clay/20 rounded-xl text-text-dark hover:border-terracotta hover:text-terracotta transition-colors"
        >
          <Filter className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            placeholder="Search customers..."
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
              <option value="spent-desc">Total Spent: High</option>
              <option value="spent-asc">Total Spent: Low</option>
              <option value="orders-desc">Most Orders</option>
              <option value="name-asc">Name: A-Z</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.email}
            className="bg-cream rounded-2xl p-5 border border-clay/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                <span className="text-terracotta font-serif font-semibold text-lg">
                  {customer.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-dark truncate">{customer.name}</p>
                <p className="text-sm text-text-muted truncate">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-clay/10">
              <div className="flex items-center gap-1 text-sm text-text-muted">
                <ShoppingBag className="w-4 h-4" />
                {customer.orders} {customer.orders === 1 ? 'order' : 'orders'}
              </div>
              <span className="font-medium text-terracotta">{formatPrice(customer.totalSpent)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-text-light mx-auto mb-4" />
          <p className="text-text-muted">No customers yet</p>
        </div>
      )}
    </div>
  );
}
