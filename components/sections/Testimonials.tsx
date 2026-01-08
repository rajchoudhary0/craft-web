'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials, Testimonial } from '@/lib/data';
import { staggerContainer, fadeInUp } from '@/lib/animations';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Star
            className={`w-4 h-4 ${
              i < rating ? 'fill-gold text-gold' : 'fill-transparent text-clay'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) {
  return (
    <motion.div
      className={`relative bg-cream rounded-2xl p-8 shadow-md transition-all duration-500 ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
      }`}
      layout
    >
      {/* Quote icon */}
      <Quote className="absolute top-6 right-6 w-10 h-10 text-terracotta/20" />

      {/* Customer info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-sand">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-serif font-semibold text-text-dark">{testimonial.name}</h4>
          <p className="text-sm text-text-muted">{testimonial.location}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Review */}
      <p className="text-text-muted italic leading-relaxed mb-4">
        "{testimonial.review}"
      </p>

      {/* Product purchased */}
      <div className="pt-4 border-t border-clay/20">
        <span className="text-xs uppercase tracking-wider text-text-light">Purchased:</span>
        <span className="text-sm text-terracotta font-medium ml-2">{testimonial.productPurchased}</span>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Get visible testimonials (3 for desktop, 1 for mobile)
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + testimonials.length) % testimonials.length;
      result.push({ testimonial: testimonials[index], position: i });
    }
    return result;
  };

  return (
    <section 
      className="section-padding bg-background-alt paper-texture overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold-dark text-sm font-medium mb-4"
            variants={fadeInUp}
          >
            Testimonials
          </motion.span>
          <motion.h2
            className="heading-lg text-text-dark mb-4"
            variants={fadeInUp}
          >
            Loved by <span className="text-gradient">Thousands</span>
          </motion.h2>
          <motion.p
            className="text-text-muted max-w-xl mx-auto"
            variants={fadeInUp}
          >
            Real stories from our community of craft lovers who've welcomed our handmade pieces into their homes.
          </motion.p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation buttons */}
          <motion.button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-12 h-12 rounded-full bg-cream shadow-lg flex items-center justify-center text-text-dark hover:bg-terracotta hover:text-cream transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-12 h-12 rounded-full bg-cream shadow-lg flex items-center justify-center text-text-dark hover:bg-terracotta hover:text-cream transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* Cards container */}
          <div className="relative h-[400px] md:h-[350px]">
            <AnimatePresence mode="popLayout">
              {getVisibleTestimonials().map(({ testimonial, position }) => (
                <motion.div
                  key={testimonial.id}
                  className="absolute left-1/2 top-1/2 w-full max-w-md px-4"
                  initial={{ 
                    x: position === 0 ? '-50%' : position < 0 ? '-150%' : '50%',
                    y: '-50%',
                    scale: position === 0 ? 1 : 0.85,
                    opacity: position === 0 ? 1 : 0.5,
                    zIndex: position === 0 ? 10 : 5,
                  }}
                  animate={{ 
                    x: position === 0 ? '-50%' : position < 0 ? '-120%' : '20%',
                    y: '-50%',
                    scale: position === 0 ? 1 : 0.85,
                    opacity: position === 0 ? 1 : 0.4,
                    zIndex: position === 0 ? 10 : 5,
                  }}
                  exit={{
                    x: position === 0 ? '-50%' : position < 0 ? '-150%' : '50%',
                    scale: 0.8,
                    opacity: 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <TestimonialCard 
                    testimonial={testimonial} 
                    isActive={position === 0} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-terracotta' : 'w-2 bg-clay/30'
                }`}
                whileHover={{ scale: 1.2 }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-clay/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {[
            { value: '10,000+', label: 'Happy Customers' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '98%', label: 'Would Recommend' },
          ].map((stat, index) => (
            <div key={index} className="text-center px-8">
              <span className="block text-3xl font-serif font-bold text-terracotta">{stat.value}</span>
              <span className="text-sm text-text-muted">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
