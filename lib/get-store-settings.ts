import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

// We use the admin client/service role or just public anon client depending on RLS.
// Since settings are public read, standard client works.
// However, in server components, we might want to bypass auth checks if needed, but RLS allows public select.

export type StoreSettings = {
  id: string;
  store_name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
};

export const getStoreSettings = unstable_cache(
  async (): Promise<StoreSettings | null> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching store settings:', error);
      return null;
    }

    return data;
  },
  ['store-settings'],
  {
    revalidate: 60, // Revalidate every minute, or on-demand if we added tags
    tags: ['store_settings'],
  }
);
