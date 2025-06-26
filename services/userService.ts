import { createClient } from '@supabase/supabase-js';
import { Utilisateur } from '@/types/utilisateur';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertFromDB = (dbUser: any): Utilisateur => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    nom: dbUser.nom,
    prenom: dbUser.prenom,
    telephone: dbUser.telephone,
    adresse: dbUser.adresse,
    type: dbUser.type,
    statut: dbUser.statut,
    photo_url: dbUser.photo_url,
    organisation: dbUser.organisation,
    poste: dbUser.poste,
    niveau_etudes: dbUser.niveau_etudes,
    etablissement: dbUser.etablissement,
    date_inscription: dbUser.date_inscription ? new Date(dbUser.date_inscription) : undefined,
    derniere_connexion: dbUser.derniere_connexion ? new Date(dbUser.derniere_connexion) : undefined,
    actif: dbUser.actif ?? true,
    created_at: dbUser.created_at ? new Date(dbUser.created_at) : undefined,
    updated_at: dbUser.updated_at ? new Date(dbUser.updated_at) : undefined,
    
    // Propriétés pour la compatibilité UI
    displayName: `${dbUser.prenom} ${dbUser.nom}`,
    phoneNumber: dbUser.telephone,
    active: dbUser.actif,
    createdAt: dbUser.created_at ? { toDate: () => new Date(dbUser.created_at) } as any : undefined,
    lastLogin: dbUser.derniere_connexion,
    photoURL: dbUser.photo_url,
    organization: dbUser.organisation,
    address: dbUser.adresse
  };
};

// Fonction utilitaire pour convertir les données vers la DB
const convertToDB = (userData: Partial<Utilisateur>): any => {
  const dbData: any = {};
  
  if (userData.email !== undefined) dbData.email = userData.email;
  if (userData.nom !== undefined) dbData.nom = userData.nom;
  if (userData.prenom !== undefined) dbData.prenom = userData.prenom;
  if (userData.telephone !== undefined) dbData.telephone = userData.telephone;
  if (userData.adresse !== undefined) dbData.adresse = userData.adresse;
  if (userData.type !== undefined) dbData.type = userData.type;
  if (userData.statut !== undefined) dbData.statut = userData.statut;
  if (userData.photo_url !== undefined) dbData.photo_url = userData.photo_url;
  if (userData.organisation !== undefined) dbData.organisation = userData.organisation;
  if (userData.poste !== undefined) dbData.poste = userData.poste;
  if (userData.niveau_etudes !== undefined) dbData.niveau_etudes = userData.niveau_etudes;
  if (userData.etablissement !== undefined) dbData.etablissement = userData.etablissement;
  if (userData.actif !== undefined) dbData.actif = userData.actif;
  
  return dbData;
};

class UserService {
  // Récupérer tous les utilisateurs
  async getAll(): Promise<Utilisateur[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
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
      return data ? convertFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  async create(userData: Partial<Utilisateur>): Promise<Utilisateur> {
    try {
      const dbData = convertToDB(userData);
      dbData.date_inscription = new Date().toISOString();
      dbData.actif = userData.actif ?? true;

      const { data, error } = await supabase
        .from('users')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  async update(id: string, userData: Partial<Utilisateur>): Promise<Utilisateur> {
    try {
      const dbData = convertToDB(userData);
      dbData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
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
        .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%,telephone.ilike.%${query}%`)
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
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
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
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
      const actifs = users.filter(u => u.actif).length;
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
