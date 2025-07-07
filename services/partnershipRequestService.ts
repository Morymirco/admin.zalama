import { createClient } from '@supabase/supabase-js';
import { PartnershipRequest, PartnershipRequestStats, PartnershipRequestFilters } from '@/types/partnershipRequest';
import partnershipNotificationService from './partnershipNotificationService';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseKey);

class PartnershipRequestService {
  // Récupérer toutes les demandes
  async getAll(filters?: PartnershipRequestFilters): Promise<PartnershipRequest[]> {
    try {
      let query = supabase
        .from('partnership_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.activity_domain) {
        query = query.eq('activity_domain', filters.activity_domain);
      }

      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,rep_full_name.ilike.%${filters.search}%,hr_full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partnershipRequestService.getAll:', error);
      throw error;
    }
  }

  // Récupérer une demande par ID
  async getById(id: string): Promise<PartnershipRequest | null> {
    try {
      const { data, error } = await supabase
        .from('partnership_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la demande:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur partnershipRequestService.getById:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une demande
  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected' | 'in_review'): Promise<PartnershipRequest> {
    try {
      const { data, error } = await supabase
        .from('partnership_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur partnershipRequestService.updateStatus:', error);
      throw error;
    }
  }

  // Approuver une demande avec notifications automatiques
  async approve(id: string): Promise<PartnershipRequest> {
    try {
      console.log('🔄 Approbation de la demande de partenariat:', id);
      
      // Mettre à jour le statut
      const approvedRequest = await this.updateStatus(id, 'approved');
      
      // Envoyer les notifications automatiquement
      try {
        console.log('📧 Envoi des notifications d\'approbation...');
        const notificationResult = await partnershipNotificationService.sendApprovalNotifications(id);
        
        if (notificationResult.success) {
          console.log('✅ Notifications envoyées avec succès');
          if (notificationResult.details) {
            console.log('📊 Détails des notifications:');
            console.log('   SMS:', notificationResult.details.sms?.success ? '✅' : '❌');
            console.log('   Email:', notificationResult.details.email?.success ? '✅' : '❌');
          }
        } else {
          console.warn('⚠️ Échec de l\'envoi des notifications:', notificationResult.error);
        }
      } catch (notificationError) {
        console.error('❌ Erreur lors de l\'envoi des notifications:', notificationError);
        // Ne pas faire échouer l'approbation si les notifications échouent
      }
      
      return approvedRequest;
    } catch (error) {
      console.error('Erreur partnershipRequestService.approve:', error);
      throw error;
    }
  }

  // Rejeter une demande
  async reject(id: string): Promise<PartnershipRequest> {
    return this.updateStatus(id, 'rejected');
  }

  // Mettre en révision une demande
  async setInReview(id: string): Promise<PartnershipRequest> {
    return this.updateStatus(id, 'in_review');
  }

  // Supprimer une demande
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('partnership_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la demande:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur partnershipRequestService.delete:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStats(): Promise<PartnershipRequestStats> {
    try {
      const { data, error } = await supabase
        .from('partnership_requests')
        .select('status, activity_domain');

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
      }

      const stats: PartnershipRequestStats = {
        total: data?.length || 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        in_review: 0,
        by_domain: {}
      };

      // Calculer les statistiques
      data?.forEach(request => {
        stats[request.status]++;
        
        if (request.activity_domain) {
          stats.by_domain[request.activity_domain] = (stats.by_domain[request.activity_domain] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erreur partnershipRequestService.getStats:', error);
      throw error;
    }
  }

  // Récupérer les domaines d'activité uniques
  async getActivityDomains(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('partnership_requests')
        .select('activity_domain')
        .not('activity_domain', 'is', null);

      if (error) {
        console.error('Erreur lors de la récupération des domaines:', error);
        throw error;
      }

      const domains = [...new Set(data?.map(item => item.activity_domain).filter(Boolean))];
      return domains.sort();
    } catch (error) {
      console.error('Erreur partnershipRequestService.getActivityDomains:', error);
      throw error;
    }
  }

  // Rechercher des demandes
  async search(searchTerm: string): Promise<PartnershipRequest[]> {
    try {
      const { data, error } = await supabase
        .from('partnership_requests')
        .select('*')
        .or(`company_name.ilike.%${searchTerm}%,rep_full_name.ilike.%${searchTerm}%,hr_full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partnershipRequestService.search:', error);
      throw error;
    }
  }
}

export const partnershipRequestService = new PartnershipRequestService();
export default partnershipRequestService; 