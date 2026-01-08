'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Upload, X, Plus, Star, Eye, Check, Trash2
} from 'lucide-react';
import { getProductById, categories } from '@/lib/data';

const tagOptions = [
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'new', label: 'New' },
  { value: 'limited-edition', label: 'Limited Edition' },
  { value: 'featured', label: 'Featured' },
];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  const existingProduct = !isNew ? getProductById(resolvedParams.id) : null;

  const [formData, setFormData] = useState({
    name: existingProduct?.name || '',
    description: existingProduct?.description || '',
    story: existingProduct?.story || '',
    category: existingProduct?.category || 'Home Decor',
    price: existingProduct?.price || 0,
    originalPrice: existingProduct?.originalPrice || 0,
    quantity: existingProduct?.quantity || 0,
    tags: (existingProduct?.tags || []) as string[],
    materials: existingProduct?.materials?.join(', ') || '',
    dimensions: existingProduct?.dimensions || '',
    careInstructions: existingProduct?.careInstructions?.join('\n') || '',
  });

  const [images, setImages] = useState<string[]>(existingProduct?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(indexToPrimary, 1);
    newImages.unshift(movedImage);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/admin/products');
    }, 1500);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  if (!isNew && !existingProduct) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-text-dark/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-cream rounded-2xl p-8 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <motion.div
                className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Check className="w-8 h-8 text-cream" />
              </motion.div>
              <p className="font-serif font-semibold text-text-dark">Product Saved!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-sand transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark">
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h1>
          <p className="text-text-muted">
            {isNew ? 'Create a new handcrafted item' : 'Update product details'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-cream rounded-2xl p-6 border border-clay/10">
          <h3 className="font-serif font-semibold text-text-dark mb-6">Basic Information</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder="e.g., Woven Terracotta Basket"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                >
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Short Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors resize-none"
                placeholder="A brief description for product listings"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Product Story</label>
              <textarea
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors resize-none"
                placeholder="The story behind this handcrafted piece..."
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-cream rounded-2xl p-6 border border-clay/10">
          <h3 className="font-serif font-semibold text-text-dark mb-6">Pricing</h3>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Compare at Price ($)</label>
              <input
                type="number"
                value={formData.originalPrice || ''}
                onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder="Original price for sale items"
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-cream rounded-2xl p-6 border border-clay/10">
          <h2 className="text-lg font-serif font-semibold text-text-dark mb-4">Product Images</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <input 
                type="url" 
                placeholder="Enter image URL..." 
                className="flex-1 px-4 py-2.5 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
              />
              <button 
                type="button"
                onClick={handleAddImage}
                disabled={!newImageUrl}
                className="px-4 py-2.5 bg-terracotta text-cream rounded-xl hover:bg-terracotta-dark disabled:opacity-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={url} className="group relative aspect-square rounded-xl overflow-hidden bg-sand border border-clay/20">
                  <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="px-3 py-1 bg-white/20 text-white text-xs rounded-full hover:bg-white/40 transition-colors"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-terracotta text-white text-xs font-medium rounded-full">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              {images.length === 0 && (
                 <div className="col-span-full py-8 text-center text-text-muted text-sm border-2 border-dashed border-clay/20 rounded-xl bg-sand/30">
                   No images added yet. Add a URL above.
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-cream rounded-2xl p-6 border border-clay/10">
          <h3 className="font-serif font-semibold text-text-dark mb-6">Tags</h3>
          
          <div className="flex flex-wrap gap-3">
            {tagOptions.map((tag) => (
              <motion.button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  formData.tags.includes(tag.value)
                    ? 'bg-terracotta text-cream'
                    : 'bg-sand border border-clay/20 text-text-muted hover:border-terracotta'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {formData.tags.includes(tag.value) && <Check className="w-4 h-4 inline mr-1" />}
                {tag.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="bg-cream rounded-2xl p-6 border border-clay/10">
          <h3 className="font-serif font-semibold text-text-dark mb-6">Product Details</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Materials</label>
              <input
                type="text"
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder="e.g., Organic cotton, Natural dyes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                placeholder='e.g., 12" x 8" x 6"'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Care Instructions</label>
              <textarea
                value={formData.careInstructions}
                onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors resize-none"
                placeholder="Enter each instruction on a new line"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-clay/20 rounded-xl text-text-muted hover:bg-sand transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
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
                Save Product
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
