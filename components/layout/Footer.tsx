'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const quickLinks = [
  { label: 'Shop All', href: '/products' },
  { label: 'New Arrivals', href: '/products?filter=new' },
  { label: 'Best Sellers', href: '/products?filter=best-seller' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const supportLinks = [
  { label: 'Shipping Info', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy' },
];

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Paper texture background */}
      <div className="absolute inset-0 bg-sand" />
      <div 
        className="absolute inset-0 opacity-50 dark:opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23c4b5a4' fill-opacity='0.15'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Hand-drawn top divider */}
      <div className="relative">
        <svg 
          viewBox="0 0 1440 40" 
          className="w-full h-10 -mb-1"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 20 Q120 5 240 20 T480 20 T720 20 T960 20 T1200 20 T1440 20 L1440 40 L0 40 Z"
            fill="var(--sand)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          />
          <motion.path
            d="M0 25 Q100 10 200 25 T400 22 T600 28 T800 20 T1000 25 T1200 22 T1440 28"
            stroke="var(--clay)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      <div className="container-custom relative py-16 md:py-20">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand Story */}
          <motion.div 
            className="md:col-span-5 lg:col-span-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              {/* Logo */}
              <Link href="/" className="inline-block mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-terracotta flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="currentColor" />
                      <circle cx="19" cy="5" r="1" fill="currentColor" />
                      <path d="M19 3V7M17 5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-display text-xl font-medium text-text-dark">
                      The Vybe Store
                    </span>
                    <p className="text-[9px] tracking-[0.25em] uppercase text-terracotta font-medium -mt-0.5">
                      by Neha Kumari
                    </p>
                  </div>
                </div>
              </Link>

              <p className="text-text-muted leading-relaxed mb-6 max-w-sm">
                Every piece we create carries a vybe — of creativity, passion, and 
                the warmth of handcrafted artistry. From my studio to your home.
              </p>

              {/* Signature */}
              <div className="mb-6">
                <svg viewBox="0 0 120 40" className="w-24 h-8">
                  <motion.path
                    d="M5 30 Q15 10 30 25 T60 20 T90 25 T115 22"
                    stroke="var(--terracotta)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </svg>
                <p className="text-xs text-text-light italic mt-1">— Neha Kumari</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Links */}
          <motion.div 
            className="md:col-span-3 lg:col-span-2 md:pt-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h4 
              className="font-serif font-medium text-text-dark mb-4"
              variants={fadeInUp}
            >
              Explore
            </motion.h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <motion.li key={link.href} variants={fadeInUp}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-terracotta transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 transition-all overflow-hidden">
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="md:col-span-3 lg:col-span-2 md:pt-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h4 
              className="font-serif font-medium text-text-dark mb-4"
              variants={fadeInUp}
            >
              Support
            </motion.h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <motion.li key={link.href} variants={fadeInUp}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            className="md:col-span-12 lg:col-span-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-cream/60 dark:bg-[var(--background-alt)]/60 backdrop-blur-sm rounded-2xl p-6 border border-clay/10 dark:border-white/10"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-terracotta" />
                <h4 className="font-serif font-medium text-text-dark">
                  Join The Vybe
                </h4>
              </div>
              
              <p className="text-sm text-text-muted mb-4">
                Be the first to know about new creations and exclusive offers.
              </p>

              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sage py-3"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm">Welcome to the vybe!</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-4 py-2.5 bg-cream dark:bg-[var(--background)] border border-clay/20 dark:border-white/10 rounded-full text-sm text-text-dark dark:text-gray-100 placeholder:text-text-light focus:outline-none focus:border-terracotta transition-colors"
                  />
                  <motion.button
                    type="submit"
                    className="px-5 py-2.5 bg-terracotta text-cream rounded-full text-sm font-medium hover:bg-terracotta-dark transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Join
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-clay/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                  whileHover={{ y: -2, scale: 1.1 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-sm text-text-muted text-center">
              © {new Date().getFullYear()} The Vybe Store. Crafted with{' '}
              <Heart className="w-3 h-3 inline fill-terracotta text-terracotta" />{' '}
              by Neha Kumari
            </p>

            {/* Handmade badge */}
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span className="text-xs text-text-muted">100% Handcrafted</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
