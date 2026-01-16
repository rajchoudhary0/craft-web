'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, LogOut, Settings, Heart, MapPin, 
  Loader2, ShoppingBag, Calendar, ChevronRight, Trash2, Eye, Pencil, XCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOrders } from '@/lib/hooks/use-orders';
import { useWishlist } from '@/lib/wishlist-context';

export default function AccountPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const supabase = createClient();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const [profileLoading, setProfileLoading] = useState(false);
  const [demoAdmin, setDemoAdmin] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '+91',
    gender: '',
    date_of_birth: ''
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '+91',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false
  });

  const lookupPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;
    try {
      setAddressLoading(true);
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      
      if (data && data[0].Status === 'Success') {
        const { District, State } = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: District,
          state: State
        }));
      }
    } catch (error) {
      // Pincode lookup error handled silently
    } finally {
      setAddressLoading(false);
    }
  };

  // Check for demo admin user on mount
  useEffect(() => {
    const demoUser = localStorage.getItem('demoAdminUser');
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        setDemoAdmin(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Allow access if user is logged in OR demo admin is present
    if (!isLoading && !user && !demoAdmin) {
      // Wait a bit for demoAdmin state to be set
      const timer = setTimeout(() => {
        const demoUser = localStorage.getItem('demoAdminUser');
        if (!demoUser) {
          router.push('/login');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router, demoAdmin]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user || !supabase) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone || '+91',
          gender: data.gender || '',
          date_of_birth: data.date_of_birth || ''
        });
      }
    }
    fetchProfile();
  }, [user, supabase]);

  // Fetch Addresses
  useEffect(() => {
    async function fetchAddresses() {
      if (!user || !supabase) return;
      const { data } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (data) setSavedAddresses(data);
    }
    fetchAddresses();
  }, [user, supabase]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressLoading(true);

    try {
      // If setting as default, unset others first (optional, but good UX)
      if (formData.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = editingAddressId 
        ? await supabase.from('user_addresses').update({ ...formData }).eq('id', editingAddressId).eq('user_id', user.id)
        : await supabase.from('user_addresses').insert({ user_id: user.id, ...formData });

      if (error) throw error;

      // Refresh list
      const { data } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
        
      if (data) setSavedAddresses(data);
      
      // Reset form
      setFormData({
        full_name: '',
        phone: '+91',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        is_default: false
      });
      setEditingAddressId(null);
      setSuccessMessage(editingAddressId ? 'Address updated successfully!' : 'Address saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // Error saving address handled silently
      // Fallback for error handling (could also be a state message)
      alert('Failed to save address. Please try again.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setFormData({
      full_name: addr.full_name,
      phone: addr.phone || '',
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      is_default: addr.is_default
    });
    // Scroll to form (optional, simplified by just focusing input if possible, or user simply sees form populated)
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingAddressId(null);
    setFormData({
      full_name: '',
      phone: '+91',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      is_default: false
    });
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    const { error } = await supabase.from('user_addresses').delete().eq('id', id);
    if (!error) {
      setSavedAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no user and no demo admin, show loading (redirect will happen)
  if (!user && !demoAdmin) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Use demo admin data if no real user
  const currentUser = user || demoAdmin;

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistItems.length },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'paid': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-12 bg-cream dark:bg-[var(--background)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white dark:bg-[var(--background-alt)] p-6 rounded-2xl shadow-sm border border-clay/10 dark:border-white/10 text-center">
              <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4 text-terracotta">
                <User className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-xl font-medium text-text-dark">
                {profile?.full_name || currentUser.email?.split('@')[0] || 'Admin'}
              </h2>
              <p className="text-sm text-text-muted mt-1">{currentUser.email || 'admin@thevybestore.com'}</p>
            </div>

            {/* Navigation */}
            <nav className="bg-white dark:bg-[var(--background-alt)] p-4 rounded-2xl shadow-sm border border-clay/10 dark:border-white/10">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button 
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-terracotta/10 text-terracotta' 
                          : 'text-text-dark dark:text-gray-200 hover:bg-sand dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="text-xs bg-terracotta text-white px-2 py-0.5 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                <li>
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-clay/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-[var(--background-alt)] p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10 dark:border-white/10"
                >
                  <h3 className="font-serif text-2xl font-medium text-text-dark mb-6">My Orders</h3>
                  
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-sand/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-text-muted" />
                      </div>
                      <h4 className="font-serif text-xl font-medium text-text-dark mb-2">No orders yet</h4>
                      <p className="text-text-muted max-w-sm mx-auto mb-6">
                        You haven't placed any orders yet. Start exploring our handcrafted collection.
                      </p>
                      <Link 
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Link 
                          href={`/account/orders/${order.id}`}
                          key={order.id} 
                          className="block border border-clay/10 rounded-xl p-4 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                            <div>
                              <p className="text-sm text-text-muted">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="font-medium text-terracotta">
                                {formatPrice(order.total_amount)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-clay/10">
                            <span className="text-sm text-text-muted">
                              {order.items?.length || 0} item(s)
                            </span>
                            <ChevronRight className="w-4 h-4 text-text-muted ml-auto" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-[var(--background-alt)] p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10 dark:border-white/10"
                >
                  <h3 className="font-serif text-2xl font-medium text-text-dark mb-6">My Wishlist</h3>
                  
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-sand/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-text-muted" />
                      </div>
                      <h4 className="font-serif text-xl font-medium text-text-dark mb-2">Your wishlist is empty</h4>
                      <p className="text-text-muted max-w-sm mx-auto mb-6">
                        Save items you love by clicking the heart icon on any product.
                      </p>
                      <Link 
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {wishlistItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="border border-clay/10 rounded-xl p-4 flex gap-4"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                            <Image
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-text-dark truncate">{item.name}</h4>
                            <p className="text-sm text-text-muted">{item.category}</p>
                            <p className="text-terracotta font-medium mt-1">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Link 
                              href={`/products/${item.id}`}
                              className="p-2 rounded-lg bg-sand hover:bg-terracotta/10 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-text-muted" />
                            </Link>
                            <button 
                              onClick={() => removeFromWishlist(item.id)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-[var(--background-alt)] p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10 dark:border-white/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-2xl font-medium text-text-dark">Saved Addresses</h3>
                  </div>
                  
                  {/* Add/Edit Form */}
                  <div className="bg-sand/30 rounded-2xl p-6 mb-8 relative">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-text-dark">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h4>
                      {editingAddressId && (
                        <button onClick={cancelEdit} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      )}
                    </div>
                    {successMessage && (
                      <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {successMessage}
                      </div>
                    )}
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={e => setFormData({...formData, full_name: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">Phone</label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={e => {
                              const val = e.target.value;
                              if (!val.startsWith('+91')) return;
                              const num = val.slice(3).replace(/\D/g, ''); // Strip non-digits
                              setFormData({...formData, phone: `+91${num}`});
                            }}
                            className="w-full px-4 py-2.5 bg-white dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                            placeholder="+919876543210"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Address Line 1</label>
                        <input
                          type="text"
                          required
                          value={formData.address_line1}
                          onChange={e => setFormData({...formData, address_line1: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                          placeholder="House/Flat No., Building Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Address Line 2</label>
                        <input
                          type="text"
                          value={formData.address_line2}
                          onChange={e => setFormData({...formData, address_line2: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                          placeholder="Street, Locality"
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">State</label>
                          <input
                            type="text"
                            required
                            value={formData.state}
                            onChange={e => setFormData({...formData, state: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-1">PIN Code</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={formData.postal_code}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              setFormData({...formData, postal_code: val});
                              if (val.length === 6) lookupPincode(val);
                            }}
                            className="w-full px-4 py-2.5 bg-white dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                            placeholder="400001"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="default-address" 
                          checked={formData.is_default}
                          onChange={e => setFormData({...formData, is_default: e.target.checked})}
                          className="w-4 h-4 accent-terracotta" 
                        />
                        <label htmlFor="default-address" className="text-sm text-text-muted">Set as default address</label>
                      </div>
                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="px-6 py-3 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                      >
                        {addressLoading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address')}
                      </button>
                    </form>
                  </div>
                  
                  {/* Saved Addresses List */}
                  <div className="space-y-4">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="border border-clay/10 p-4 rounded-xl flex justify-between items-start bg-white dark:bg-white/5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-dark">{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="text-[10px] bg-terracotta/10 text-terracotta px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">Default</span>
                            )}
                          </div>
                          <p className="text-text-muted text-sm">{addr.address_line1}, {addr.address_line2}</p>
                          <p className="text-text-muted text-sm">{addr.city}, {addr.state} - {addr.postal_code}</p>
                          <p className="text-text-muted text-sm mt-1">{addr.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditAddress(addr)}
                            className="text-text-muted hover:text-terracotta p-2"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteAddress(addr.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {savedAddresses.length === 0 && (
                      <p className="text-sm text-text-muted text-center py-4">No saved addresses found.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-[var(--background-alt)] p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10 dark:border-white/10"
                >
                  <h3 className="font-serif text-2xl font-medium text-text-dark mb-6">Account Settings</h3>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user) return;
                    setProfileLoading(true);
                    try {
                      const { error } = await supabase
                        .from('profiles')
                        .update({
                          full_name: profileData.full_name,
                          phone: profileData.phone,
                          gender: profileData.gender || null, // Handle empty string as null
                          date_of_birth: profileData.date_of_birth || null
                        })
                        .eq('id', user.id);
                        
                      if (error) throw error;
                      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
                      setTimeout(() => setProfileMessage(null), 3000);
                    } catch (error: any) {
                      // Error updating profile logged to state
                      let errorMessage = error.message || 'Failed to update profile.';
                      
                      // Check for missing column error (Postgres code 42703)
                      if (error.code === '42703' || errorMessage.includes('column')) {
                        errorMessage = 'Database needs update. Please run the migration script.';
                      }
                      
                      setProfileMessage({ 
                        type: 'error', 
                        text: errorMessage
                      });
                    } finally {
                      setProfileLoading(false);
                    }
                  }} className="space-y-6">
                    {profileMessage && (
                      <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                        profileMessage.type === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          profileMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {profileMessage.text}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                        className="w-full px-4 py-3 bg-sand/30 dark:bg-white/5 border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                      <input
                        type="email"
                        value={currentUser.email || 'admin@thevybestore.com'}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-clay/20 dark:border-white/10 rounded-xl text-text-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val.startsWith('+91')) return;
                          const num = val.slice(3).replace(/\D/g, ''); // Strip non-digits
                          setProfileData({...profileData, phone: `+91${num}`});
                        }}
                        className="w-full px-4 py-3 bg-sand/30 dark:bg-white/5 border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Gender</label>
                        <select
                          value={profileData.gender}
                          onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                          className="w-full px-4 py-3 bg-sand/30 dark:bg-white/5 border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={profileData.date_of_birth}
                          onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                          className="w-full px-4 py-3 bg-sand/30 dark:bg-white/5 border border-clay/20 dark:border-white/10 rounded-xl focus:outline-none focus:border-terracotta dark:text-white"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-3 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
