// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from "./types.ts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'sdms-mobile-shopfront',
    },
  },
});

// Add connection health check
let isConnected = false;
let connectionPromise: Promise<boolean> | null = null;

export const ensureConnection = async (): Promise<boolean> => {
  if (isConnected) return true;
  
  if (connectionPromise) return connectionPromise;
  
  connectionPromise = (async () => {
    try {
      // Test connection with a simple query
      const { error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
        console.warn('Supabase connection test failed:', error);
        return false;
      }
      
      isConnected = true;
      return true;
    } catch (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
  })();
  
  return connectionPromise;
};

supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('[Supabase Auth Change]', event);
    if (session) {
      console.log('User session:', session);
    } else {
      console.log('User signed out or no session');
    }
  }
});

// Export connection status
export { isConnected };
