'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, User, Heart, ShoppingBag, Moon, Sun } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string }[];
  user: any;
  wishlistCount: number;
  cartCount: number;
  onOpenCart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  user,
  wishlistCount,
  cartCount,
  onOpenCart,
  theme,
  onToggleTheme
}: MobileMenuProps) {
  const pathname = usePathname();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Track pathname to only close on CHANGE
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      onClose();
      prevPathname.current = pathname;
    }
  }, [pathname, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            className="fixed inset-0 z-50 lg:hidden bg-text-dark/40 backdrop-blur-md" // Lighter, blurrier backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            key="mobile-sidebar"
            className="fixed right-0 top-0 bottom-0 z-50 w-[85%] max-w-sm bg-[var(--background)] border-l border-clay/10 lg:hidden shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ 
              x: '100%',
              transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } // "Expo In" for snappy exit
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.19, 1, 0.22, 1], // "Expo Out" for smooth entry
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-clay/10 flex-shrink-0">
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
                <button 
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-sand transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Nav Links - Scrollable area */}
              <nav className="flex-1 overflow-y-auto p-6">
                <ul className="space-y-2">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, y: 10 }} // Slide UP instead of left/right for subtle feel
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: 0.1 + (index * 0.05), // Tighter stagger
                          duration: 0.4,
                          ease: "easeOut"
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={onClose}
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

              {/* Quick Actions Bar - Fixed at bottom */}
              <div className="mt-auto border-t border-clay/10 bg-[var(--background)] flex-shrink-0">
                <div className="grid grid-cols-4 divide-x divide-clay/10">
                  {/* Account */}
                  <Link 
                    href={user ? "/account" : "/login"}
                    onClick={onClose}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors"
                  >
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-wider">{user ? "Account" : "Sign In"}</span>
                  </Link>
                  
                  {/* Wishlist */}
                  <Link 
                    href="/wishlist"
                    onClick={onClose}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors relative"
                  >
                    <Heart className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-wider">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="absolute top-2 right-1/4 w-4 h-4 bg-terracotta text-white text-[10px] rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Cart */}
                  <button 
                    onClick={() => {
                      onClose();
                      onOpenCart();
                    }}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors relative"
                  >
                    <ShoppingBag className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-wider">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute top-2 right-1/4 w-4 h-4 bg-terracotta text-white text-[10px] rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Theme Toggle */}
                  <button 
                    onClick={onToggleTheme}
                    className="flex flex-col items-center py-4 text-text-muted hover:text-terracotta transition-colors"
                  >
                    {theme === 'light' ? <Moon className="w-5 h-5 mb-1" /> : <Sun className="w-5 h-5 mb-1" />}
                    <span className="text-[10px] uppercase tracking-wider">{theme === 'light' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
