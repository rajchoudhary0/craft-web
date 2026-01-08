'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-cream rounded-3xl p-8 shadow-xl border border-clay/10 relative overflow-hidden">
        {/* Decorative top stitch */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-terracotta via-gold to-sage" />

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center transition-transform group-hover:rotate-12">
               <Sparkles className="w-4 h-4 text-cream" />
             </div>
             <span className="font-display font-medium text-text-dark">The Vybe Store</span>
          </Link>
          <h1 className="font-serif text-2xl font-semibold text-text-dark mb-2">Reset Password</h1>
          <p className="text-text-muted text-sm">We'll send you instructions to reset your password</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-text-dark">Check your email</h3>
              <p className="text-sm text-text-muted">
                We've sent password reset instructions to <span className="font-medium text-text-dark">{email}</span>
              </p>
            </div>
            <Link 
              href="/login"
              className="block w-full py-3.5 bg-text-dark text-cream rounded-xl font-medium hover:bg-terracotta transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1.5 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clay" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-sand/30 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-text-dark text-cream rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-terracotta transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Instructions
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="text-center pt-2">
              <Link href="/login" className="text-sm text-text-muted hover:text-text-dark inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
