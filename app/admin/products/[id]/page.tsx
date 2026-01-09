'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Upload, X, Plus, Star, Eye, Check, Trash2, Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import heic2any from 'heic2any';

const tagOptions = [
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'new', label: 'New' },
  { value: 'limited-edition', label: 'Limited Edition' },
  { value: 'featured', label: 'Featured' },
];

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const isNew = resolvedParams.id === 'new';
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    story: '',
    categoryId: '',
    price: 0,
    originalPrice: 0,
    quantity: 0,
    tags: [] as string[],
    materials: '',
    dimensions: '',
    careInstructions: '',
    isFeatured: false,
    isNew: false,
    isActive: true,
  });

  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchProduct();
    }
  }, [isNew]);

  const fetchCategories = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    if (!supabase) return;
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *, 
        category:categories(id, name),
        images:product_images(image_url, is_primary, display_order),
        tags:product_tags(tag:tags(id, name))
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        story: product.story || '',
        categoryId: product.category?.id || '',
        price: product.price || 0,
        originalPrice: product.original_price || 0,
        quantity: product.stock || 0,
        tags: product.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
        materials: Array.isArray(product.materials) ? product.materials.join(', ') : (product.materials || ''),
        dimensions: product.dimensions || '',
        careInstructions: Array.isArray(product.care_instructions) ? product.care_instructions.join('\n') : (product.care_instructions || ''),
        isFeatured: product.is_featured || false,
        isNew: product.is_new || false,
        isActive: product.is_active ?? true,
      });
      
      // Sort images by display_order and extract URLs
      const sortedImages = (product.images || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.image_url);
      setImages(sortedImages);
    }
    setIsLoading(false);
  };

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
    setError('');

    try {
      // Check if supabase is available
      if (!supabase) {
        throw new Error('Database not configured. Please check Supabase connection.');
      }

      const productData = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.description,
        story: formData.story || null,
        category_id: formData.categoryId || null,
        price: formData.price,
        original_price: formData.originalPrice || null,
        stock: formData.quantity,
        materials: formData.materials ? formData.materials.split(',').map(m => m.trim()) : null,
        dimensions: formData.dimensions || null,
        care_instructions: formData.careInstructions ? formData.careInstructions.split('\n').filter(Boolean) : null,
        is_featured: formData.isFeatured || formData.tags.includes('featured') || formData.tags.includes('best-seller'),
        is_new: formData.isNew || formData.tags.includes('new'),
        is_active: formData.isActive,
      };

      let productId = resolvedParams.id;

      if (isNew) {
        // Insert new product
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (insertError) {
          console.error('Insert error details:', insertError);
          throw new Error(insertError.message || insertError.details || 'Failed to create product. Check if database tables exist.');
        }
        if (!newProduct) {
          throw new Error('Product created but no ID returned');
        }
        productId = newProduct.id;
      } else {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (updateError) {
          console.error('Update error details:', updateError);
          throw new Error(updateError.message || updateError.details || 'Failed to update product');
        }

        // Delete existing images
        const { error: deleteImgError } = await supabase.from('product_images').delete().eq('product_id', productId);
        if (deleteImgError) console.warn('Delete images error:', deleteImgError);
        
        // Delete existing tags
        const { error: deleteTagError } = await supabase.from('product_tags').delete().eq('product_id', productId);
        if (deleteTagError) console.warn('Delete tags error:', deleteTagError);
      }

      // Insert images
      if (images.length > 0) {
        const imagesToInsert = images.map((url, idx) => ({
          product_id: productId,
          image_url: url,
          alt_text: `${formData.name} image ${idx + 1}`,
          display_order: idx,
          is_primary: idx === 0,
        }));
        const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert);
        if (imgError) console.warn('Insert images error:', imgError);
      }

      // Insert tags (skip if tables don't exist)
      for (const tagName of formData.tags) {
        try {
          let tagId: string | null = null;
          
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          if (existingTag) {
            tagId = existingTag.id;
          } else {
            const { data: newTag } = await supabase
              .from('tags')
              .insert({ name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') })
              .select('id')
              .single();
            
            if (newTag) tagId = newTag.id;
          }

          if (tagId) {
            await supabase.from('product_tags').insert({
              product_id: productId,
              tag_id: tagId,
            });
          }
        } catch (tagErr) {
          console.warn('Tag error (non-critical):', tagErr);
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving product:', err);
      const errorMessage = err?.message || err?.error?.message || JSON.stringify(err) || 'Failed to save product. Please run migration SQL first.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

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
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-sand/50 border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
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
              <label className="block text-sm font-medium text-text-dark mb-2">Price (₹)</label>
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
              <label className="block text-sm font-medium text-text-dark mb-2">Compare at Price (₹)</label>
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
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*,.heic,.heif"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setIsConverting(true);
                    try {
                      let processedFile: File | Blob = file;
                      
                      // Check if HEIC/HEIF format
                      const isHeic = file.type === 'image/heic' || 
                                     file.type === 'image/heif' || 
                                     file.name.toLowerCase().endsWith('.heic') ||
                                     file.name.toLowerCase().endsWith('.heif');
                      
                      if (isHeic) {
                        // Convert HEIC to JPEG
                        const convertedBlob = await heic2any({
                          blob: file,
                          toType: 'image/jpeg',
                          quality: 0.9,
                        });
                        processedFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                      }
                      
                      // Read as data URL
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImages([...images, reader.result as string]);
                        setIsConverting(false);
                      };
                      reader.onerror = () => {
                        setError('Failed to read image file');
                        setIsConverting(false);
                      };
                      reader.readAsDataURL(processedFile);
                    } catch (err) {
                      console.error('Image processing error:', err);
                      setError('Failed to process image. Try a different format.');
                      setIsConverting(false);
                    }
                    // Reset input
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isConverting}
                  className="h-full px-4 py-2.5 bg-sand text-text-dark border border-clay/20 rounded-xl hover:bg-sand/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                  title="Upload from device"
                >
                  {isConverting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline text-sm font-medium">
                    {isConverting ? 'Converting...' : 'Upload'}
                  </span>
                </button>
              </div>
              <div className="text-text-muted flex items-center">or</div>
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
                title="Add URL"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={url + index} className="group relative aspect-square rounded-xl overflow-hidden bg-sand border border-clay/20">
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

        {/* Options */}
        <div className="bg-cream rounded-2xl p-6 border border-clay/10">
          <h3 className="font-serif font-semibold text-text-dark mb-6">Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 accent-terracotta"
              />
              <span className="text-text-dark">Active (visible in store)</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-terracotta"
              />
              <span className="text-text-dark">Featured product</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4 accent-terracotta"
              />
              <span className="text-text-dark">Mark as new arrival</span>
            </label>
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
