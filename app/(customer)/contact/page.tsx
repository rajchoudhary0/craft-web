'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { staggerContainer, fadeInUp, scrollRevealLeft, scrollRevealRight } from '@/lib/animations';
import ContactForm from '@/components/ContactForm';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Studio Address',
    details: ['123 Craft Lane', 'Mountain View, CA 94043'],
  },
  {
    icon: Phone,
    title: 'Phone',
    details: ['+1 (555) 123-4567'],
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['hello@thevybestore.com'],
  },
  {
    icon: Clock,
    title: 'Studio Hours',
    details: ['Mon-Fri: 9am - 5pm PST', 'Sat: 10am - 4pm PST'],
  },
];

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-background-alt paper-texture" />
        <div className="container-custom relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-medium mb-6"
              variants={fadeInUp}
            >
              Get in Touch
            </motion.span>
            <motion.h1
              className="heading-xl text-text-dark mb-6"
              variants={fadeInUp}
            >
              Let's <span className="text-gradient">Connect</span>
            </motion.h1>
            <motion.p
              className="body-lg text-text-muted"
              variants={fadeInUp}
            >
              Have a question about our handcrafted goods? Want to discuss a custom order? 
              We'd love to hear from you!
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scrollRevealLeft}
            >
              <h2 className="heading-md text-text-dark mb-6">Send a Message</h2>
              <p className="text-text-muted mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
              <ContactForm />
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scrollRevealRight}
            >
              <h2 className="heading-md text-text-dark mb-6">Contact Information</h2>
              <p className="text-text-muted mb-8">
                Prefer to reach out directly? Here's how you can find us.
              </p>

              <div className="space-y-6 mb-12">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-terracotta" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text-dark mb-1">{item.title}</h4>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-text-muted text-sm">{detail}</p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mb-12">
                <h4 className="font-medium text-text-dark mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-sand flex items-center justify-center text-text-muted hover:bg-terracotta hover:text-cream transition-all"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Studio Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800"
                  alt="Our studio"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-dark/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-cream">
                  <p className="font-serif font-semibold text-lg">Our Mountain Studio</p>
                  <p className="text-sm text-cream/80">Where the magic happens</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-background-alt paper-texture">
        <div className="container-custom">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-md text-text-dark mb-4">Common Questions</h2>
            <div className="space-y-4 text-left mt-8">
              {[
                {
                  q: 'Do you accept custom orders?',
                  a: 'Yes! We love creating custom pieces. Reach out with your ideas and we\'ll work together to bring your vision to life.',
                },
                {
                  q: 'What are your shipping times?',
                  a: 'Most orders ship within 3-5 business days. Custom orders may take 2-4 weeks depending on complexity.',
                },
                {
                  q: 'Do you ship internationally?',
                  a: 'Currently we ship within the US. International shipping is coming soon!',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-cream rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-medium text-text-dark mb-2">{faq.q}</h4>
                  <p className="text-text-muted text-sm">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
