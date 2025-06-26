import { createClient } from '@supabase/supabase-js';
import { Service, ServiceFormData } from '@/types/service';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertFromDB = (dbService: any): Service => {
  return {
    id: dbService.id,
    nom: dbService.nom,
    description: dbService.description,
    categorie: dbService.categorie,
    pourcentage_max: dbService.pourcentage_max || 0,
    duree: dbService.duree || '',
    disponible: dbService.disponible ?? true,
    frais_attribues: dbService.frais_attribues || 0,
    image_url: dbService.image_url,
    date_creation: dbService.date_creation ? new Date(dbService.date_creation) : undefined,
    createdAt: dbService.created_at ? { toDate: () => new Date(dbService.created_at) } as any : undefined
  };
};

// Fonction utilitaire pour convertir les données vers la DB
const convertToDB = (serviceData: Partial<Service>): any => {
  const dbData: any = {};
  
  if (serviceData.nom !== undefined) dbData.nom = serviceData.nom;
  if (serviceData.description !== undefined) dbData.description = serviceData.description;
  if (serviceData.categorie !== undefined) dbData.categorie = serviceData.categorie;
  if (serviceData.pourcentage_max !== undefined) dbData.pourcentage_max = serviceData.pourcentage_max;
  if (serviceData.duree !== undefined) dbData.duree = serviceData.duree;
  if (serviceData.disponible !== undefined) dbData.disponible = serviceData.disponible;
  if (serviceData.frais_attribues !== undefined) dbData.frais_attribues = serviceData.frais_attribues;
  if (serviceData.image_url !== undefined) dbData.image_url = serviceData.image_url;
  
  return dbData;
};

class ServiceService {
  // Récupérer tous les services
  async getAll(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
      throw error;
    }
  }

  // Récupérer un service par ID
  async getById(id: string): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? convertFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du service:', error);
      throw error;
    }
  }

  // Créer un nouveau service
  async create(serviceData: ServiceFormData): Promise<Service> {
    try {
      const dbData = convertToDB(serviceData);
      dbData.date_creation = new Date().toISOString();
      dbData.disponible = serviceData.disponible ?? true;

      const { data, error } = await supabase
        .from('services')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création du service:', error);
      throw error;
    }
  }

  // Mettre à jour un service
  async update(id: string, serviceData: Partial<Service>): Promise<Service> {
    try {
      const dbData = convertToDB(serviceData);
      dbData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('services')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      throw error;
    }
  }

  // Supprimer un service
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      throw error;
    }
  }

  // Rechercher des services
  async search(query: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .or(`nom.ilike.%${query}%,description.ilike.%${query}%`)
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la recherche de services:', error);
      throw error;
    }
  }

  // Filtrer par catégorie
  async getByCategory(category: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('categorie', category)
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors du filtrage par catégorie:', error);
      throw error;
    }
  }

  // Obtenir les services disponibles
  async getAvailable(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('disponible', true)
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des services disponibles:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des services
  async getStats(): Promise<{
    total: number;
    disponibles: number;
    indisponibles: number;
    parCategorie: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');

      if (error) throw error;

      const services = data || [];
      const total = services.length;
      const disponibles = services.filter(s => s.disponible).length;
      const indisponibles = total - disponibles;

      const parCategorie = services.reduce((acc, service) => {
        const categorie = service.categorie || 'Non définie';
        acc[categorie] = (acc[categorie] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, disponibles, indisponibles, parCategorie };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Obtenir les catégories avec le nombre de services
  async getCategoriesWithCount(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('categorie');

      if (error) throw error;

      const services = data || [];
      return services.reduce((acc, service) => {
        const categorie = service.categorie || 'Non définie';
        acc[categorie] = (acc[categorie] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }
}

// Instance singleton
const serviceService = new ServiceService();

// Exports pour la compatibilité
export default serviceService;
export const getAvailableServices = () => serviceService.getAvailable();
export const getCategoriesWithCount = () => serviceService.getCategoriesWithCount();
