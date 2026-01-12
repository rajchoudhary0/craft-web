'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Sun, Moon, Search, Heart, ArrowRight, Sparkles, User, Settings } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { products } from '@/lib/data';
import MobileMenu from './MobileMenu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/gift-cards', label: 'Gift Cards' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAdmin, setIsAdmin] = useState(false);
  const { totalItems, openCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      // Check for demo admin user first
      const demoUser = localStorage.getItem('demoAdminUser');
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          if (parsed.role === 'admin') {
            setIsAdmin(true);
            return;
          }
        } catch {
          // Invalid JSON, ignore
        }
      }

      // Check Supabase user role
      if (user && supabase) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          setIsAdmin(profile?.role === 'admin');
        } catch {
          setIsAdmin(false);
        }
      } else if (!demoUser) {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Body scroll lock moved to MobileMenu component

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const searchResults = searchQuery.length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      {/* ===== FULL WIDTH NAVBAR ===== */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-cream shadow-lg' 
            : 'bg-cream/95 backdrop-blur-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top decorative stitch line */}
        <div className="h-1 w-full bg-gradient-to-r from-terracotta via-gold to-sage" />
        
        {/* Main navbar */}
        <div className="w-full px-4 sm:px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            
            {/* ===== LOGO - Sparkles Style ===== */}
            <Link href="/" className="group flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-terracotta flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="currentColor" />
                  <circle cx="19" cy="5" r="1" fill="currentColor" />
                  <path d="M19 3V7M17 5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.div>
              
              {/* Brand text */}
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-semibold text-text-dark tracking-tight leading-none">
                  The Vybe Store
                </h1>
                <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted font-medium mt-0.5">
                  by Raj
                </p>
              </div>
            </Link>

            {/* ===== CENTER NAVIGATION ===== */}
            <nav className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
              <ul className="flex items-center gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="relative group px-5 py-3 block"
                      >
                        {/* Text */}
                        <span className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                          isActive ? 'text-terracotta' : 'text-text-dark group-hover:text-terracotta'
                        }`}>
                          {link.label}
                        </span>
                        
                        {/* Curved underline */}
                        <svg 
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[70%] h-2"
                          viewBox="0 0 60 8"
                          fill="none"
                        >
                          <path
                            d="M2 4 Q15 1 30 4 T58 4"
                            stroke="var(--terracotta)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className={`transition-all duration-300 ${
                              isActive 
                                ? 'opacity-100' 
                                : 'opacity-0 group-hover:opacity-100'
                            }`}
                            style={{
                              strokeDasharray: 60,
                              strokeDashoffset: isActive ? 0 : 60,
                              transition: 'stroke-dashoffset 0.4s ease-out, opacity 0.3s ease'
                            }}
                          />
                        </svg>

                        {/* Decorative dot on active */}
                        {isActive && (
                          <motion.div
                            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-terracotta rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ===== RIGHT ACTIONS ===== */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <motion.button
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-text-dark hover:bg-sand hover:text-terracotta transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Admin Dashboard - Only visible to admins */}
              {isAdmin && (
                <Link href="/admin">
                  <motion.div
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-sage/20 text-sage-dark hover:bg-sage/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </motion.div>
                </Link>
              )}

              {/* Account */}
              <Link href={(isAdmin || user) ? "/account" : "/login"}>
                <motion.div
                  className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-text-dark hover:bg-sand hover:text-terracotta transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="w-5 h-5" />
                </motion.div>
              </Link>

              {/* Theme */}
              <motion.button
                onClick={toggleTheme}
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-text-dark hover:bg-sand hover:text-terracotta transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
              
              {/* Wishlist */}
              <Link href="/wishlist" className="hidden sm:block">
                <motion.div
                  className="relative w-10 h-10 flex items-center justify-center rounded-full text-text-dark hover:bg-sand hover:text-terracotta transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </motion.div>
              </Link>
              
              {/* Cart Button */}
              <motion.button
                onClick={openCart}
                className="relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-terracotta text-white font-medium text-sm hover:bg-terracotta-dark transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <motion.span
                    className="w-5 h-5 bg-white text-terracotta text-xs font-bold rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={totalItems}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-text-dark hover:bg-sand"
                whileTap={{ scale: 0.95 }}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom stitch line on scroll */}
        <motion.div 
          className="h-px w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolled ? 1 : 0 }}
        >
          <svg width="100%" height="2" preserveAspectRatio="none">
            <motion.line
              x1="0" y1="1" x2="100%" y2="1"
              stroke="var(--clay)"
              strokeWidth="1"
              strokeDasharray="8 4"
            />
          </svg>
        </motion.div>
      </motion.header>

      {/* ===== SEARCH MODAL ===== */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-text-dark/70 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
            
            <motion.div
              className="absolute top-0 left-0 right-0 bg-[var(--background)] shadow-2xl"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="px-4 sm:px-6 lg:px-12 py-6">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 border-b-2 border-clay/20 pb-4">
                    <Search className="w-6 h-6 text-text-muted flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search handcrafted treasures..."
                      autoFocus
                      className="flex-1 text-xl text-text-dark placeholder:text-text-muted/60 focus:outline-none bg-transparent font-display"
                    />
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-sand transition-colors"
                    >
                      <X className="w-5 h-5 text-text-muted" />
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="py-4 space-y-2">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => { router.push(`/products/${product.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-sand transition-colors text-left group"
                        >
                          <div className="w-14 h-14 rounded-lg bg-cream overflow-hidden flex-shrink-0 border border-clay/10">
                            <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-dark group-hover:text-terracotta transition-colors">{product.name}</p>
                            <p className="text-sm text-text-muted">{product.category || 'Uncategorized'}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchQuery.length > 1 && searchResults.length === 0 && (
                    <p className="py-8 text-center text-text-muted">No handcrafted items found</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MOBILE MENU ===== */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        user={user}
        wishlistCount={wishlistItems.length}
        cartCount={totalItems}
        onOpenCart={openCart}
        theme={theme}
        onToggleTheme={toggleTheme}
        isAdmin={isAdmin}
      />
    </>
  );
}
