import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import CartDrawer from "@/components/cart/CartDrawer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Vybe Store | Handcrafted by Neha Kumari",
  description: "Discover unique, handmade creations crafted with passion by Neha Kumari. Premium handcrafted goods with authentic artisanal vibes.",
  keywords: ["handmade", "crafts", "artisan", "handcrafted", "home decor", "ceramics", "textiles", "neha kumari"],
  openGraph: {
    title: "The Vybe Store | Handcrafted by Neha Kumari",
    description: "Discover unique, handmade creations crafted with passion.",
    type: "website",
    locale: "en_US",
    siteName: "The Vybe Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Vybe Store | Handcrafted by Neha Kumari",
    description: "Discover unique, handmade creations crafted with passion.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
