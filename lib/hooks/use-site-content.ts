'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SiteContentData {
  [key: string]: any;
}

export function useSiteContent(key: string) {
  const [content, setContent] = useState<SiteContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchContent() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('site_content')
          .select('value')
          .eq('key', key)
          .single();

        if (queryError) throw queryError;

        setContent(data?.value || null);
      } catch (err: any) {
        console.error('Error fetching site content:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [supabase, key]);

  return { content, isLoading, error };
}

// Admin: Update site content
export function useUpdateSiteContent() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const updateContent = async (key: string, value: SiteContentData) => {
    if (!supabase) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('site_content')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (updateError) throw updateError;

      return true;
    } catch (err: any) {
      console.error('Error updating site content:', err);
      setError(err.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateContent, isUpdating, error };
}

// Newsletter subscription
export function useNewsletter() {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const subscribe = async (email: string) => {
    if (!supabase) return;

    setIsSubscribing(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (insertError) {
        if (insertError.code === '23505') {
          // Duplicate email
          setError('This email is already subscribed');
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error subscribing:', err);
      setError(err.message);
    } finally {
      setIsSubscribing(false);
    }
  };

  return { subscribe, isSubscribing, error, success };
}
