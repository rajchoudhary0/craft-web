import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | The Vybe Store',
  description: 'How we protect and use your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-xl text-text-dark mb-8">Privacy Policy</h1>
        
        <div className="prose prose-stone max-w-none space-y-6 text-text-muted text-sm">
          <p>Last Updated: January 2026</p>

          <section>
            <h2 className="font-serif text-xl text-text-dark mb-3">1. Information We Collect</h2>
            <p>
              When you make a purchase or sign up for our newsletter, we collect personal information such as your name, email address, shipping address, and payment details. We use this information solely to fulfill your orders and keep you updated on our latest creations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-text-dark mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and ship your orders.</li>
              <li>Communicate with you regarding your purchase.</li>
              <li>Send you promotional emails (only if you have opted in).</li>
              <li>Improve our website and customer service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-text-dark mb-3">3. Info Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and trusted affiliates.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-text-dark mb-3">4. Security</h2>
            <p>
              We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
