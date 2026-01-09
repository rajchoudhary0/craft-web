'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { staggerContainer, fadeInUp, scrollRevealLeft, scrollRevealRight } from '@/lib/animations';

const timeline = [
  { year: '2018', title: 'The Beginning', description: 'Started creating in a tiny apartment studio' },
  { year: '2020', title: 'First Workshop', description: 'Opened our mountain studio workshop' },
  { year: '2022', title: 'Growing Community', description: '10,000+ happy customers worldwide' },
  { year: '2024', title: 'The Vybe Store Today', description: 'A team of passionate makers' },
];

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <section ref={containerRef} className="section-padding bg-cream relative overflow-hidden">
      <div className="container-custom">
        {/* Main content - Split layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Image side */}
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={scrollRevealLeft}
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <motion.div
                className="absolute inset-0"
                style={{ y: imageY }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
                  alt="The maker crafting in studio"
                  fill
                  className="object-cover scale-110"
                />
              </motion.div>
              
              {/* Decorative frame */}
              <div className="absolute inset-4 border-2 border-cream/50 rounded-xl pointer-events-none" />
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute bottom-4 right-4 md:bottom-0 md:-right-6 lg:right-6 bg-cream shadow-lg rounded-2xl p-4 md:p-6 border border-clay/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <span className="block text-3xl md:text-4xl font-serif font-bold text-terracotta">6+</span>
                <span className="text-xs md:text-sm text-text-muted">Years of Crafting</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={scrollRevealRight}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-sage/20 text-sage-dark text-sm font-medium mb-6"
              variants={fadeInUp}
            >
              Our Story
            </motion.span>

            <motion.h2
              className="heading-lg text-text-dark mb-6"
              variants={fadeInUp}
            >
              Where Passion Meets <span className="text-gradient">Craftsmanship</span>
            </motion.h2>

            <motion.p
              className="body-lg text-text-muted mb-6"
              variants={fadeInUp}
            >
              Every piece in our collection is more than just an object — it's a story woven from 
              tradition, creativity, and countless hours of dedicated handwork.
            </motion.p>

            <motion.p
              className="body-md text-text-muted mb-8"
              variants={fadeInUp}
            >
              From our cozy mountain studio, we create pieces that bring warmth and authenticity 
              to your home. We believe in slow craftsmanship, sustainable materials, and the 
              magic that happens when human hands shape raw materials into art.
            </motion.p>

            {/* Handwritten signature */}
            <motion.div
              className="mb-8"
              variants={fadeInUp}
            >
              <svg
                viewBox="0 0 200 60"
                className="w-40 h-16"
              >
                <motion.path
                  d="M10 45C20 20 40 15 60 35C80 55 100 30 120 25C140 20 160 40 180 30C185 28 188 32 190 35"
                  stroke="var(--terracotta)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </svg>
              <p className="text-sm text-text-muted italic">— Neha Kumari, Founder & Maker</p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { value: '2000+', label: 'Pieces Created' },
                { value: '50+', label: 'Unique Designs' },
                { value: '100%', label: 'Handmade' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={fadeInUp}
                >
                  <span className="block text-2xl font-serif font-bold text-terracotta">{stat.value}</span>
                  <span className="text-sm text-text-muted">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Quote section */}
        <motion.div
          className="max-w-3xl mx-auto text-center py-16 border-y border-clay/20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <svg
            className="w-12 h-12 text-terracotta/30 mx-auto mb-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>
          <blockquote className="heading-md text-text-dark mb-6 font-serif italic">
            "I believe that the most meaningful objects are those touched by human hands, 
            carrying stories that machines could never tell."
          </blockquote>
          <cite className="text-text-muted not-italic">— Neha Kumari, Founder of The Vybe Store</cite>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="pt-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.h3
            className="heading-md text-text-dark text-center mb-12"
            variants={fadeInUp}
          >
            Our Journey
          </motion.h3>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-clay/30 -translate-x-1/2 hidden md:block" />

            <div className="space-y-8 md:space-y-0">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  className={`relative md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}
                  variants={fadeInUp}
                >
                  {/* Dot on timeline */}
                  <div className="absolute top-2 hidden md:block" style={{
                    left: index % 2 === 0 ? 'auto' : '-6px',
                    right: index % 2 === 0 ? '-6px' : 'auto',
                  }}>
                    <motion.div
                      className="w-3 h-3 rounded-full bg-terracotta"
                      whileHover={{ scale: 1.5 }}
                    />
                  </div>

                  <div className="bg-sand/50 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <span className="text-terracotta font-serif font-bold text-xl">{item.year}</span>
                    <h4 className="font-serif font-semibold text-text-dark mt-1">{item.title}</h4>
                    <p className="text-text-muted text-sm mt-1">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
