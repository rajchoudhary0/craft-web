'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Admin Login Page - Redirects to unified login
 * 
 * This page now redirects to /login since the main login form
 * handles both admin and customer authentication with role-based routing.
 */
export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta mx-auto mb-4" />
        <p className="text-text-muted text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}
