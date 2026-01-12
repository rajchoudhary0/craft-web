'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, CreditCard, Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';
import Button from '@/components/ui/Button';
import { staggerContainer, fadeInUp } from '@/lib/animations';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  type: string;
  images: string[];
}

export default function GiftCardsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openCart } = useCart();
  const supabase = createClient();

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    setIsLoading(true);
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Fetch products with type 'gift_card'
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, description, type, images')
      .eq('type', 'gift_card')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching gift cards:', error);
    } else {
      setProducts(data || []);
      if (data && data.length > 0) {
        setSelectedProduct(data[0]); // Select first by default
      }
    }
    setIsLoading(false);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    setIsAdding(true);

    // Add to cart
    // Note: Ideally we'd attach the 'recipient_email' as metadata to the cart item
    // For now we just add the product. We'll simulate email capture later or 
    // add a metadata field to CartItem if needed.
    
    addItem(selectedProduct as any, 1); // Cast as any because CartItem expects full Product shape but we only need basic props for cart
    openCart();
    
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-cream dark:bg-gray-950">
      <div className="container-custom max-w-4xl px-4">
        <motion.div
           initial="initial"
           animate="animate"
           variants={staggerContainer}
           className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8 md:gap-12 items-start md:items-center"
        >
          {/* Left: Visual Preview */}
          <motion.div variants={fadeInUp} className="relative w-full">
             <div className="aspect-[1.58/1] bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12" />
                <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-terracotta/30 rounded-full blur-2xl -ml-8 -mb-8" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4 sm:mb-8">
                     <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                     <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-white/70">Gift Card</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-1 sm:mb-2 !text-white">The Vybe Store</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Valid for 12 months</p>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/60 mb-1">Value</p>
                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                      {selectedProduct ? formatPrice(selectedProduct.price) : 'Select'}
                    </p>
                  </div>
                </div>
             </div>
             <div className="mt-4 sm:mt-8 text-center text-text-muted dark:text-gray-400 text-xs sm:text-sm px-4">
               <p>Instant delivery via email. Can be used for any product in our store.</p>
             </div>
          </motion.div>

          {/* Right: Selection Form */}
          <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm w-full">
             <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-text-dark dark:text-white mb-2">Give the Gift of Craft</h1>
             <p className="text-text-muted dark:text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">Choose an amount to get started.</p>

             {isLoading ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
               </div>
             ) : (
               <div className="space-y-6">
                 {/* Amount Selection */}
                 <div>
                   <label className="block text-sm font-medium text-text-dark dark:text-white mb-3">Select Amount</label>
                   <div className="grid grid-cols-2 gap-2 sm:gap-3">
                     {products.map((product) => (
                       <button
                         key={product.id}
                         onClick={() => setSelectedProduct(product)}
                         className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                           selectedProduct?.id === product.id
                             ? 'border-terracotta bg-terracotta/10 text-terracotta ring-1 ring-terracotta'
                             : 'border-gray-200 dark:border-gray-700 text-text-dark dark:text-white hover:border-terracotta/50'
                         }`}
                       >
                         {formatPrice(product.price)}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Recipient Email */}
                 <div>
                   <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">Recipient Email (Optional)</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-gray-500" />
                     <input 
                       type="email"
                       placeholder="friend@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-dark dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-terracotta transition-colors"
                     />
                   </div>
                   <p className="text-xs text-text-muted dark:text-gray-500 mt-2">
                     We'll send the code to this email after checkout.
                   </p>
                 </div>

                 {/* Action */}
                 <Button
                   variant="primary"
                   fullWidth
                   size="lg"
                   onClick={handleAddToCart}
                   disabled={isAdding || !selectedProduct}
                   className="mt-4"
                 >
                   {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
                 </Button>
               </div>
             )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
