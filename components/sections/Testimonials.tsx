'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    content: "The quality of the pottery I received is absolutely stunning. You can feel the care and attention to detail in every curve. It's not just a bowl; it's a piece of art.",
    author: "Sarah Jenkins",
    role: "Interior Designer",
    rating: 5,
    location: "New York, USA"
  },
  {
    id: 2,
    content: "I love knowing that my purchase directly supports artisan communities. The storytelling behind each product makes it so much more special than mass-produced items.",
    author: "Michael Chen",
    role: "Collector",
    rating: 5,
    location: "San Francisco, USA"
  },
  {
    id: 3,
    content: "Handmade has completely transformed how I shop for my home. The curation is impeccable, and the unboxing experience was delightful.",
    author: "Emma Thompson",
    role: "Lifestyle Blogger",
    rating: 5,
    location: "London, UK"
  },
  {
    id: 4,
    content: "Each piece tells a story. The ceramics I ordered have become conversation starters in my home. True craftsmanship at its finest.",
    author: "David Park",
    role: "Architect",
    rating: 5,
    location: "Seoul, Korea"
  },
  {
    id: 5,
    content: "The attention to packaging and the handwritten note made me feel so special. This is how shopping should feel - personal and meaningful.",
    author: "Priya Sharma",
    role: "Art Curator",
    rating: 5,
    location: "Mumbai, India"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = testimonials.length - 1;
      if (nextIndex >= testimonials.length) nextIndex = 0;
      return nextIndex;
    });
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, paginate]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section 
      className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-cream via-white to-sage/10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 50, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-terracotta/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tl from-sage/15 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="container-custom relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-terracotta font-medium uppercase tracking-widest text-xs mb-4">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-text-dark dark:text-white mb-3">
            Voices of <span className="italic text-terracotta">Joy</span>
          </h2>
          <p className="text-text-muted text-base max-w-lg mx-auto">
            Discover why our community loves handcrafted treasures
          </p>
        </motion.div>

        {/* Main Testimonial Slider */}
        <div className="relative flex items-center justify-center gap-4">
          {/* Left Arrow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(-1)}
            className="hidden md:flex w-11 h-11 shrink-0 rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/10 dark:shadow-black/30 items-center justify-center text-text-dark dark:text-white hover:bg-terracotta hover:text-white transition-colors duration-300 border border-gray-200 dark:border-gray-700"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Testimonial Card */}
          <div className="relative min-h-[280px] md:min-h-[300px] flex items-center justify-center flex-1 max-w-2xl">
            {/* Small Quote Icon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-0">
              <Quote className="w-12 h-12 text-terracotta/10 dark:text-terracotta/20 fill-current" />
            </div>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 }
                }}
                className="absolute w-full mx-auto"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50">
                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote Content */}
                  <blockquote className="text-lg md:text-xl font-serif text-text-dark dark:text-white text-center leading-relaxed mb-6">
                    &ldquo;{currentTestimonial.content}&rdquo;
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex flex-col items-center">
                    {/* Avatar with Gradient Border */}
                    <div className="relative mb-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-terracotta to-sage rounded-full blur-sm opacity-60" />
                      <div className="relative w-12 h-12 bg-gradient-to-br from-terracotta to-terracotta/80 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {currentTestimonial.author.charAt(0)}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-base text-text-dark dark:text-white">
                      {currentTestimonial.author}
                    </h4>
                    <p className="text-terracotta font-medium text-xs">
                      {currentTestimonial.role}
                    </p>
                    <p className="text-text-muted text-xs">
                      {currentTestimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(1)}
            className="hidden md:flex w-11 h-11 shrink-0 rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/10 dark:shadow-black/30 items-center justify-center text-text-dark dark:text-white hover:bg-terracotta hover:text-white transition-colors duration-300 border border-gray-200 dark:border-gray-700"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
            </motion.button>

        </div>

        {/* Mobile Navigation + Dots */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {/* Mobile Left Arrow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(-1)}
            className="md:hidden w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-text-dark dark:text-white border border-gray-200 dark:border-gray-700"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className="group relative p-1"
                  aria-label={`Go to testimonial ${index + 1}`}
                >
                  <motion.div
                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                      index === currentIndex 
                        ? 'bg-terracotta' 
                        : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-terracotta/50'
                    }`}
                    animate={{
                      scale: index === currentIndex ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  {/* Progress indicator for current slide */}
                  {index === currentIndex && isAutoPlaying && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-terracotta"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.8, opacity: [0, 1, 0] }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>

          {/* Mobile Right Arrow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(1)}
            className="md:hidden w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-text-dark dark:text-white border border-gray-200 dark:border-gray-700"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "4.9", label: "Average Rating" },
            { number: "50+", label: "Artisan Partners" },
            { number: "25+", label: "Countries Shipped" },
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="text-2xl md:text-3xl font-bold text-terracotta group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-sm text-text-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
