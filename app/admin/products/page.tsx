'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, 
  Eye, Package, Star, AlertCircle 
} from 'lucide-react';
import { products, formatPrice, Product, categories } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock-asc': return a.quantity - b.quantity;
        case 'stock-desc': return b.quantity - a.quantity;
        default: return 0; // consistent default order
      }
    });

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'best-seller':
        return 'bg-terracotta/10 text-terracotta';
      case 'new':
        return 'bg-sage/10 text-sage-dark';
      case 'limited-edition':
        return 'bg-gold/10 text-gold-dark';
      default:
        return 'bg-clay/10 text-text-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark">Products</h1>
          <p className="text-text-muted">Manage your handcrafted inventory</p>
        </div>
        <Link href="/admin/products/new">
          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              placeholder="Search products..."
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
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
                <option value="stock-desc">Stock: High to Low</option>
              </select>
               <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
             </div>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-terracotta text-cream border-terracotta'
                  : 'bg-cream border-clay/20 text-text-muted hover:border-terracotta'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-cream rounded-2xl border border-clay/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-clay/10">
                <th className="text-left p-4 text-sm font-medium text-text-muted">Product</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Category</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Price</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Tags</th>
                <th className="text-right p-4 text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    className="border-b border-clay/10 last:border-0 hover:bg-sand/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-dark truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-text-muted">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-text-muted">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-dark">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-text-light line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${
                        product.quantity < 10 ? 'text-orange-600' : 'text-text-muted'
                      }`}>
                        {product.quantity < 10 && <AlertCircle className="w-4 h-4" />}
                        {product.quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-0.5 rounded-full ${getTagBadge(tag)}`}
                          >
                            {tag.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${product.id}`} target="_blank">
                          <motion.button
                            className="p-2 rounded-lg text-text-light hover:text-text-dark hover:bg-sand transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </Link>
                        <Link href={`/admin/products/${product.id}`}>
                          <motion.button
                            className="p-2 rounded-lg text-text-light hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </Link>
                        <motion.button
                          onClick={() => setShowDeleteModal(product.id)}
                          className="p-2 rounded-lg text-text-light hover:text-red-500 hover:bg-red-50 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-text-light mx-auto mb-4" />
            <p className="text-text-muted">No products found</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-text-dark/50 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(null)}
            />
            <motion.div
              className="relative bg-cream rounded-2xl p-6 max-w-sm w-full shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-lg font-serif font-semibold text-text-dark mb-2">Delete Product</h3>
              <p className="text-text-muted mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-2.5 px-4 border border-clay/20 rounded-xl text-text-dark hover:bg-sand transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Delete logic here
                    setShowDeleteModal(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
