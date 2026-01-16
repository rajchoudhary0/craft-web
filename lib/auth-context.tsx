'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          // Handle invalid refresh token error gracefully
          if (error.message?.includes('Refresh Token')) {
            // Session expired, signing out silently
            await supabase.auth.signOut();
          }
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        // Error getting session - handled silently
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      // Handle token refresh errors gracefully
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setSession(session);
        setUser(session?.user ?? null);
        // Refresh router on auth change to update protected routes
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/');
    router.refresh();
  };

  // If Supabase is not configured, render children without auth context
  if (!supabase) {
    return (
      <AuthContext.Provider value={{ user: null, session: null, isLoading: false, signOut: async () => {} }}>
        {children}
        {/* Helper Banner for Devs */}
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm z-50">
          Supabase keys missing. Add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to .env.local
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
