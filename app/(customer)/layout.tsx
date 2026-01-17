'use client';

import { useState } from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import SplashScreen from "@/components/SplashScreen";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [splashComplete, setSplashComplete] = useState(false);

  return (
    <CartProvider>
      <WishlistProvider>
        {/* Splash Screen - shows once per session */}
        <SplashScreen onComplete={() => setSplashComplete(true)} />
        
        <div className={`customer-layout ${!splashComplete ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <CustomCursor />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
