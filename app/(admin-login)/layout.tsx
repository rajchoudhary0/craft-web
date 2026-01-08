'use client';

import { AdminProvider } from '@/lib/admin-context';

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
