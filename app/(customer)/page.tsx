import { createClient } from '@/lib/supabase/server';
import HomeContent from '@/components/home/HomeContent';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const supabase = await createClient();

  // Fetch Featured Products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, original_price, description, rating, reviews_count, stock,
      images:product_images(image_url),
      category:categories(name),
      tags:product_tags(tag:tags(name))
    `)
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(4);

  // Fetch New Arrivals (is_new = true OR order by created_at)
  const { data: newArrivals } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, original_price, description, rating, reviews_count, stock,
      images:product_images(image_url),
      category:categories(name),
      tags:product_tags(tag:tags(name))
    `)
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(4);

  // Fetch Featured Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(4);

  // Transform data structures for client component
  const transformProduct = (p: any) => ({
    ...p,
    tags: p.tags?.map((t: any) => t.tag) || []
  });

  return (
    <HomeContent 
      featuredProducts={(featuredProducts || []).map(transformProduct)} 
      newArrivals={(newArrivals || []).map(transformProduct)}
      categories={categories || []}
    />
  );
}
