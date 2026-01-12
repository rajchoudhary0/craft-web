import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function About() {
  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Image Side */}
          <div className="w-full md:w-1/2 relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/handmade_crafts_workshop.png" 
                alt="Artisan working on handmade crafts"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-terracotta rounded-full -z-10 opacity-20 blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-sage rounded-full -z-10 opacity-20 blur-2xl"></div>
          </div>

          {/* Text Side */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-charcoal mb-6">
              Crafting Stories, <span className="text-terracotta italic">One at a Time</span>
            </h2>
            <p className="text-text-muted text-lg mb-6 leading-relaxed">
              At Handmade, we believe that every object carries a soul. Our journey began with a simple passion: to preserve the fading art of traditional craftsmanship in a modern world.
            </p>
            <p className="text-text-muted text-lg mb-8 leading-relaxed">
              We collaborate with skilled artisans from around the globe, ensuring that every piece you bring into your home is not just a product, but a testament to human creativity, patience, and skill. Sustainable materials, ethical practices, and timeless design are at the heart of everything we do.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button variant="primary" size="lg">
                Our Story
              </Button>
              <Button variant="outline" size="lg">
                Meet the Artisans
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-stone-200 pt-8">
              <div>
                <p className="text-3xl font-bold text-charcoal">500+</p>
                <p className="text-sm text-text-muted mt-1">Artisans</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal">12k+</p>
                <p className="text-sm text-text-muted mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal">100%</p>
                <p className="text-sm text-text-muted mt-1">Sustainable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
