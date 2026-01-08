'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { staggerContainer, fadeInUp, letterStagger, letterFadeIn } from '@/lib/animations';

const heroTitle = "Handmade with Love,";
const heroSubtitle = "Crafted with Soul";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  // Mouse parallax for decorative elements
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 150 };
  const floatX = useSpring(mouseX, springConfig);
  const floatY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / 50);
      mouseY.set((clientY - innerHeight / 2) / 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with parallax zoom */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y, scale }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/50 to-cream" />
      </motion.div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-1/4 left-[10%] w-32 h-32 pointer-events-none z-10"
        style={{ x: floatX, y: floatY }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full text-sage/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <path
            d="M50 0C55 25 75 45 100 50C75 55 55 75 50 100C45 75 25 55 0 50C25 45 45 25 50 0Z"
            fill="currentColor"
          />
        </motion.svg>
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-[15%] w-24 h-24 pointer-events-none z-10"
        style={{ x: useTransform(floatX, v => -v * 1.5), y: useTransform(floatY, v => -v * 1.5) }}
      >
        <motion.div
          className="w-full h-full rounded-full bg-terracotta/10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-[20%] w-16 h-16 pointer-events-none z-10"
        style={{ x: useTransform(floatX, v => v * 2), y: useTransform(floatY, v => v * 2) }}
      >
        <motion.svg
          viewBox="0 0 50 50"
          className="w-full h-full text-gold/40"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="25" cy="25" r="10" fill="currentColor" />
        </motion.svg>
      </motion.div>

      {/* Leaf decoration */}
      <motion.div
        className="absolute bottom-1/3 right-[10%] pointer-events-none z-10"
        style={{ x: useTransform(floatX, v => -v), y: useTransform(floatY, v => -v) }}
      >
        <motion.svg
          width="80"
          height="120"
          viewBox="0 0 80 120"
          className="text-sage/30"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M40 10C60 30 70 60 60 100C50 80 40 60 40 40C40 60 30 80 20 100C10 60 20 30 40 10Z"
            fill="currentColor"
          />
          <path
            d="M40 10L40 110"
            stroke="currentColor"
            strokeWidth="2"
          />
        </motion.svg>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="container-custom relative z-20 text-center"
        style={{ opacity }}
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          {/* Small tag */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/80 backdrop-blur-sm border border-clay/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span className="text-sm font-medium text-text-dark">The Vybe Store • Handcrafted</span>
          </motion.div>

          {/* Main heading with letter animation */}
          <motion.h1 className="heading-xl mb-4">
            <motion.span
              variants={letterStagger}
              initial="initial"
              animate="animate"
              className="block text-text-dark"
            >
              {heroTitle.split('').map((char, i) => (
                <motion.span
                  key={i}
                  variants={letterFadeIn}
                  className="inline-block"
                  style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.span>
            <motion.span
              variants={letterStagger}
              initial="initial"
              animate="animate"
              className="block text-gradient"
            >
              {heroSubtitle.split('').map((char, i) => (
                <motion.span
                  key={i}
                  variants={letterFadeIn}
                  className="inline-block"
                  style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="body-lg text-text-muted max-w-xl mx-auto mb-10"
          >
            Discover unique, handcrafted treasures made with passion. 
            Each piece carries a story of artistry and authentic craftsmanship.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/products">
              <Button size="lg" variant="primary">
                Shop Handmade
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Meet the Maker
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 cursor-hover"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-sm text-text-muted">Scroll to explore</span>
          <div className="w-8 h-12 rounded-full border-2 border-clay/50 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-3 bg-terracotta rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
