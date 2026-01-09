'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Sun, Moon, Search, Heart, ArrowRight, Sparkles, User } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';
import { products } from '@/lib/data';

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
  const { totalItems, openCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

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
                  by Neha Kumari
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

              {/* Account */}
              <Link href={user ? "/account" : "/login"}>
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
      <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-backdrop"
              className="fixed inset-0 z-50 lg:hidden bg-text-dark/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {isMobileMenuOpen && (
            <motion.div
              key="mobile-sidebar"
              className="fixed right-0 top-0 bottom-0 z-50 w-[85%] max-w-sm bg-[var(--background)] border-l border-clay/10 lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%', transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-clay/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="currentColor" />
                      <circle cx="19" cy="5" r="1" fill="currentColor" />
                      <path d="M19 3V7M17 5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="font-display font-semibold text-text-dark">The Vybe Store</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-sand">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Nav */}
              <nav className="p-6">
                <ul className="space-y-2">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-4 py-4 rounded-xl text-lg font-medium transition-all ${
                            isActive 
                              ? 'bg-terracotta text-white' 
                              : 'text-text-dark hover:bg-sand'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Quick Actions Bar */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-clay/10 bg-[var(--background)]">
                <div className="grid grid-cols-4 divide-x divide-clay/10">
                  {/* Account (Replaces Search) */}
                  <Link 
                    href={user ? "/account" : "/login"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors"
                  >
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-wider">{user ? "Account" : "Sign In"}</span>
                  </Link>
                  
                  {/* Wishlist */}
                  <Link 
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors relative"
                  >
                    <Heart className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-wider">Wishlist</span>
                    {wishlistItems.length > 0 && (
                      <span className="absolute top-2 right-1/4 w-4 h-4 bg-terracotta text-white text-[10px] rounded-full flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                  
                  {/* Cart */}
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openCart();
                    }}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors relative"
                  >
                    <ShoppingBag className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-wider">Cart</span>
                    {totalItems > 0 && (
                      <span className="absolute top-2 right-1/4 w-4 h-4 bg-terracotta text-white text-[10px] rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                  
                  {/* Theme Toggle */}
                  <button 
                    onClick={toggleTheme}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors"
                  >
                    {theme === 'light' ? <Moon className="w-5 h-5 mb-1" /> : <Sun className="w-5 h-5 mb-1" />}
                    <span className="text-[10px] uppercase tracking-wider">{theme === 'light' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}
