import { createClient } from '@supabase/supabase-js';
import { Partner } from '@/types/employee';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertFromDB = (dbPartner: any): Partner => {
  return {
    id: dbPartner.id,
    nom: dbPartner.nom,
    type: dbPartner.type,
    secteur: dbPartner.secteur,
    description: dbPartner.description,
    nom_representant: dbPartner.nom_representant,
    email_representant: dbPartner.email_representant,
    telephone_representant: dbPartner.telephone_representant,
    nom_rh: dbPartner.nom_rh,
    email_rh: dbPartner.email_rh,
    telephone_rh: dbPartner.telephone_rh,
    rccm: dbPartner.rccm,
    nif: dbPartner.nif,
    email: dbPartner.email,
    telephone: dbPartner.telephone,
    adresse: dbPartner.adresse,
    site_web: dbPartner.site_web,
    logo_url: dbPartner.logo_url,
    date_adhesion: dbPartner.date_adhesion,
    actif: dbPartner.actif ?? true,
    nombre_employes: dbPartner.nombre_employes ?? 0,
    salaire_net_total: dbPartner.salaire_net_total,
    created_at: dbPartner.created_at,
    updated_at: dbPartner.updated_at,
    poste_representant: dbPartner.poste_representant
  };
};

class PartnerService {
  // Récupérer tous les partenaires
  async getAll(): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des partenaires:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des partenaires
  async getStats(): Promise<{
    total: number;
    actifs: number;
    inactifs: number;
    parSecteur: Record<string, number>;
    parType: Record<string, number>;
    totalEmployes: number;
    salaireTotal: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*');

      if (error) throw error;

      const partners = (data || []).map(convertFromDB);
      
      const total = partners.length;
      const actifs = partners.filter(partner => partner.actif).length;
      const inactifs = total - actifs;
      
      const parSecteur = partners.reduce((acc, partner) => {
        acc[partner.secteur] = (acc[partner.secteur] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const parType = partners.reduce((acc, partner) => {
        acc[partner.type] = (acc[partner.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalEmployes = partners.reduce((sum, partner) => sum + (partner.nombre_employes || 0), 0);
      const salaireTotal = partners.reduce((sum, partner) => sum + (partner.salaire_net_total || 0), 0);

      return {
        total,
        actifs,
        inactifs,
        parSecteur,
        parType,
        totalEmployes,
        salaireTotal
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des partenaires:', error);
      throw error;
    }
  }

  // obtenir le nombre d'employés actifs 
  async getNombreEmployesActifs(): Promise<Number> {
    try {
      const { data, error } = await supabase.from('employees')
        .select('*')
        .eq('actif', true);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre d\'employés actifs:', error);
      throw error;
    }
  }

  // Obtenir les nouveaux partenaires du mois
  async getNewThisMonth(): Promise<Partner[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .gte('created_at', firstDayOfMonth)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des nouveaux partenaires:', error);
      throw error;
    }
  }
}

export const partnerService = new PartnerService(); 