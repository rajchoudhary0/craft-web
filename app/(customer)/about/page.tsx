'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Leaf, Sparkles, Users } from 'lucide-react';
import { staggerContainer, fadeInUp, scrollRevealLeft, scrollRevealRight } from '@/lib/animations';
import Button from '@/components/ui/Button';

const values = [
  {
    icon: Heart,
    title: 'Crafted with Love',
    description: 'Every piece is made by hand with passion and attention to detail that machines simply cannot replicate.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description: 'We source eco-friendly, natural materials and minimize waste in our production process.',
  },
  {
    icon: Sparkles,
    title: 'Unique Creations',
    description: 'No two pieces are exactly alike. Each item carries subtle variations that make it truly yours.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'We support local makers and believe in fair wages and ethical production practices.',
  },
];

const process = [
  {
    step: '01',
    title: 'Source',
    description: 'We carefully select natural, sustainable materials from trusted local suppliers.',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
  },
  {
    step: '02',
    title: 'Design',
    description: 'Each piece is sketched and planned, drawing inspiration from nature and traditional techniques.',
    image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600',
  },
  {
    step: '03',
    title: 'Craft',
    description: 'Our skilled hands bring designs to life using time-honored crafting methods.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
  },
  {
    step: '04',
    title: 'Deliver',
    description: 'Beautifully packaged and shipped with care directly to your doorstep.',
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=600',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-background-alt paper-texture" />
        <div className="container-custom relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-sage/20 text-sage-dark text-sm font-medium mb-6"
              variants={fadeInUp}
            >
              Our Story
            </motion.span>
            <motion.h1
              className="heading-xl text-text-dark mb-6"
              variants={fadeInUp}
            >
              Where Passion Meets <span className="text-gradient">Craft</span>
            </motion.h1>
            <motion.p
              className="body-lg text-text-muted"
              variants={fadeInUp}
            >
              We're a small team of makers at The Vybe Store, dedicated to creating beautiful, 
              handcrafted goods that bring warmth and authenticity to your home.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scrollRevealLeft}
              className="relative"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
                  alt="The maker in studio"
                  fill
                  className="object-cover"
                />
              </div>
              <motion.div
                className="absolute -bottom-6 -right-6 bg-cream shadow-xl rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-4xl font-serif font-bold text-terracotta">6+</p>
                <p className="text-sm text-text-muted">Years of Crafting</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scrollRevealRight}
            >
              <h2 className="heading-lg text-text-dark mb-6">
                Meet Neha Kumari, the Heart Behind The Vybe Store
              </h2>
              <div className="space-y-4 text-text-muted">
                <p>
                  It all started in a tiny apartment, with a dream and a pair of hands eager 
                  to create. I've always believed that the most meaningful objects are those 
                  touched by human hands, carrying stories that machines could never tell.
                </p>
                <p>
                  After years of working in the corporate world, I took a leap of faith and 
                  dedicated myself to what I love most: creating beautiful, handcrafted pieces 
                  that bring joy to people's lives.
                </p>
                <p>
                  Today, from our cozy mountain studio, we continue to craft each piece with 
                  the same love and attention as day one. Every basket woven, every candle poured, 
                  every textile stitched carries a piece of our heart.
                </p>
              </div>
              
              {/* Signature */}
              <svg
                viewBox="0 0 200 60"
                className="w-40 h-16 mt-6"
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
              <p className="text-sm text-text-muted italic">— Neha Kumari, Founder</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-background-alt paper-texture">
        <div className="container-custom">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="heading-lg text-text-dark mb-4"
              variants={fadeInUp}
            >
              What We Stand For
            </motion.h2>
            <motion.p
              className="text-text-muted max-w-xl mx-auto"
              variants={fadeInUp}
            >
              Our values guide everything we do, from sourcing materials to packaging your order.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                variants={fadeInUp}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <value.icon className="w-7 h-7 text-terracotta" />
                </motion.div>
                <h3 className="font-serif font-semibold text-text-dark mb-2">{value.title}</h3>
                <p className="text-sm text-text-muted">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold-dark text-sm font-medium mb-4"
              variants={fadeInUp}
            >
              Our Process
            </motion.span>
            <motion.h2
              className="heading-lg text-text-dark mb-4"
              variants={fadeInUp}
            >
              From Hands to Home
            </motion.h2>
            <motion.p
              className="text-text-muted max-w-xl mx-auto"
              variants={fadeInUp}
            >
              Every piece goes through a thoughtful process that ensures quality and authenticity.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-text-dark/60 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-4xl font-serif font-bold text-cream/50">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif font-semibold text-text-dark mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-terracotta">
        <div className="container-custom">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg text-cream mb-6">
              Ready to Bring Handmade Joy Home?
            </h2>
            <p className="text-cream/80 mb-8">
              Explore our collection and find the perfect piece for your space.
            </p>
            <Link href="/products">
              <Button 
                variant="secondary" 
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Shop Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
