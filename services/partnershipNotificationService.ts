import { createClient } from '@supabase/supabase-js';
import smsService from './smsService';
import emailClientService from './emailClientService';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PartnershipRequest {
  id: string;
  company_name: string;
  rep_full_name: string;
  hr_full_name: string;
  email: string;
  phone: string;
  activity_domain: string;
  status: string;
  created_at: string;
}

interface NotificationResult {
  success: boolean;
  error?: string;
  details?: {
    sms?: { success: boolean; error?: string };
    email?: { success: boolean; error?: string };
  };
}

class PartnershipNotificationService {
  /**
   * Envoyer les notifications après approbation d'une demande de partenariat
   */
  async sendApprovalNotifications(requestId: string): Promise<NotificationResult> {
    try {
      console.log('🔄 Envoi des notifications d\'approbation pour la demande:', requestId);

      // Récupérer les détails de la demande
      const request = await this.getRequestDetails(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Demande de partenariat non trouvée'
        };
      }

      // Récupérer les contacts RH et responsables
      const contacts = await this.getRHAndManagerContacts();
      
      const results = {
        sms: { success: false, error: '' },
        email: { success: false, error: '' }
      };

      // Envoyer SMS aux contacts RH et responsables
      if (contacts.length > 0) {
        try {
          const smsMessage = `🎉 Demande de partenariat approuvée: ${request.company_name} (${request.activity_domain}). Contact: ${request.rep_full_name} - ${request.phone}. Email: ${request.email}`;
          
          const phoneNumbers = contacts.map(contact => contact.telephone).filter(phone => phone && phone.trim() !== '');
          
          if (phoneNumbers.length > 0) {
            console.log('📱 Envoi SMS à', phoneNumbers.length, 'contacts:', phoneNumbers);
            
            const smsResult = await smsService.sendSMS({
              to: phoneNumbers,
              message: smsMessage,
              sender_name: 'ZaLaMa'
            });
            
            results.sms = {
              success: smsResult.success,
              error: smsResult.error || smsResult.message || ''
            };
            
            console.log('📱 SMS RH/Responsables:', results.sms.success ? '✅ Envoyé' : `❌ ${results.sms.error}`);
          } else {
            console.log('⚠️ Aucun numéro de téléphone valide trouvé pour l\'envoi de SMS');
            results.sms = {
              success: false,
              error: 'Aucun numéro de téléphone valide trouvé'
            };
          }
        } catch (smsError) {
          results.sms = {
            success: false,
            error: `Erreur SMS: ${smsError instanceof Error ? smsError.message : String(smsError)}`
          };
          console.error('❌ Erreur SMS RH/Responsables:', smsError);
        }
      } else {
        console.log('⚠️ Aucun contact RH/Responsable trouvé');
        results.sms = {
          success: false,
          error: 'Aucun contact RH/Responsable trouvé'
        };
      }

      // Envoyer email au partenaire
      if (request.email) {
        try {
          const emailResult = await emailClientService.sendPartnershipApprovalEmail({
            companyName: request.company_name,
            repName: request.rep_full_name,
            hrName: request.hr_full_name,
            email: request.email,
            activityDomain: request.activity_domain,
            phone: request.phone
          });
          
          results.email = {
            success: emailResult.success,
            error: emailResult.error || ''
          };
          
          console.log('📧 Email partenaire:', results.email.success ? '✅ Envoyé' : `❌ ${results.email.error}`);
        } catch (emailError) {
          results.email = {
            success: false,
            error: `Erreur email: ${emailError instanceof Error ? emailError.message : String(emailError)}`
          };
          console.error('❌ Erreur email partenaire:', emailError);
        }
      }

      // Envoyer email aux contacts RH et responsables
      if (contacts.length > 0) {
        try {
          const adminEmailResult = await emailClientService.sendPartnershipApprovalAdminEmail({
            companyName: request.company_name,
            repName: request.rep_full_name,
            hrName: request.hr_full_name,
            email: request.email,
            activityDomain: request.activity_domain,
            phone: request.phone,
            adminContacts: contacts
          });
          
          if (!results.email.success) {
            results.email = {
              success: adminEmailResult.success,
              error: adminEmailResult.error || ''
            };
          }
          
          console.log('📧 Email admin:', adminEmailResult.success ? '✅ Envoyé' : `❌ ${adminEmailResult.error}`);
        } catch (adminEmailError) {
          console.error('❌ Erreur email admin:', adminEmailError);
        }
      }

      const overallSuccess = results.sms.success || results.email.success;
      
      console.log('📊 Résultats notifications partenariat:');
      console.log('   SMS:', results.sms.success ? '✅' : '❌', results.sms.error || '');
      console.log('   Email:', results.email.success ? '✅' : '❌', results.email.error || '');

      return {
        success: overallSuccess,
        details: results
      };

    } catch (error) {
      console.error('❌ Erreur générale lors de l\'envoi des notifications partenariat:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      };
    }
  }

  /**
   * Récupérer les détails d'une demande de partenariat
   */
  private async getRequestDetails(requestId: string): Promise<PartnershipRequest | null> {
    try {
      const { data, error } = await supabase
        .from('partnership_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la demande:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur getRequestDetails:', error);
      return null;
    }
  }

  /**
   * Récupérer les contacts RH et responsables
   */
  private async getRHAndManagerContacts(): Promise<Array<{ nom: string; prenom: string; email: string; telephone: string; role: string }>> {
    try {
      // Récupérer depuis admin_users uniquement
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('display_name, email, role')
        .in('role', ['rh', 'responsable'])
        .eq('active', true);

      if (adminError) {
        console.error('Erreur lors de la récupération des contacts admin:', adminError);
        return [];
      }

      // Transformer les données admin_users
      const contacts: Array<{ nom: string; prenom: string; email: string; telephone: string; role: string }> = [];

      if (adminUsers && adminUsers.length > 0) {
        adminUsers.forEach(adminUser => {
          const displayName = adminUser.display_name || '';
          const nameParts = displayName.split(' ');
          const prenom = nameParts[0] || '';
          const nom = nameParts.slice(1).join(' ') || '';
          
          contacts.push({
            nom: nom,
            prenom: prenom,
            email: adminUser.email || '',
            telephone: '+224623456789', // Numéro de téléphone par défaut pour les tests
            role: adminUser.role || ''
          });
        });
      }

      console.log('📞 Contacts RH/Responsables trouvés:', contacts.length);
      contacts.forEach(contact => {
        console.log(`   - ${contact.prenom} ${contact.nom} (${contact.role}): ${contact.email} - ${contact.telephone}`);
      });

      return contacts;
    } catch (error) {
      console.error('Erreur getRHAndManagerContacts:', error);
      return [];
    }
  }
}

export default new PartnershipNotificationService(); 