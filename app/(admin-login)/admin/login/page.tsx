'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';



export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: loginError } = await login(email, password);

    if (loginError) {
      setError(loginError);
      setIsLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cream">
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(198, 123, 92, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 159, 130, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201, 169, 98, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [-50, 50, -50],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Grain overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Back to store */}
      <motion.div
        className="absolute top-8 left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link 
          href="/"
          className="flex items-center gap-2 text-text-muted hover:text-terracotta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to store</span>
        </Link>
      </motion.div>

      {/* Login card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Decorative border */}
        <div className="absolute -inset-px bg-gradient-to-br from-terracotta/20 via-gold/20 to-sage/20 rounded-[28px] blur-sm" />
        
        <div className="relative bg-cream/90 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-clay/20 p-10 border border-clay/10">
          {/* Logo */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Sparkles className="w-8 h-8 text-cream" />
                </motion.div>
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-dashed border-terracotta/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
            
            <h1 className="font-display text-3xl font-light text-text-dark mb-2 tracking-wide">
              Studio Access
            </h1>
            <p className="text-text-muted">Sign in to manage The Vybe Store</p>
          </motion.div>

          {/* Demo credentials */}
          <motion.div 
            className="mb-8 p-4 bg-sage/10 rounded-2xl border border-sage/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-sage rounded-full animate-pulse" />
              <span className="text-xs font-medium text-sage-dark uppercase tracking-wider">Demo Access</span>
            </div>
            <p className="text-sm text-text-muted">
              <span className="font-mono text-text-dark">admin@thevybestore.com</span>
              <span className="mx-2">/</span>
              <span className="font-mono text-text-dark">admin123</span>
            </p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-terracotta/20 to-gold/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-md" />
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-terracotta transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-sand/50 border border-clay/20 rounded-xl text-text-dark placeholder:text-text-light focus:outline-none focus:border-terracotta focus:bg-cream transition-all"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-text-dark mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-terracotta/20 to-gold/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-md" />
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-terracotta transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-14 py-4 bg-sand/50 border border-clay/20 rounded-xl text-text-dark placeholder:text-text-light focus:outline-none focus:border-terracotta focus:bg-cream transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-4 mt-6 rounded-xl font-medium text-cream overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {/* Button gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-terracotta via-terracotta-dark to-terracotta transition-all group-hover:scale-105" />
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Enter Studio'
                )}
              </span>
            </motion.button>
          </form>

          {/* Footer */}
          <motion.p 
            className="text-center mt-8 text-sm text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="font-display italic">The Vybe Store — Crafted by Neha Kumari</span>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
