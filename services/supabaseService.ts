import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseService<T> {
  tableName: string;
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  query(filters?: Record<string, any>): Promise<T[]>;
}

export function createSupabaseService<T>(tableName: string): SupabaseService<T> {
  return {
    tableName, // Ajouter le nom de la table pour l'identification
    async getAll(): Promise<T[]> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Erreur lors de la récupération des ${tableName}:`, error);
        throw error;
      }

      return data || [];
    },

    async getById(id: string): Promise<T | null> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Erreur lors de la récupération de ${tableName} par ID:`, error);
        return null;
      }

      return data;
    },

    async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
      const { data: newRecord, error } = await supabase
        .from(tableName)
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error(`Erreur lors de la création de ${tableName}:`, error);
        throw error;
      }

      return newRecord;
    },

    async update(id: string, data: Partial<T>): Promise<T> {
      const { data: updatedRecord, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Erreur lors de la mise à jour de ${tableName}:`, error);
        throw error;
      }

      return updatedRecord;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Erreur lors de la suppression de ${tableName}:`, error);
        throw error;
      }
    },

    async query(filters?: Record<string, any>): Promise<T[]> {
      let query = supabase.from(tableName).select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error(`Erreur lors de la requête sur ${tableName}:`, error);
        throw error;
      }

      return data || [];
    }
  };
} 