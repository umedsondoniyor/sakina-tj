import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Ensure environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'sakina' }
  },
  db: {
    schema: 'public'
  },
  // Add retryAttempts for better network resilience
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Enhanced health check function with retries
export async function checkSupabaseConnection(retries = 3, delay = 1000) {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1)
        .single();

      if (error) {
        console.warn(`Connection attempt ${attempt + 1} failed:`, error.message);
        attempt++;
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
        throw error;
      }

      console.log('Successfully connected to Supabase');
      return true;
    } catch (err) {
      const error = err as Error;
      console.warn(`Connection attempt ${attempt + 1} failed:`, error.message);
      
      attempt++;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      console.error('All connection attempts failed:', error.message);
      toast.error('Unable to connect to the database. Please check your internet connection.');
      return false;
    }
  }
  
  return false;
}

// Initialize connection check with exponential backoff
(async () => {
  let connected = false;
  let retryCount = 0;
  const maxRetries = 5;
  let delay = 1000;

  while (!connected && retryCount < maxRetries) {
    connected = await checkSupabaseConnection();
    if (!connected) {
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`Retrying connection in ${delay}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  if (!connected) {
    console.error('Failed to establish connection to Supabase after multiple attempts');
    toast.error('Database connection failed. Please refresh the page or try again later.');
  }
})();