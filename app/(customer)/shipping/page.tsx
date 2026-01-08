import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Information | The Vybe Store',
  description: 'Learn about our shipping policies and delivery times.',
};

export default function ShippingPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-xl text-text-dark mb-8">Shipping Information</h1>
        
        <div className="prose prose-stone max-w-none space-y-8 text-text-muted">
          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">Processing Time</h2>
            <p>
              Since many of our items are handcrafted to order, please allow <strong>3-5 business days</strong> for your order to be prepared for shipment. You will receive a confirmation email with tracking information once your package has been dispatched.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">Domestic Shipping</h2>
            <p>
              We offer standard shipping (5-7 business days) and express shipping (2-3 business days) options at checkout. Free standard shipping is available on all orders over $150.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">International Shipping</h2>
            <p>
              Yes, we ship worldwide! International shipping times vary by destination, typically ranging from 7-14 business days. Please note that customs duties and taxes may apply and are the responsibility of the customer.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">Packaging</h2>
            <p>
              Sustainability is at our heart. Your order will arrive in eco-friendly, recyclable packaging. We use minimal plastic and ensure your handcrafted treasures are protected with biodegradable materials.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
