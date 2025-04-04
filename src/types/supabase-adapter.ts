
import { supabase } from "@/integrations/supabase/client";

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

// Define the Supabase response type to avoid complex generics
interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

// Define a type for table names
type TableName = 'inventory_data' | 'chat_history' | 'profiles';

// Simplified adapter function that avoids excessive type instantiation depth
export const createTableAdapter = <T>(tableName: TableName) => {
  return {
    select: (): Promise<SupabaseResponse<T[]>> => {
      return supabase.from(tableName).select() as unknown as Promise<SupabaseResponse<T[]>>;
    },
    insert: (data: any): Promise<SupabaseResponse<T[]>> => {
      return supabase.from(tableName).insert(data) as unknown as Promise<SupabaseResponse<T[]>>;
    },
    update: (data: any, match: Record<string, any>): Promise<SupabaseResponse<T[]>> => {
      const query = supabase.from(tableName).update(data);
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
      return query as unknown as Promise<SupabaseResponse<T[]>>;
    },
    delete: (match: Record<string, any>): Promise<SupabaseResponse<T[]>> => {
      const query = supabase.from(tableName).delete();
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
      return query as unknown as Promise<SupabaseResponse<T[]>>;
    },
    // Helper method to get a specific record
    getOne: (match: Record<string, any>): Promise<SupabaseResponse<T>> => {
      const query = supabase.from(tableName).select();
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
      return query.maybeSingle() as unknown as Promise<SupabaseResponse<T>>;
    }
  };
};

// Create adapters for our tables
export const inventoryTable = createTableAdapter<InventoryItem>('inventory_data');
export const chatHistoryTable = createTableAdapter<ChatHistoryItem>('chat_history');
export const profilesTable = createTableAdapter<UserProfile>('profiles');
