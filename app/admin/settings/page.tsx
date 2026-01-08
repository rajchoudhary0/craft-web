'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Store, Mail, MapPin, Phone, Globe, Share2 } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [storeInfo, setStoreInfo] = useState({
    name: 'The Vybe Store',
    tagline: 'Handcrafted with Love by Neha Kumari',
    email: 'hello@thevybestore.com',
    phone: '+1 (555) 123-4567',
    address: '123 Craft Lane, Mountain View, CA 94043',
    currency: 'USD',
  });

  const [socialLinks, setSocialLinks] = useState({
    instagram: 'https://instagram.com/thevybestore',
    facebook: 'https://facebook.com/thevybestore',
    twitter: 'https://twitter.com/thevybestore',
  });

  const [seoSettings, setSeoSettings] = useState({
    title: 'The Vybe Store | Handcrafted with Love',
    description: 'Discover unique, handmade treasures crafted with passion by Neha Kumari. Premium handcrafted goods from our studio.',
    keywords: 'handmade, crafts, the vybe store, home decor, ceramics, textiles, neha kumari',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Globe },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-6 right-6 z-50 bg-sage text-cream px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Check className="w-5 h-5" />
            Settings saved!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-semibold text-text-dark">Settings</h1>
        <p className="text-text-muted">Manage your store settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-clay/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-text-muted hover:text-text-dark'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'store' && (
          <motion.div
            key="store"
            className="bg-cream rounded-2xl p-6 border border-clay/10 space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="font-serif font-semibold text-text-dark">Store Information</h3>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Store Name</label>
                <input
                  type="text"
                  value={storeInfo.name}
                  onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Tagline</label>
                <input
                  type="text"
                  value={storeInfo.tagline}
                  onChange={(e) => setStoreInfo({ ...storeInfo, tagline: e.target.value })}
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={storeInfo.email}
                  onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="text"
                  value={storeInfo.phone}
                  onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'social' && (
          <motion.div
            key="social"
            className="bg-cream rounded-2xl p-6 border border-clay/10 space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="font-serif font-semibold text-text-dark">Social Media Links</h3>
            
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Instagram</label>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Facebook</label>
              <input
                type="url"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Twitter</label>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'seo' && (
          <motion.div
            key="seo"
            className="bg-cream rounded-2xl p-6 border border-clay/10 space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="font-serif font-semibold text-text-dark">SEO Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Page Title</label>
              <input
                type="text"
                value={seoSettings.title}
                onChange={(e) => setSeoSettings({ ...seoSettings, title: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
              <p className="text-xs text-text-muted mt-1">{seoSettings.title.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Meta Description</label>
              <textarea
                value={seoSettings.description}
                onChange={(e) => setSeoSettings({ ...seoSettings, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors resize-none"
              />
              <p className="text-xs text-text-muted mt-1">{seoSettings.description.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Keywords</label>
              <input
                type="text"
                value={seoSettings.keywords}
                onChange={(e) => setSeoSettings({ ...seoSettings, keywords: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder="Comma-separated keywords"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-terracotta text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
          whileHover={{ scale: isSaving ? 1 : 1.02 }}
          whileTap={{ scale: isSaving ? 1 : 0.98 }}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
