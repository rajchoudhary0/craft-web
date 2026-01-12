'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingBag, Settings, 
  LogOut, ChevronLeft, Users, Sparkles, Ticket, Gift, MessageSquare
} from 'lucide-react';
import { AdminProvider, RequireAdmin, useAdmin } from '@/lib/admin-context';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: MessageSquare, label: 'Reviews', href: '/admin/reviews' },
  { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
  { icon: Gift, label: 'Gift Cards', href: '/admin/gift-cards' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdmin();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-sand/50 border-r border-clay/10 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-clay/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cream" />
            </div>
            <div>
              <span className="font-display text-lg font-medium text-text-dark">
                The Vybe Store
              </span>
              <p className="text-xs text-text-muted -mt-0.5">Studio Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-terracotta text-cream'
                        : 'text-text-muted hover:bg-cream hover:text-text-dark'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-clay/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-cream rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center">
              <span className="text-terracotta font-display font-medium">
                {(user?.email || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-dark text-sm truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-xs text-text-muted capitalize">{user?.role || 'Admin'}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 w-full px-4 py-2.5 mt-1 text-text-muted hover:text-terracotta hover:bg-terracotta/5 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-clay/10 bg-cream sticky top-0 z-30">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cream" />
            </div>
            <span className="font-display font-medium text-text-dark">The Vybe Store</span>
          </Link>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <RequireAdmin>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </RequireAdmin>
    </AdminProvider>
  );
}
