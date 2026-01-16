import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern to avoid creating multiple instances
let supabaseInstance: ReturnType<typeof createBrowserClient> | undefined | null = null;

export function createClient() {
    // Return cached instance if exists
    if (supabaseInstance !== null) {
        return supabaseInstance;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        // Supabase URL or Key is missing - auth will be disabled
        supabaseInstance = undefined;
        return undefined;
    }

    supabaseInstance = createBrowserClient(url, key);
    return supabaseInstance;
}
