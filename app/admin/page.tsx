'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  DollarSign, Package, ShoppingBag, AlertTriangle, 
  TrendingUp, ArrowRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  getDashboardStats, getSalesData, getCategoryData, 
  getBestSellers, getRecentOrders, formatDate, getStatusColor 
} from '@/lib/admin-data';
import { formatPrice } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const COLORS = ['#C67B5C', '#8BA888', '#D4A574', '#A69080', '#7D9B8C'];

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const salesData = getSalesData();
  const categoryData = getCategoryData();
  const bestSellers = getBestSellers();
  const recentOrders = getRecentOrders();

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.revenue),
      change: '+12.5%',
      changeType: 'up' as const,
      icon: DollarSign,
      color: 'bg-terracotta/10 text-terracotta',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      change: '+8.2%',
      changeType: 'up' as const,
      icon: ShoppingBag,
      color: 'bg-sage/10 text-sage',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      change: '2 new',
      changeType: 'neutral' as const,
      icon: Package,
      color: 'bg-gold/10 text-gold-dark',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      change: 'Need attention',
      changeType: stats.pendingOrders > 0 ? 'alert' : 'neutral' as const,
      icon: AlertTriangle,
      color: stats.pendingOrders > 0 ? 'bg-orange-100 text-orange-600' : 'bg-clay/10 text-text-muted',
    },
  ];

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
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-cream rounded-2xl p-5 border border-clay/10 hover:shadow-md transition-shadow"
            variants={fadeInUp}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${
                stat.changeType === 'up' ? 'text-green-600' :
                stat.changeType === 'alert' ? 'text-orange-600' :
                'text-text-muted'
              }`}>
                {stat.changeType === 'up' && <ArrowUpRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-semibold text-text-dark mb-1">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          className="lg:col-span-2 bg-cream rounded-2xl p-6 border border-clay/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif font-semibold text-text-dark">Weekly Sales</h3>
              <p className="text-sm text-text-muted">Revenue over the past week</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-sage">
              <TrendingUp className="w-4 h-4" />
              <span>+18%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C67B5C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C67B5C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                <XAxis dataKey="name" stroke="#A69080" fontSize={12} />
                <YAxis stroke="#A69080" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#F9F6F1', 
                    border: '1px solid #E8E0D5',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                  formatter={(value) => [formatPrice(value as number), 'Sales']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#C67B5C" 
                  strokeWidth={2}
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          className="bg-cream rounded-2xl p-6 border border-clay/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-serif font-semibold text-text-dark mb-2">Categories</h3>
          <p className="text-sm text-text-muted mb-4">Sales by category</p>
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
          <div className="space-y-2 mt-4">
            {categoryData.slice(0, 3).map((cat, index) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-text-muted">{cat.name}</span>
                </div>
                <span className="font-medium text-text-dark">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
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
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between py-3 border-b border-clay/10 last:border-0"
              >
                <div>
                  <p className="font-medium text-text-dark">{order.orderNumber}</p>
                  <p className="text-sm text-text-muted">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-dark">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Best Sellers */}
        <motion.div
          className="bg-cream rounded-2xl p-6 border border-clay/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-semibold text-text-dark">Best Sellers</h3>
            <Link 
              href="/admin/products" 
              className="text-sm text-terracotta hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" horizontal={false} />
                <XAxis type="number" stroke="#A69080" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#A69080" 
                  fontSize={11}
                  width={100}
                  tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#F9F6F1', 
                    border: '1px solid #E8E0D5',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="sales" fill="#8BA888" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
