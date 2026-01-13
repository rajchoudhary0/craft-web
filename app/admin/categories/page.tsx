'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, X, FolderTree } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  is_featured?: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
    is_featured: false,
    sort_order: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        is_active: category.is_active,
        is_featured: category.is_featured || false,
        sort_order: category.sort_order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        is_active: true,
        is_featured: false,
        sort_order: categories.length,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const slug = formData.slug || generateSlug(formData.name);

      const payload = {
        name: formData.name,
        slug,
        description: formData.description || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
      };

      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert(payload);

        if (error) throw error;
      }

      closeModal();
      fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      // Attempt to show more specific error
      const message = err?.message || err?.error_description || 'Unknown error';
      showToast(`Failed to save category: ${message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? Products in this category will become uncategorized.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast('Failed to delete category.', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-dark">Categories</h1>
          <p className="text-text-muted text-sm mt-1">Manage product categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-xl font-medium hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      )}

      {/* Categories Table */}
      {!isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-clay/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-sand/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Order</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Slug</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-muted">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clay/10">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-sand/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-text-dark">{cat.sort_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center">
                        <FolderTree className="w-5 h-5 text-terracotta" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="font-medium text-text-dark">{cat.name}</p>
                           {cat.is_featured && (
                             <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-bold rounded">Featured</span>
                           )}
                        </div>
                        {cat.description && (
                          <p className="text-xs text-text-muted truncate max-w-[200px]">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted font-mono">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      cat.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(cat)}
                        className="p-2 rounded-lg hover:bg-sand text-text-muted hover:text-terracotta transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No categories yet. Click &quot;Add Category&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-text-dark">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-sand rounded-lg">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
                    placeholder="e.g., Jewelry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta font-mono text-sm"
                    placeholder="e.g., jewelry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta resize-none"
                    placeholder="Optional description..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-dark mb-1.5">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded border-clay/20 text-terracotta focus:ring-terracotta"
                      />
                      <label htmlFor="is_active" className="text-sm text-text-dark">Active</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded border-clay/20 text-terracotta focus:ring-terracotta"
                      />
                      <label htmlFor="is_featured" className="text-sm text-text-dark font-medium text-amber-700">Featured</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-clay/20 text-text-dark rounded-xl font-medium hover:bg-sand transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-terracotta text-white rounded-xl font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
