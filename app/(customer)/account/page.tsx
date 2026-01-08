'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, LogOut, Settings, Heart, MapPin, 
  Loader2, ShoppingBag, Calendar, ChevronRight, Trash2, Eye
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user || !supabase) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    }
    fetchProfile();
  }, [user, supabase]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-12 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-clay/10 text-center">
              <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4 text-terracotta">
                <User className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-xl font-medium text-text-dark">
                {profile?.full_name || user.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-text-muted mt-1">{user.email}</p>
            </div>

            {/* Navigation */}
            <nav className="bg-white p-4 rounded-2xl shadow-sm border border-clay/10">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button 
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-terracotta/10 text-terracotta' 
                          : 'text-text-dark hover:bg-sand'
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
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10"
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
                        <div 
                          key={order.id} 
                          className="border border-clay/10 rounded-xl p-4 hover:shadow-md transition-shadow"
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
                        </div>
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
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10"
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
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10"
                >
                  <h3 className="font-serif text-2xl font-medium text-text-dark mb-6">Saved Addresses</h3>
                  
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-sand/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-text-muted" />
                    </div>
                    <h4 className="font-serif text-xl font-medium text-text-dark mb-2">No saved addresses</h4>
                    <p className="text-text-muted max-w-sm mx-auto mb-6">
                      Your shipping addresses will appear here after your first order.
                    </p>
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
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-clay/10"
                >
                  <h3 className="font-serif text-2xl font-medium text-text-dark mb-6">Account Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={profile?.full_name || ''}
                        className="w-full px-4 py-3 bg-sand/30 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 border border-clay/20 rounded-xl text-text-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue={profile?.phone || ''}
                        className="w-full px-4 py-3 bg-sand/30 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <button className="px-6 py-3 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors">
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
