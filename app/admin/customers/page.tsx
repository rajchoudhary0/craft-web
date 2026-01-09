'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, ShoppingBag, Filter, ChevronDown, Loader2,
  ChevronLeft, ChevronRight, Check, X, Download, Mail
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  orders: number;
  totalSpent: number;
  joined_at: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('spent-desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const supabase = createClient();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    if (!supabase) return;
    setIsLoading(true);

    // Fetch profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at');

    if (error) {
      console.error('Error fetching customers:', JSON.stringify(error, null, 2));
      setIsLoading(false);
      return;
    }

    if (!profiles) {
      console.warn('No profiles found');
      setIsLoading(false);
      return;
    }

    // Fetch orders for aggregation
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id, total_amount');

    // Aggregate order data by user
    const ordersByUser: Record<string, { count: number; total: number }> = {};
    (orders || []).forEach((order: any) => {
      if (!ordersByUser[order.user_id]) {
        ordersByUser[order.user_id] = { count: 0, total: 0 };
      }
      ordersByUser[order.user_id].count += 1;
      ordersByUser[order.user_id].total += order.total_amount || 0;
    });

    // Combine profiles with order data
    const customersData: Customer[] = profiles.map((profile: any) => ({
      id: profile.id,
      email: profile.email || '',
      full_name: profile.full_name,
      orders: ordersByUser[profile.id]?.count || 0,
      totalSpent: ordersByUser[profile.id]?.total || 0,
      joined_at: profile.created_at || new Date().toISOString(), // Fallback
    }));

    // Filter out customers with no orders for cleaner display if desired, 
    // but usually admins want to see all registered users.
    // Keeping all users for now.
    
    setCustomers(customersData);
    setIsLoading(false);
  };

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => 
        (c.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'spent-desc': return b.totalSpent - a.totalSpent;
          case 'spent-asc': return a.totalSpent - b.totalSpent;
          case 'orders-desc': return b.orders - a.orders;
          case 'name-asc': return (a.full_name || a.email).localeCompare(b.full_name || b.email);
          default: return 0;
        }
      });
  }, [customers, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, pageSize]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedCustomers.map(c => c.id)));
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

  const handleExport = (idsToExport = filteredCustomers) => {
    const headers = ['Name', 'Email', 'Orders', 'Total Spent', 'Joined Date'];
    const csv = [
      headers.join(','),
      ...idsToExport.map(c => [
        `"${c.full_name || 'N/A'}"`, 
        c.email, 
        c.orders, 
        c.totalSpent,
        new Date(c.joined_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleBulkExport = () => {
    const selectedCustomers = customers.filter(c => selectedIds.has(c.id));
    handleExport(selectedCustomers);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-dark">Customers</h1>
          <p className="text-text-muted">{customers.length} registered customers</p>
        </div>
        <button 
          onClick={() => handleExport(filteredCustomers)}
          className="flex items-center gap-2 px-4 py-2 bg-cream border border-clay/20 rounded-xl text-text-dark hover:border-terracotta hover:text-terracotta transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All
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
              {selectedIds.size} customer{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleBulkExport}
                className="px-3 py-1.5 text-sm bg-white border border-clay/20 text-text-dark rounded-lg hover:bg-sand transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Selected
              </button>
               {/* Placeholder for Email feature */}
              <button
                className="px-3 py-1.5 text-sm bg-terracotta text-cream rounded-lg hover:bg-terracotta-dark transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
                title="Email integration coming soon"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
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

      {/* Customers List */}
      {paginatedCustomers.length === 0 ? (
        <div className="text-center py-12 bg-cream rounded-2xl">
          <Users className="w-12 h-12 text-text-light mx-auto mb-4" />
          <h3 className="font-medium text-text-dark mb-2">No customers found</h3>
          <p className="text-text-muted">Adjust your search or filters to find customers</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-cream rounded-2xl overflow-hidden border border-clay/10">
             {/* Header Row for Desktop */}
             <div className="hidden md:flex items-center p-4 border-b border-clay/10 bg-sand/30 text-sm font-medium text-text-muted">
                <div className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedCustomers.length && paginatedCustomers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-terracotta rounded"
                  />
                </div>
                <div className="flex-1">Customer</div>
                <div className="w-32 text-center">Orders</div>
                <div className="w-32 text-right">Total Spent</div>
                <div className="w-40 text-right pr-4">Joined</div>
             </div>

            {paginatedCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex flex-col md:flex-row md:items-center p-4 border-b border-clay/10 last:border-0 hover:bg-sand/20 transition-colors ${selectedIds.has(customer.id) ? 'bg-terracotta/5' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1">
                   <div className="md:w-12 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(customer.id)}
                      onChange={() => toggleSelect(customer.id)}
                      className="w-4 h-4 accent-terracotta rounded"
                    />
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-terracotta font-serif font-semibold">
                      {(customer.full_name || customer.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-medium text-text-dark truncate">
                      {customer.full_name || customer.email.split('@')[0]}
                    </p>
                    <p className="text-sm text-text-muted truncate">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 md:mt-0 md:w-auto gap-4">
                   <div className="flex items-center gap-2 md:w-32 md:justify-center text-sm text-text-muted">
                    <ShoppingBag className="w-4 h-4 md:hidden" />
                    <span>{customer.orders} orders</span>
                  </div>
                  
                  <div className="md:w-32 md:text-right font-medium text-terracotta">
                    {formatPrice(customer.totalSpent)}
                  </div>

                  <div className="hidden md:block w-40 text-right text-sm text-text-muted pr-4">
                    {new Date(customer.joined_at).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-cream rounded-2xl border border-clay/10">
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
              <span>of {filteredCustomers.length} customers</span>
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
    </div>
  );
}
