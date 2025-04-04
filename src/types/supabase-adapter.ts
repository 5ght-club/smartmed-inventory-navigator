
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';

// Custom type adapter for inventory data, matches our database structure
export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  expiry_date: string | null;
  unit_price: number;
  supplier: string | null;
  location: string | null;
  created_at?: string | null;
}

// Custom type adapter for chat history, matches our database structure
export interface ChatHistoryItem {
  id: string;
  user_id: string;
  query: string;
  response: string;
  created_at?: string | null;
}

// Custom type adapter for user profile, matches our database structure
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
}

// Create simplified adapters for our tables
export const inventoryTable = {
  select: async () => {
    return await supabase.from('inventory_data').select('*');
  },
  insert: async (data: any) => {
    return await supabase.from('inventory_data').insert(data);
  },
  update: async (data: any, match: Record<string, any>) => {
    const query = supabase.from('inventory_data').update(data);
    Object.entries(match).forEach(([key, value]) => {
      // @ts-ignore - Ignore type errors since we're passing dynamic keys
      query.eq(key, value);
    });
    return await query;
  },
  delete: async (match: Record<string, any>) => {
    const query = supabase.from('inventory_data').delete();
    Object.entries(match).forEach(([key, value]) => {
      // @ts-ignore - Ignore type errors since we're passing dynamic keys
      query.eq(key, value);
    });
    return await query;
  },
  getOne: async (match: Record<string, any>) => {
    const query = supabase.from('inventory_data').select('*');
    Object.entries(match).forEach(([key, value]) => {
      // @ts-ignore - Ignore type errors since we're passing dynamic keys
      query.eq(key, value);
    });
    return await query.maybeSingle();
  }
};

export const chatHistoryTable = {
  select: async () => {
    return await supabase.from('chat_history').select('*');
  },
  insert: async (data: any) => {
    return await supabase.from('chat_history').insert(data);
  }
};

export const profilesTable = {
  select: async () => {
    return await supabase.from('profiles').select('*');
  },
  update: async (data: any, match: Record<string, any>) => {
    const query = supabase.from('profiles').update(data);
    Object.entries(match).forEach(([key, value]) => {
      // @ts-ignore - Ignore type errors since we're passing dynamic keys
      query.eq(key, value);
    });
    return await query;
  },
  getOne: async (match: Record<string, any>) => {
    const query = supabase.from('profiles').select('*');
    Object.entries(match).forEach(([key, value]) => {
      // @ts-ignore - Ignore type errors since we're passing dynamic keys
      query.eq(key, value);
    });
    return await query.maybeSingle();
  }
};
