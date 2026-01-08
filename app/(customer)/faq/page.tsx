import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | The Vybe Store',
  description: 'Answers to common questions about our products and services.',
};

export default function FAQPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-xl text-text-dark mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-8">
          <div className="border-b border-clay/20 pb-6">
            <h2 className="font-serif text-lg font-semibold text-text-dark mb-2">Are your products really handmade?</h2>
            <p className="text-text-muted">
              Yes! Every single item in The Vybe Store is crafted by hand by skilled artisans. We take pride in traditional techniques and authentic craftsmanship.
            </p>
          </div>

          <div className="border-b border-clay/20 pb-6">
            <h2 className="font-serif text-lg font-semibold text-text-dark mb-2">Do you offer custom orders?</h2>
            <p className="text-text-muted">
              We often accommodate custom requests for size or color variations on select items like our woven baskets and textiles. Please contact us directly to discuss your vision.
            </p>
          </div>

          <div className="border-b border-clay/20 pb-6">
            <h2 className="font-serif text-lg font-semibold text-text-dark mb-2">How do I care for my ceramic/wood items?</h2>
            <p className="text-text-muted">
              Each product page includes specific care instructions. Generally, we recommend hand washing ceramics and keeping wooden items away from direct heat and moisture. Detailed care cards are included with every package.
            </p>
          </div>

          <div className="border-b border-clay/20 pb-6">
            <h2 className="font-serif text-lg font-semibold text-text-dark mb-2">Where do you source your materials?</h2>
            <p className="text-text-muted">
              We prioritize sustainable and locally sourced materials whenever possible. Our clay is sourced from local deposits, and our wood comes from responsibly managed forests.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-text-muted">
              Still have questions? Reach out to us at <a href="mailto:hello@thevybestore.com" className="text-terracotta hover:underline">hello@thevybestore.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
