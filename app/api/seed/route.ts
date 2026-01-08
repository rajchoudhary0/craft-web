import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { products } from '@/lib/data';

export async function POST() {
  const supabase = await createClient();

  try {
    const productsToInsert = products.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      original_price: p.originalPrice || null,
      stock: p.quantity,
      images: p.images,
      category: p.category,
      tags: p.tags,
      // Since we don't have review data in mapped structure yet, defaulting
      reviews_count: 0,
      rating: 0
    }));

    const { error } = await supabase.from('products').insert(productsToInsert);

    if (error) {
      console.error('Seed error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
