import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { StoreProvider } from "@/lib/store-context";
import CartDrawer from "@/components/cart/CartDrawer";
import { getStoreSettings } from "@/lib/get-store-settings";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: settings?.seo_title || "The Vybe Store | Handcrafted by Neha Kumari",
    description: settings?.seo_description || "Discover unique, handmade creations crafted with passion.",
    keywords: settings?.seo_keywords?.split(',').map(k => k.trim()) || ["handmade", "crafts"],
    openGraph: {
      title: settings?.seo_title || "The Vybe Store",
      description: settings?.seo_description || "Discover unique, handmade creations.",
      type: "website",
      locale: "en_US",
      siteName: settings?.store_name || "The Vybe Store",
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.seo_title || "The Vybe Store",
      description: settings?.seo_description || "Discover unique, handmade creations.",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <StoreProvider settings={settings}>
            <CartProvider>
              <WishlistProvider>
                {children}
                <CartDrawer />
              </WishlistProvider>
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
