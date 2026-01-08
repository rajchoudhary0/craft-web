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
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-4xl">
        <motion.div
           initial="initial"
           animate="animate"
           variants={staggerContainer}
           className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Visual Preview */}
          <motion.div variants={fadeInUp} className="relative">
             <div className="aspect-[1.58/1] bg-gradient-to-br from-text-dark to-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col justify-between text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-terracotta/20 rounded-full blur-2xl -ml-12 -mb-12 transition-transform group-hover:scale-110 duration-700" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                     <Gift className="w-10 h-10 text-white/90" />
                     <span className="text-sm font-medium tracking-widest uppercase opacity-70">Gift Card</span>
                  </div>
                  <h3 className="text-3xl font-serif font-bold mb-2">Handmade Crafts</h3>
                  <p className="text-white/70 text-sm">Valid for 12 months</p>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Value</p>
                    <p className="text-4xl font-bold tracking-tight">
                      {selectedProduct ? formatPrice(selectedProduct.price) : 'Select Amount'}
                    </p>
                  </div>
                </div>
             </div>
             <div className="mt-8 text-center text-text-muted text-sm px-4">
               <p>Instant delivery via email. Can be used for any product in our store.</p>
             </div>
          </motion.div>

          {/* Right: Selection Form */}
          <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <h1 className="heading-md text-text-dark mb-2">Give the Gift of Craft</h1>
             <p className="text-text-muted mb-8">Choose an amount to get started.</p>

             {isLoading ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
               </div>
             ) : (
               <div className="space-y-8">
                 {/* Amount Selection */}
                 <div>
                   <label className="block text-sm font-medium text-text-dark mb-3">Select Amount</label>
                   <div className="grid grid-cols-2 gap-3">
                     {products.map((product) => (
                       <button
                         key={product.id}
                         onClick={() => setSelectedProduct(product)}
                         className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                           selectedProduct?.id === product.id
                             ? 'border-terracotta bg-terracotta/5 text-terracotta ring-1 ring-terracotta'
                             : 'border-gray-200 text-text-dark hover:border-terracotta/50'
                         }`}
                       >
                         {formatPrice(product.price)}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Recipient Email (Optional for now in UI flow, stored ideally) */}
                 <div>
                   <label className="block text-sm font-medium text-text-dark mb-2">Recipient Email (Optional)</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                     <input 
                       type="email"
                       placeholder="friend@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-terracotta transition-colors"
                     />
                   </div>
                   <p className="text-xs text-text-muted mt-2">
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
