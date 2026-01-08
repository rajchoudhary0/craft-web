import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Exchanges | The Vybe Store',
  description: 'Our policy on returns, exchanges, and damaged items.',
};

export default function ReturnsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-xl text-text-dark mb-8">Returns & Exchanges</h1>
        
        <div className="prose prose-stone max-w-none space-y-8 text-text-muted">
          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">Our Promise</h2>
            <p>
              We want you to love your handcrafted piece. If for any reason you are not completely satisfied, we accept returns within <strong>30 days</strong> of delivery.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">Conditions for Return</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Items must be unused and in their original condition/packaging.</li>
              <li>Customized or personalized orders are final sale and cannot be returned unless defective.</li>
              <li>Return shipping costs are the responsibility of the customer, unless the item arrived damaged or defective.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">Handcrafted Variations</h2>
            <p>
              Please remember that due to the handmade nature of our products, slight variations in color, texture, and size are expected and celebrated. These are not considered defects but rather the mark of authentic craftsmanship.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-text-dark mb-4">How to Initiate a Return</h2>
            <p>
              To start a return, please email us at <a href="mailto:hello@thevybestore.com" className="text-terracotta hover:underline">hello@thevybestore.com</a> with your order number and reason for return. We will provide you with instructions and a return shipping address.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
