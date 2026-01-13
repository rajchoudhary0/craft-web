'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Plus, Trash2, Search, Calendar, Check, X, 
  AlertCircle, Loader2, Copy, Pencil 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/data';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    usage_limit: '',
    end_date: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
    } else {
      setCoupons(data || []);
    }
    setIsLoading(false);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!supabase) throw new Error('Database not available');
      const { data, error } = await supabase.from('coupons').insert({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        end_date: formData.end_date || null,
        is_active: true,
      }).select();

      if (error) throw error;

      setCoupons([data[0], ...coupons]);
      setIsCreating(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        usage_limit: '',
        end_date: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    if (!supabase) return;

    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (!error) {
      setCoupons(coupons.map(c => 
        c.id === id ? { ...c, is_active: !currentState } : c
      ));
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
    });
    setIsEditing(true);
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !supabase) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.from('coupons').update({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        end_date: formData.end_date || null,
      }).eq('id', editingCoupon.id);

      if (error) throw error;

      setCoupons(coupons.map(c => 
        c.id === editingCoupon.id ? {
          ...c,
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: Number(formData.discount_value),
          min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
          usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
          end_date: formData.end_date || null,
        } : c
      ));
      setIsEditing(false);
      setEditingCoupon(null);
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', usage_limit: '', end_date: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-dark">Coupons</h1>
          <p className="text-text-muted">Manage discount codes and promotions</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-text-dark text-white rounded-xl hover:bg-terracotta transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-dark">Create New Coupon</h3>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER2026"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta uppercase tracking-wide"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Discount Type</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta bg-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Value</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Min. Order (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Optional"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-text-muted hover:text-text-dark font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-text-dark text-white rounded-xl hover:bg-terracotta transition-colors font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && editingCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => { setIsEditing(false); setEditingCoupon(null); }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-dark">Edit Coupon</h3>
                <button onClick={() => { setIsEditing(false); setEditingCoupon(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateCoupon} className="p-6 space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta uppercase tracking-wide"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Discount Type</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta bg-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Value</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Min. Order (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setEditingCoupon(null); }}
                    className="px-4 py-2 text-text-muted hover:text-text-dark font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-terracotta text-white rounded-xl hover:bg-terracotta-dark transition-colors font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupons List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-text-dark">No coupons yet</h3>
            <p className="text-text-muted text-sm">Create your first discount code</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div 
              key={coupon.id} 
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                coupon.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-terracotta/10 rounded-lg text-terracotta">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-dark tracking-wide">{coupon.code}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(coupon)}
                    className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleActive(coupon.id, coupon.is_active)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      coupon.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {coupon.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(coupon.id)}
                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-text-muted">Discount</span>
                  <span className="font-medium text-terracotta">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}% OFF`
                      : `${formatPrice(coupon.discount_value)} OFF`
                    }
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-text-muted">Min. Order</span>
                  <span className="font-medium text-text-dark">
                    {coupon.min_order_amount > 0 ? formatPrice(coupon.min_order_amount) : 'None'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-text-muted">Usage</span>
                  <span className="font-medium text-text-dark">
                    {coupon.used_count} / {coupon.usage_limit || '∞'}
                  </span>
                </div>
                 <div className="flex justify-between py-1">
                  <span className="text-text-muted">Expires</span>
                  <span className="font-medium text-text-dark">
                    {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
