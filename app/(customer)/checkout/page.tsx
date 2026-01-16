'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, MapPin, Loader2, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/data';
import Button from '@/components/ui/Button';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, finalPrice, clearCart } = useCart();
  
  // Calculate discount amount for display
  const discountAmount = totalPrice - finalPrice;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Address State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New Address Form
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, router]);

  // Fetch saved addresses
  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;
      
      // Dynamic import to avoid server-side issues if needed, or just standard import
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (data && data.length > 0) {
        setSavedAddresses(data);
        // Auto-select default or first address
        const defaultAddr = data.find((a: any) => a.is_default) || data[0];
        setSelectedAddressId(defaultAddr.id);
      } else {
        setIsNewAddress(true); // No addresses, force new
      }
      setLoadingAddresses(false);
    }
    
    fetchAddresses();
  }, [user]);

  // Auto-fetch pincode details
  const handlePincodeChange = async (pincode: string) => {
    setAddress(prev => ({ ...prev, pincode }));
    
    if (pincode.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.[0]) {
          const { District, State } = data[0].PostOffice[0];
          setAddress(prev => ({ ...prev, city: District, state: State }));
        }
      } catch {
        // Silent fail for pincode lookup
      }
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setError('Please log in to continue');
      return;
    }

    let shippingAddress;

    if (isNewAddress) {
       // Validate new address
      if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
        setError('Please fill in all required address fields');
        return;
      }
      shippingAddress = address;
    } else {
      // Use selected saved address
      const selected = savedAddresses.find(a => a.id === selectedAddressId);
      if (!selected) {
        setError('Please select a shipping address');
        return;
      }
      // Map to expected format
      shippingAddress = {
        fullName: selected.full_name,
        phone: selected.phone || '',
        addressLine1: selected.address_line1,
        addressLine2: selected.address_line2 || '',
        city: selected.city,
        state: selected.state,
        pincode: selected.postal_code
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create Razorpay order
      const createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPrice,
          receipt: `checkout_${Date.now()}`,
          notes: { user_id: user.id },
        }),
      });

      const orderData = await createOrderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'The Vybe Store',
        description: 'Handcrafted with Love',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // 3. Verify payment
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_data: {
                  user_id: user.id,
                  items: items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                  })),
                  total_amount: finalPrice,
                  shipping_address: shippingAddress,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              setPaymentSuccess(true);
              setOrderId(verifyData.order_id);
              clearCart();
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (verifyErr: any) {
            setError(verifyErr.message || 'Payment verification failed');
          }
          setIsLoading(false);
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
          email: user.email,
        },
        theme: {
          color: '#C67B5C', // Terracotta
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <motion.div 
          className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className="w-20 h-20 bg-sage rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark mb-2">
            Payment Successful!
          </h1>
          <p className="text-text-muted mb-6">
            Thank you for your order. We'll start preparing your handcrafted items.
          </p>
          {orderId && (
            <p className="text-sm text-text-light mb-6">
              Order ID: <span className="font-mono">{orderId.slice(0, 8)}...</span>
            </p>
          )}
          <Link href="/account">
            <Button variant="primary" fullWidth>
              View My Orders
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0 && !paymentSuccess) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-semibold text-text-dark mb-4">
            Your cart is empty
          </h1>
          <Link href="/products">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-sand transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <h1 className="text-2xl font-serif font-semibold text-text-dark">Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Shipping Address */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-clay/10">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-terracotta" />
                <h2 className="font-serif font-semibold text-text-dark">Shipping Address</h2>
              </div>

              {/* Saved Addresses List */}
              {!loadingAddresses && savedAddresses.length > 0 && (
                <div className="space-y-4 mb-6">
                  {savedAddresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setIsNewAddress(false);
                      }}
                      className={`
                        cursor-pointer p-4 rounded-xl border transition-all relative
                        ${selectedAddressId === addr.id && !isNewAddress
                          ? 'border-terracotta bg-terracotta/5 shadow-sm' 
                          : 'border-clay/20 hover:border-terracotta/50'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-text-dark">{addr.full_name}</p>
                          <p className="text-sm text-text-muted">{addr.address_line1}</p>
                          {addr.address_line2 && <p className="text-sm text-text-muted">{addr.address_line2}</p>}
                          <p className="text-sm text-text-muted">
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                          <p className="text-sm text-text-muted mt-1">{addr.phone}</p>
                        </div>
                        <div className={`
                          w-5 h-5 rounded-full border flex items-center justify-center
                          ${selectedAddressId === addr.id && !isNewAddress
                            ? 'border-terracotta bg-terracotta' 
                            : 'border-clay/40'}
                        `}>
                          {selectedAddressId === addr.id && !isNewAddress && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Address Option */}
                  <div 
                    onClick={() => setIsNewAddress(true)}
                    className={`
                      cursor-pointer p-4 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2
                      ${isNewAddress 
                        ? 'border-terracotta bg-terracotta/5 text-terracotta font-medium' 
                        : 'border-clay/40 text-text-muted hover:border-terracotta hover:text-terracotta'}
                    `}
                  >
                    <span>+ Add New Address</span>
                  </div>
                </div>
              )}

              {/* New Address Form */}
              {(isNewAddress || savedAddresses.length === 0) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">
                    {savedAddresses.length > 0 ? 'New Address Details' : 'Enter Address Details'}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="form-input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (!value.startsWith('+91')) value = '+91';
                        value = '+91' + value.slice(3).replace(/\D/g, '').slice(0, 10);
                        setAddress({ ...address, phone: value });
                      }}
                      className="form-input"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      className="form-input"
                      placeholder="House/Flat No., Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={address.addressLine2}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                      className="form-input"
                      placeholder="Landmark (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">PIN Code *</label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="form-input"
                        placeholder="400001"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">City *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="form-input"
                        placeholder="Mumbai"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">State *</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="form-input"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-clay/10">
              <h2 className="font-serif font-semibold text-text-dark mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                      <Image
                        src={item.product.images?.[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-dark truncate">{item.product.name}</p>
                      <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-text-dark">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-clay/10 pt-4 space-y-2">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sage">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span className="text-sage">Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-text-dark pt-2 border-t border-clay/10">
                  <span>Total</span>
                  <span>{formatPrice(finalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              variant="primary"
              fullWidth
              leftIcon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
            >
              {isLoading ? 'Processing...' : `Pay ${formatPrice(finalPrice)}`}
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
