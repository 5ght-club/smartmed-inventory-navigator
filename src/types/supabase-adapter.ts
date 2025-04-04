
import { supabase } from "@/integrations/supabase/client";
import { PostgrestResponse } from '@supabase/supabase-js';

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

// Create a simplified table adapter for Supabase tables
export const createTableAdapter = <T>(tableName: string) => {
  return {
    select: async () => {
      return await supabase.from(tableName).select();
    },
    insert: async (data: any) => {
      return await supabase.from(tableName).insert(data);
    },
    update: async (data: any, match: Record<string, any>) => {
      const query = supabase.from(tableName).update(data);
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
      return await query;
    },
    delete: async (match: Record<string, any>) => {
      const query = supabase.from(tableName).delete();
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
      return await query;
    },
    // Helper method to get a specific record
    getOne: async (match: Record<string, any>) => {
      const query = supabase.from(tableName).select();
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
      return await query.maybeSingle();
    }
  };
};

// Create adapters for our tables
export const inventoryTable = createTableAdapter<InventoryItem>('inventory_data');
export const chatHistoryTable = createTableAdapter<ChatHistoryItem>('chat_history');
export const profilesTable = createTableAdapter<UserProfile>('profiles');
