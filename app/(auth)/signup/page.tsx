'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/account');
    }
  }, [user, authLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) throw error;
      
      // Check if session exists (auto-confirm disabled) or if user needs to confirm email
      if (data.user && !data.session) {
        setSuccess(true);
      } else {
        // Auto-login (email confirmation disabled)
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  // Don't render form if user is logged in (redirect will happen)
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-cream rounded-[32px] p-8 md:p-10 shadow-2xl shadow-clay/20 border border-clay/10 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative text-center mb-8">
          <h1 className="font-serif text-3xl font-medium text-text-dark mb-3">Create Account</h1>
          <p className="text-text-muted">Join our community of craft lovers</p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-xl text-text-dark">Check your inbox</h3>
                <p className="text-text-muted leading-relaxed">
                  We've sent a confirmation link to <br/>
                  <span className="font-medium text-text-dark">{formData.email}</span>
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <p className="text-xs text-text-muted">
                  Didn't receive the email? <button className="text-terracotta hover:underline font-medium">Resend</button>
                </p>
                <Link 
                  href="/login"
                  className="block w-full py-4 bg-text-dark text-cream rounded-xl font-medium hover:bg-terracotta transition-all shadow-lg shadow-text-dark/10 hover:shadow-terracotta/20"
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSignup} 
              className="space-y-5 relative"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-terracotta transition-colors" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-sand/30 border border-clay/10 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all placeholder:text-text-muted/50"
                      placeholder="Neha Kumari"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5 ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-terracotta transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-sand/30 border border-clay/10 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all placeholder:text-text-muted/50"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-text-dark mb-1.5 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-terracotta transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full pl-12 pr-12 py-4 bg-sand/30 border border-clay/10 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all placeholder:text-text-muted/50"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-text-dark text-cream rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-terracotta transition-all shadow-lg shadow-text-dark/10 hover:shadow-terracotta/20 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">Create Account</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center pt-6 border-t border-clay/10">
          <p className="text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-terracotta font-medium hover:text-terracotta-dark hover:underline underline-offset-4 transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
