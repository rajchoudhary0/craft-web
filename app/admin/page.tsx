'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  DollarSign, Package, ShoppingBag, AlertTriangle, 
  TrendingUp, ArrowRight, ArrowUpRight, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { formatPrice } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { createClient } from '@/lib/supabase/client';

const COLORS = ['#C67B5C', '#8BA888', '#D4A574', '#A69080', '#7D9B8C'];

interface DashboardStats {
  revenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user: { email: string } | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: { name: string } | null;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ revenue: 0, totalOrders: 0, totalProducts: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    // Fetch products count
    const { data: productsData, count: productsCount } = await supabase
      .from('products')
      .select('id, name, price, category:categories(name)', { count: 'exact' });

    // Fetch orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at, user:profiles(email)')
      .order('created_at', { ascending: false });

    // Fetch categories for distribution
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name');

    const orders = (ordersData || []) as Order[];
    const allProducts = (productsData || []) as Product[];

    // Calculate stats
    const revenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pending = orders.filter(o => o.status === 'pending').length;

    setStats({
      revenue,
      totalOrders: orders.length,
      totalProducts: productsCount || allProducts.length,
      pendingOrders: pending,
    });

    setRecentOrders(orders.slice(0, 5));
    setProducts(allProducts);

    // Calculate category distribution
    const catCounts: Record<string, number> = {};
    allProducts.forEach(p => {
      const catName = p.category?.name || 'Other';
      catCounts[catName] = (catCounts[catName] || 0) + 1;
    });
    
    const total = allProducts.length || 1;
    const catData = Object.entries(catCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
    }));
    setCategoryData(catData);

    setIsLoading(false);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.revenue),
      change: stats.totalOrders > 0 ? `${stats.totalOrders} orders` : 'No orders yet',
      changeType: 'up' as const,
      icon: DollarSign,
      color: 'bg-terracotta/10 text-terracotta',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      change: '',
      changeType: 'neutral' as const,
      icon: ShoppingBag,
      color: 'bg-sage/10 text-sage',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      change: '',
      changeType: 'neutral' as const,
      icon: Package,
      color: 'bg-gold/10 text-gold-dark',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      change: stats.pendingOrders > 0 ? 'Need attention' : '',
      changeType: stats.pendingOrders > 0 ? 'alert' : 'neutral' as const,
      icon: AlertTriangle,
      color: stats.pendingOrders > 0 ? 'bg-orange-100 text-orange-600' : 'bg-clay/10 text-text-muted',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-semibold text-text-dark">Dashboard</h1>
        <p className="text-text-muted">Welcome back to your creative studio</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {statCards.map((stat) => (
          <motion.div
            key={stat.title}
            className="bg-cream rounded-2xl p-5 border border-clay/10 hover:shadow-md transition-shadow"
            variants={fadeInUp}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.change && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${
                  stat.changeType === 'up' ? 'text-green-600' :
                  stat.changeType === 'alert' ? 'text-orange-600' :
                  'text-text-muted'
                }`}>
                  {stat.changeType === 'up' && <ArrowUpRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-text-dark mb-1">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <motion.div
          className="lg:col-span-2 bg-cream rounded-2xl p-6 border border-clay/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-serif font-semibold text-text-dark mb-2">Product Categories</h3>
          <p className="text-sm text-text-muted mb-4">Distribution by category</p>
          {categoryData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#F9F6F1', 
                      border: '1px solid #E8E0D5',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted">
              No products yet
            </div>
          )}
          <div className="space-y-2 mt-4">
            {categoryData.slice(0, 4).map((cat, index) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-text-muted">{cat.name}</span>
                </div>
                <span className="font-medium text-text-dark">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Best Products */}
        <motion.div
          className="bg-cream rounded-2xl p-6 border border-clay/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-text-dark">Top Products</h3>
            <Link 
              href="/admin/products" 
              className="text-sm text-terracotta hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-clay/10 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-dark truncate">{product.name}</p>
                  <p className="text-xs text-text-muted">{product.category?.name || 'Uncategorized'}</p>
                </div>
                <span className="font-medium text-terracotta">{formatPrice(product.price)}</span>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-center text-text-muted py-4">No products yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        className="bg-cream rounded-2xl p-6 border border-clay/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif font-semibold text-text-dark">Recent Orders</h3>
          <Link 
            href="/admin/orders" 
            className="text-sm text-terracotta hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between py-3 border-b border-clay/10 last:border-0"
              >
                <div>
                  <p className="font-medium text-text-dark">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-text-muted">{order.user?.email || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-dark">{formatPrice(order.total_amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-muted py-8">No orders yet</p>
        )}
      </motion.div>
    </div>
  );
}
