'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Redirect if no session - in real flow, the email link provides the session code
  useEffect(() => {
    if (!supabase) return;
    
    // Check if we have a session (the link should sign the user in automatically)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If not signed in (maybe link expired or opened in different browser), redirect to login
        // But for update password, usually the hash params handle it. 
        // We'll let it stay for now as SUPABASE handles the hash exchange automatically on client init
      }
    });
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-terracotta via-gold to-sage" />

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center transition-transform group-hover:rotate-12">
               <Sparkles className="w-4 h-4 text-cream" />
             </div>
             <span className="font-display font-medium text-text-dark">The Vybe Store</span>
          </Link>
          <h1 className="font-serif text-2xl font-semibold text-text-dark mb-2">New Password</h1>
          <p className="text-text-muted text-sm">Enter your new secure password</p>
        </div>

        {success ? (
          <div className="p-4 bg-green-50 text-green-700 text-center rounded-xl border border-green-100">
            Password updated successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clay" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-sand/30 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clay" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-sand/30 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="Repeat password"
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
                  Update Password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
