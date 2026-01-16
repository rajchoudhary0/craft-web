'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Plus, Trash2, Search, Calendar, Check, X, 
  AlertCircle, Loader2, CreditCard, Copy, Pencil
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/data';

interface GiftCard {
  id: string;
  code: string;
  initial_value: number;
  balance: number;
  status: 'active' | 'used' | 'expired';
  recipient_email: string | null;
  created_at: string;
}

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [activeTab, setActiveTab] = useState<'issued' | 'products'>('issued');
  const [giftCardProducts, setGiftCardProducts] = useState<any[]>([]); // Using any for simplicity or reuse Product interface
  const [formData, setFormData] = useState({
    initial_value: '',
    recipient_email: '',
    code_custom: '', // Optional custom code
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCards();
    fetchGiftCardProducts();
  }, []);

  const fetchCards = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Error fetching gift cards
    } else {
      setCards(data || []);
    }
    setIsLoading(false);
  };

  const fetchGiftCardProducts = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('products')
      .select(`
        id, name, price, stock, is_active,
        category:categories(name),
        images:product_images(image_url, is_primary)
      `)
      .order('price', { ascending: true });

    if (data) {
      // Filter for Gift Cards type or category
      const gcProducts = data.filter((p: any) => p.category?.name === 'Gift Cards');
      setGiftCardProducts(gcProducts);
    }
  };

  const generateCode = () => {
    // Format: GIFT-XXXX-XXXX
    const random = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GIFT-${random()}-${random()}`;
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const code = formData.code_custom || generateCode();

    try {
      if (!supabase) throw new Error('Database not available');
      const { data, error } = await supabase.from('gift_cards').insert({
        code: code,
        initial_value: Number(formData.initial_value),
        balance: Number(formData.initial_value),
        recipient_email: formData.recipient_email || null,
        status: 'active',
      }).select();

      if (error) throw error;

      setCards([data[0], ...cards]);
      setIsCreating(false);
      setFormData({
        initial_value: '',
        recipient_email: '',
        code_custom: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift card?')) return;
    if (!supabase) return;

    const { error } = await supabase.from('gift_cards').delete().eq('id', id);
    if (!error) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const openEditModal = (card: GiftCard) => {
    setEditingCard(card);
    setIsEditing(true);
  };

  const handleUpdateCard = async (balance: number, status: string, recipient_email: string) => {
    if (!editingCard || !supabase) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.from('gift_cards').update({
        balance,
        status,
        recipient_email: recipient_email || null,
      }).eq('id', editingCard.id);

      if (error) throw error;

      setCards(cards.map(c => 
        c.id === editingCard.id ? {
          ...c,
          balance,
          status: status as any,
          recipient_email: recipient_email || null,
        } : c
      ));
      setIsEditing(false);
      setEditingCard(null);
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
          <h1 className="text-2xl font-serif font-bold text-text-dark">Gift Cards</h1>
          <p className="text-text-muted">Manage sellable cards and issued codes</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'issued' ? (
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-text-dark text-white rounded-xl hover:bg-terracotta transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Issue Card
            </button>
          ) : (
            <a 
              href="/admin/products/new" // Redirects to standard product creation, user can select Gift Card category
              className="flex items-center gap-2 px-4 py-2 bg-text-dark text-white rounded-xl hover:bg-terracotta transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Denomination
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('issued')}
          className={`pb-3 px-1 mr-6 font-medium text-sm transition-colors relative ${
            activeTab === 'issued' ? 'text-terracotta' : 'text-text-muted hover:text-text-dark'
          }`}
        >
          Issued Cards
          {activeTab === 'issued' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'products' ? 'text-terracotta' : 'text-text-muted hover:text-text-dark'
          }`}
        >
          Card Products
          {activeTab === 'products' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta" />
          )}
        </button>
      </div>

      {activeTab === 'issued' ? (
        <>
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
                  className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-text-dark">Issue Gift Card</h3>
                    <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateCard} className="p-6 space-y-4">
                    {error && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {/* Fix for RLS error display */}
                        {error.includes('row-level security') 
                          ? 'Permission denied. Please run the fix_gift_cards_rls.sql script.' 
                          : error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.initial_value}
                        onChange={(e) => setFormData({ ...formData, initial_value: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                        placeholder="e.g. 1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Recipient Email (Optional)</label>
                      <input
                        type="email"
                        value={formData.recipient_email}
                        onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                        placeholder="customer@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Custom Code (Optional)</label>
                      <input
                        type="text"
                        value={formData.code_custom}
                        onChange={(e) => setFormData({ ...formData, code_custom: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta uppercase"
                        placeholder="Leave empty to auto-generate"
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
                        {isSubmitting ? 'Issuing...' : 'Issue Card'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Edit Modal */}
          <AnimatePresence>
            {isEditing && editingCard && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => { setIsEditing(false); setEditingCard(null); }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-text-dark">Edit Gift Card</h3>
                    <button onClick={() => { setIsEditing(false); setEditingCard(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <EditGiftCardForm 
                    card={editingCard}
                    onSave={handleUpdateCard}
                    onCancel={() => { setIsEditing(false); setEditingCard(null); }}
                    isSubmitting={isSubmitting}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Cards List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
              </div>
            ) : cards.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-text-dark">No gift cards issued</h3>
                <p className="text-text-muted text-sm">Issue a card manually or wait for purchases</p>
              </div>
            ) : (
              cards.map((card) => (
                <div 
                  key={card.id} 
                  className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                    card.status === 'active' && card.balance > 0 ? 'border-gray-100' : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-text-dark tracking-wide font-mono">{card.code}</h3>
                          <button 
                             onClick={() => navigator.clipboard.writeText(card.code)}
                             className="text-gray-400 hover:text-gray-600"
                             title="Copy Code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          card.balance > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {card.balance > 0 ? 'Active' : 'Used'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditModal(card)}
                        className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                     <div className="p-3 bg-gray-50 rounded-xl mb-3">
                       <div className="flex justify-between text-xs text-text-muted mb-1">
                         <span>Balance</span>
                         <span>Total Value</span>
                       </div>
                       <div className="flex justify-between items-end">
                         <span className="text-xl font-bold text-text-dark">{formatPrice(card.balance)}</span>
                         <span className="text-text-muted line-through text-xs mb-1">{formatPrice(card.initial_value)}</span>
                       </div>
                       {/* Progress bar */}
                       <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                         <div 
                           className="h-full bg-blue-500 rounded-full" 
                           style={{ width: `${(card.balance / card.initial_value) * 100}%` }}
                         />
                       </div>
                     </div>

                     {card.recipient_email && (
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-text-muted">For</span>
                          <span className="font-medium text-text-dark truncate max-w-[150px]" title={card.recipient_email}>
                            {card.recipient_email}
                          </span>
                        </div>
                     )}
                     <div className="flex justify-between py-1">
                      <span className="text-text-muted">Created</span>
                      <span className="font-medium text-text-dark">
                        {new Date(card.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {giftCardProducts.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
             <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <h3 className="font-medium text-text-dark">No gift card products</h3>
             <p className="text-text-muted text-sm">Create a product with category "Gift Cards" to see it here</p>
           </div>
          ) : (
            giftCardProducts.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden">
                    {product.images?.[0]?.image_url ? (
                       <img src={product.images[0].image_url} alt={product.name} className="object-cover w-full h-full"/>
                    ) : (
                      <Gift className="w-6 h-6 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-dark">{product.name}</h3>
                    <p className="text-terracotta font-medium">{formatPrice(product.price)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`/admin/products/${product.id}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Edit
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Edit Gift Card Form Component
function EditGiftCardForm({ 
  card, 
  onSave, 
  onCancel,
  isSubmitting 
}: { 
  card: GiftCard;
  onSave: (balance: number, status: string, recipient_email: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [balance, setBalance] = useState(String(card.balance));
  const [status, setStatus] = useState(card.status);
  const [recipientEmail, setRecipientEmail] = useState(card.recipient_email || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(balance), status, recipientEmail);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Code</label>
        <input
          type="text"
          value={card.code}
          disabled
          className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Balance (₹)</label>
          <input
            type="number"
            min="0"
            max={card.initial_value}
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta bg-white"
          >
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Recipient Email</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Optional"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
        />
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
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
  );
}
