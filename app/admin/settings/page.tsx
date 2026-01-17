'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Store, Mail, MapPin, Phone, Globe, Share2, Database, AlertCircle } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('store');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const supabase = createClient();

  const [settings, setSettings] = useState({
    id: '',
    store_name: '',
    tagline: '',
    email: '',
    phone: '',
    address: '',
    currency: 'USD',
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      // No toast on initial fetch to avoid noise, potentially table doesn't exist yet
    } else if (data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('store_settings')
          .update({
            store_name: settings.store_name,
            tagline: settings.tagline,
            email: settings.email,
            phone: settings.phone,
            address: settings.address,
            currency: settings.currency,
            instagram_url: settings.instagram_url,
            facebook_url: settings.facebook_url,
            twitter_url: settings.twitter_url,
            seo_title: settings.seo_title,
            seo_description: settings.seo_description,
            seo_keywords: settings.seo_keywords,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);
          
        if (error) throw error;
      } else {
        // Insert new (should rarely happen if access is restricted, but handles init)
        const { error } = await supabase
          .from('store_settings')
          .insert([{
            ...settings,
            // remove id to let DB generate it
            id: undefined, 
          }]);
          
        if (error) throw error;
        // Refetch to get ID
        fetchSettings();
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'database', label: 'Database', icon: Database },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      <div className="flex gap-2 border-b border-clay/20 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
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
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
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
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
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
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
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
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-text-dark mb-2">Currency Code</label>
               <input
                 type="text"
                 value={settings.currency}
                 onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                 maxLength={3}
                 className="w-full md:w-1/3 px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors uppercase"
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
              <label className="block text-sm font-medium text-text-dark mb-2">Instagram URL</label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Facebook URL</label>
              <input
                type="url"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">X (Twitter) URL</label>
              <input
                type="url"
                value={settings.twitter_url}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                placeholder="https://twitter.com/..."
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
              <label className="block text-sm font-medium text-text-dark mb-2">Page Title Default</label>
              <input
                type="text"
                value={settings.seo_title}
                onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
              <p className="text-xs text-text-muted mt-1">{settings.seo_title.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Meta Description Default</label>
              <textarea
                value={settings.seo_description}
                onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors resize-none"
              />
              <p className="text-xs text-text-muted mt-1">{settings.seo_description.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Keywords Default</label>
              <input
                type="text"
                value={settings.seo_keywords}
                onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder="Comma-separated keywords"
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'database' && (
          <motion.div
            key="database"
            className="bg-cream rounded-2xl p-6 border border-clay/10 space-y-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="font-serif font-semibold text-text-dark">Database Management</h3>
            <p className="text-text-muted text-sm">
              Tools to manage your database connection and data.
            </p>

            <div className="p-4 bg-sand/30 rounded-xl border border-clay/10">
              <h4 className="font-medium text-text-dark mb-2">Seed Initial Data</h4>
              <p className="text-sm text-text-muted mb-4">
                Populate your database with the initial set of products from the demo data. 
                This will add products if they don't exist.
              </p>
              <button
                onClick={async () => {
                   setIsSaving(true);
                   try {
                     const response = await fetch('/api/seed', { method: 'POST' });
                     if (!response.ok) throw new Error('Failed to seed');
                     setShowSuccess(true);
                     setTimeout(() => setShowSuccess(false), 2000);
                   } catch (error) {
                     showToast('Error seeding database', 'error');
                   } finally {
                     setIsSaving(false);
                   }
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-terracotta text-cream rounded-lg hover:bg-terracotta-dark disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Seeding...' : 'Seed Database'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button for Settings Tabs */}
      {activeTab !== 'database' && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-terracotta text-cream rounded-xl hover:bg-terracotta-dark disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
