import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'complaint-management-system',
    },
  },
  db: {
    schema: 'public',
  },
});

// Retry function with exponential backoff
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let retries = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
};

export const supabaseClient = {
  async checkConnection() {
    return retryWithBackoff(async () => {
      const { error } = await supabase.from('complaints').select('id').limit(1);
      if (error) throw error;
      return true;
    });
  },

  async submitComplaint(data: {
    title: string;
    description: string;
    is_anonymous: boolean;
    student_name: string | null;
    student_email: string | null;
  }) {
    return retryWithBackoff(async () => {
      const { data: result, error } = await supabase
        .from('complaints')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!result) throw new Error('No data returned from submission');
      
      return result;
    });
  }
};

export type Complaint = {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  is_anonymous: boolean;
  student_name: string | null;
  student_email: string | null;
  created_at: string;
  updated_at: string;
  image_url: string | null;
};