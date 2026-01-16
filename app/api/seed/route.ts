import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { products, categories } from '@/lib/data';

export async function POST() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // First, insert categories if they don't exist
    const uniqueCategories = [...new Set(products.map(p => p.category))];

    const categoryMap: Record<string, string> = {};

    for (const catName of uniqueCategories) {
      if (!catName) continue;
      // Check if category exists
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', catName)
        .single();

      if (existing) {
        categoryMap[catName] = existing.id;
      } else {
        // Insert new category
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert({
            name: catName,
            slug: catName.toLowerCase().replace(/\s+/g, '-'),
            description: `${catName} collection`
          })
          .select('id')
          .single();

        if (newCat) {
          categoryMap[catName] = newCat.id;
        }
      }
    }

    // Insert products
    for (const p of products) {
      const categoryId = p.category ? categoryMap[p.category] : null;

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: p.name,
          slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: p.description,
          price: p.price,
          original_price: p.originalPrice || null,
          stock: p.quantity || 10,
          category_id: categoryId,
          is_featured: p.tags?.includes('best-seller') || false,
          is_new: p.tags?.includes('new') || false,
          is_active: true,
          rating: 0,
          reviews_count: 0,
        })
        .select('id')
        .single();

      if (productError) {
        // Error inserting product (skipped)
        continue;
      }

      if (product && (p.images?.length ?? 0) > 0) {
        // Insert product images
        const imagesToInsert = p.images!.map((url, idx) => ({
          product_id: product.id,
          image_url: url,
          alt_text: `${p.name} image ${idx + 1}`,
          display_order: idx,
          is_primary: idx === 0,
        }));

        await supabase.from('product_images').insert(imagesToInsert);
      }

      // Insert tags if available
      if (product && (p.tags?.length ?? 0) > 0) {
        for (const tagName of p.tags!) {
          // Get or create tag
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

            if (newTag) {
              tagId = newTag.id;
            }
          }

          if (tagId) {
            await supabase.from('product_tags').insert({
              product_id: product.id,
              tag_id: tagId,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (err: any) {
    // Seed error
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
