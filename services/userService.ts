import { createClient } from '@supabase/supabase-js';
import { Utilisateur } from '@/types/utilisateur';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

class UserService {
  // Récupérer tous les utilisateurs
  async getAll(): Promise<Utilisateur[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par ID
  async getById(id: string): Promise<Utilisateur | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  async create(userData: Partial<Utilisateur>): Promise<Utilisateur> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          active: userData.active ?? true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  async update(id: string, userData: Partial<Utilisateur>): Promise<Utilisateur> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // Rechercher des utilisateurs
  async search(query: string): Promise<Utilisateur[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%,phone_number.ilike.%${query}%`)
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw error;
    }
  }

  // Filtrer par type d'utilisateur
  async getByType(type: string): Promise<Utilisateur[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', type)
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du filtrage par type:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des utilisateurs
  async getStats(): Promise<{
    total: number;
    actifs: number;
    inactifs: number;
    parType: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;

      const users = data || [];
      const total = users.length;
      const actifs = users.filter(u => u.active).length;
      const inactifs = total - actifs;

      const parType = users.reduce((acc, user) => {
        const type = user.type || 'Non défini';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, actifs, inactifs, parType };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export default new UserService();
