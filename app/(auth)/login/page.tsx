'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user, isLoading: authLoading } = useAuth();

  // Demo credentials for development (matching AdminContext)
  const DEMO_ADMIN = {
    email: 'admin@thevybestore.com',
    password: 'admin123',
  };

  // Redirect if already logged in - wait for logic to determine WHERE to go
  useEffect(() => {
    const checkRedirect = async () => {
      if (!authLoading && user) {
         // If we have a user, check if they are an admin to redirect correctly
         // This handles the case where an admin is logged in but visits /login
         try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();

            if (profile?.role === 'admin') {
               router.push('/admin');
            } else {
               router.push('/account');
            }
         } catch (e) {
            router.push('/account');
         }
      }
    };
    
    checkRedirect();
  }, [user, authLoading, router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check for Demo Admin first
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        const demoUser = {
          id: 'demo-admin-id',
          email: DEMO_ADMIN.email,
          role: 'admin',
        };
        // We need to set this for AdminContext to pick it up
        localStorage.setItem('demoAdminUser', JSON.stringify(demoUser));
        
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 600));
        
        router.push('/admin');
        return;
      }

      // 2. Regular Supabase Auth
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // 3. Check Role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
        
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
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
          <h1 className="font-serif text-2xl font-semibold text-text-dark mb-2">Welcome</h1>
          <p className="text-text-muted text-sm">Sign in to access your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
            <span className="font-bold">!</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clay" />
              <input
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-sand/30 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
             <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-sm font-medium text-text-dark">Password</label>
              <Link href="/forgot-password" className="text-xs text-terracotta hover:text-terracotta-dark">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clay" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-sand/30 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder="••••••••"
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
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            Don't have an account?{' '}
            <Link href="/signup" className="text-terracotta font-medium hover:text-terracotta-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
