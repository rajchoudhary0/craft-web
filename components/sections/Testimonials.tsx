

const testimonials = [
  {
    id: 1,
    content: "The quality of the pottery I received is absolutely stunning. You can feel the care and attention to detail in every curve. It's not just a bowl; it's a piece of art.",
    author: "Sarah Jenkins",
    role: "Interior Designer",
    image: null 
  },
  {
    id: 2,
    content: "I love knowing that my purchase directly supports artisan communities. The storytelling behind each product makes it so much more special than mass-produced items.",
    author: "Michael Chen",
    role: "Collector",
    image: null
  },
  {
    id: 3,
    content: "Handmade has completely transformed how I shop for my home. The curation is impeccable, and the unboxing experience was delightful.",
    author: "Emma Thompson",
    role: "Lifestyle Blogger",
    image: null
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-sage opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-terracotta opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-4">
            Loved by <span className="text-terracotta">Community</span>
          </h2>
          <div className="w-24 h-1 bg-terracotta mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-cream rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-stone-100 flex flex-col"
            >
              <div className="text-terracotta mb-6 text-4xl font-serif">&quot;</div>
              <p className="text-text-muted text-lg italic mb-6 flex-grow">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center text-stone-400 font-bold text-xl">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-charcoal">{testimonial.author}</h4>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
