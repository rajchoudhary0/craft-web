'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Eye, Package, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Check, X
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  rating: number;
  reviews_count: number;
  category: { id: string; name: string } | null;
  images: { image_url: string; is_primary: boolean }[];
  tags: { tag: { name: string } }[];
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all'); // 'all', 'featured', 'new', 'both', 'neither'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'draft'
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, price, original_price, stock,
        is_featured, is_new, is_active, rating, reviews_count,
        category:categories(id, name),
        images:product_images(image_url, is_primary),
        tags:product_tags(tag:tags(name))
      `)
      .order('created_at', { ascending: false });

    if (data) {
      // Filter out Gift Cards as they are managed separately or hidden from main product view
      const validProducts = (data as unknown as Product[]).filter(p => p.category?.name !== 'Gift Cards');
      setProducts(validProducts);
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category?.name === selectedCategory;
        
        // Combined Type filter logic
        let matchesType = true;
        if (filterType === 'featured') matchesType = product.is_featured;
        else if (filterType === 'new') matchesType = product.is_new;
        else if (filterType === 'both') matchesType = product.is_featured && product.is_new;
        else if (filterType === 'neither') matchesType = !product.is_featured && !product.is_new;
        
        const matchesStatus = filterStatus === 'all' ||
          (filterStatus === 'active' && product.is_active) ||
          (filterStatus === 'draft' && !product.is_active);
        return matchesSearch && matchesCategory && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'stock-asc': return a.stock - b.stock;
          case 'stock-desc': return b.stock - a.stock;
          default: return 0;
        }
      });
  }, [products, searchQuery, selectedCategory, sortBy, filterType, filterStatus]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, pageSize, filterType, filterStatus]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
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

  const handleDelete = async (productId: string) => {
    if (!supabase) return;
    setIsDeleting(true);
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
      selectedIds.delete(productId);
      setSelectedIds(new Set(selectedIds));
    }
    setIsDeleting(false);
    setShowDeleteModal(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!supabase) return;
    setIsBulkDeleting(true);
    
    const idsToDelete = Array.from(selectedIds);
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', idsToDelete);
    
    if (!error) {
      setProducts(products.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    }
    setIsBulkDeleting(false);
  };

  const handleBulkToggleActive = async (active: boolean) => {
    if (selectedIds.size === 0) return;
    if (!supabase) return;
    
    const idsToUpdate = Array.from(selectedIds);
    const { error } = await supabase
      .from('products')
      .update({ is_active: active })
      .in('id', idsToUpdate);
    
    if (!error) {
      setProducts(products.map(p => 
        selectedIds.has(p.id) ? { ...p, is_active: active } : p
      ));
    }
  };

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'best-seller': return 'bg-terracotta/10 text-terracotta';
      case 'new': return 'bg-blue-100 text-blue-700'; // Different color for "new product" tag
      case 'limited-edition': return 'bg-gold/10 text-gold-dark';
      default: return 'bg-clay/10 text-text-muted';
    }
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'new': return 'New Product'; // Rename "new" tag to "New Product"
      default: return tag;
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
          <h1 className="text-2xl font-serif font-bold text-text-dark">Products</h1>
          <p className="text-text-muted">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-cream rounded-xl hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
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
              {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleBulkToggleActive(true)}
                className="px-3 py-1.5 text-sm bg-sage text-cream rounded-lg hover:bg-sage-dark transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkToggleActive(false)}
                className="px-3 py-1.5 text-sm bg-clay text-text-dark rounded-lg hover:bg-clay/80 transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isBulkDeleting ? 'Deleting...' : 'Delete'}
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
        >
          <option value="all">All Types</option>
          <option value="featured">Featured Only</option>
          <option value="new">New Arrivals Only</option>
          <option value="both">Featured & New</option>
          <option value="neither">Neither</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="draft">Draft Only</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="stock-asc">Stock: Low to High</option>
          <option value="stock-desc">Stock: High to Low</option>
        </select>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-cream rounded-2xl">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-dark mb-2">No products found</h3>
          <p className="text-text-muted mb-4">Add your first product to get started</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-cream rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
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
                      checked={selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-terracotta rounded"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const primaryImage = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;
                  return (
                    <tr key={product.id} className="border-b border-clay/10 hover:bg-sand/30">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 accent-terracotta rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-sand">
                            {primaryImage ? (
                              <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-text-muted" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-dark">{product.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {/* Featured & New badges */}
                              {product.is_featured && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta/20 text-terracotta font-medium">
                                  Featured
                                </span>
                              )}
                              {product.is_new && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-sage-dark font-medium">
                                  New Arrival
                                </span>
                              )}
                              {/* Existing tags */}
                              {product.tags?.slice(0, 2).map((t, i) => (
                                <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${getTagBadge(t.tag?.name || '')}`}>
                                  {getTagLabel(t.tag?.name || '')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-text-muted">{product.category?.name || '-'}</td>
                      <td className="p-4">
                        <span className="font-medium text-text-dark">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="text-sm text-text-muted line-through ml-2">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`${product.stock < 5 ? 'text-red-500' : 'text-text-muted'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-sage/20 text-sage-dark' : 'bg-clay/20 text-text-muted'
                        }`}>
                          {product.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.slug || product.id}`}
                            className="p-2 hover:bg-sand rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-text-muted" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 hover:bg-sand rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-text-muted" />
                          </Link>
                          <button
                            onClick={() => setShowDeleteModal(product.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <span>of {filteredProducts.length} items</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-clay/20 rounded-lg hover:bg-sand disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-terracotta text-cream'
                          : 'hover:bg-sand text-text-muted'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-clay/20 rounded-lg hover:bg-sand disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              className="bg-cream rounded-2xl p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-text-dark">Delete Product</h3>
              </div>
              <p className="text-text-muted mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 border border-clay/20 rounded-lg hover:bg-sand transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
