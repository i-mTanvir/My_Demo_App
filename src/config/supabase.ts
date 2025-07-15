import { createClient } from '@supabase/supabase-js';
import { RealtimeClient } from '@supabase/realtime-js';

// Environment configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'serrano-tex-ims@1.0.0'
    }
  }
});

// Realtime client for advanced real-time features
export const realtimeClient = new RealtimeClient(
  supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/realtime/v1',
  {
    params: {
      apikey: supabaseAnonKey,
      vsn: '1.0.0'
    }
  }
);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'manager' | 'employee' | 'viewer';
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'manager' | 'employee' | 'viewer';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'manager' | 'employee' | 'viewer';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          category_id: string;
          price: number;
          cost: number;
          sku: string;
          barcode: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          category_id: string;
          price: number;
          cost: number;
          sku: string;
          barcode?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category_id?: string;
          price?: number;
          cost?: number;
          sku?: string;
          barcode?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          location_id: string;
          quantity: number;
          reserved_quantity: number;
          reorder_point: number;
          max_stock: number;
          last_counted: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          location_id: string;
          quantity: number;
          reserved_quantity?: number;
          reorder_point?: number;
          max_stock?: number;
          last_counted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          location_id?: string;
          quantity?: number;
          reserved_quantity?: number;
          reorder_point?: number;
          max_stock?: number;
          last_counted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'manager' | 'employee' | 'viewer';
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];