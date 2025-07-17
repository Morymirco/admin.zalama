import { getZalamaEmailTemplate } from '@/lib/email-template';
import { createClient } from '@supabase/supabase-js';

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
          const smsMessage = `Demande de partenariat approuvée: ${request.company_name} (${request.activity_domain}). Contact: ${request.rep_full_name} - ${request.phone}. Email: ${request.email}`;
          
          const phoneNumbers = contacts.map(contact => contact.telephone).filter(phone => phone && phone.trim() !== '');
          
          if (phoneNumbers.length > 0) {
            console.log('📱 Envoi SMS à', phoneNumbers.length, 'contacts:', phoneNumbers);
            
            const smsResult = await fetch('/api/sms/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: phoneNumbers,
                message: smsMessage,
                sender_name: 'ZaLaMa'
              })
            });
            
            const smsResponse = await smsResult.json();
            
            results.sms = {
              success: smsResponse.success,
              error: smsResponse.error || smsResponse.message || ''
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

      // Envoyer email au partenaire avec le design ZaLaMa
      if (request.email) {
        try {
          const subject = `Demande de partenariat approuvée - ${request.company_name}`;
          
          // Utiliser le template ZaLaMa moderne et simplifié
          const html = getZalamaEmailTemplate({
            title: `Bienvenue dans l'écosystème ZaLaMa`,
            username: request.rep_full_name,
            content: `
              <tr>
                <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #059669; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                      Félicitations !
                    </h1>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px; font-style: italic;">
                      Votre demande de partenariat a été officiellement approuvée
                    </p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 2px solid #0ea5e9;">
                    <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                      Détails de votre partenariat
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600; width: 40%;">Entreprise :</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${request.company_name}</td>
                      </tr>
                      <tr style="background-color: rgba(59, 130, 246, 0.05);">
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Domaine d'activité :</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${request.activity_domain}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Représentant :</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${request.rep_full_name}</td>
                      </tr>
                      <tr style="background-color: rgba(59, 130, 246, 0.05);">
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Responsable RH :</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${request.hr_full_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Email :</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${request.email}</td>
                      </tr>
                      <tr style="background-color: rgba(59, 130, 246, 0.05);">
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Téléphone :</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${request.phone}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 6px solid #f59e0b;">
                    <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Prochaines étapes
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; color: #78350f;">
                      <li style="margin-bottom: 8px; font-weight: 500;">Réception de vos identifiants de connexion sous 24h</li>
                      <li style="margin-bottom: 8px; font-weight: 500;">Configuration de votre profil sur la plateforme</li>
                      <li style="margin-bottom: 8px; font-weight: 500;">Formation d'intégration avec notre équipe</li>
                      <li style="margin-bottom: 8px; font-weight: 500;">Mise en service des fonctionnalités ZaLaMa</li>
                    </ol>
                  </div>
                  
                  <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                    <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Support et assistance
                    </h3>
                    <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.6;">
                      Notre équipe dédiée aux partenaires est à votre disposition pour vous accompagner :
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                      <div style="flex: 1; min-width: 200px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
                        <div style="color: #059669; font-weight: 600; margin-bottom: 5px;">Email</div>
                        <div style="color: #374151;">partenaires@zalamagn.com</div>
                      </div>
                      <div style="flex: 1; min-width: 200px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
                        <div style="color: #059669; font-weight: 600; margin-bottom: 5px;">Téléphone</div>
                        <div style="color: #374151;">+224 XXX XXX XXX</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 12px;">
                    <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                      Nous sommes ravis de vous accueillir dans la famille ZaLaMa !
                    </p>
                    <p style="color: #bfdbfe; margin: 0; font-size: 14px;">
                      Ensemble, révolutionnons la gestion des ressources humaines en Guinée
                    </p>
                  </div>
                </td>
              </tr>
            `
          });
          
          const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: [request.email],
              subject: subject,
              html: html
            })
          });

          const emailResult = await response.json();
          
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

      // Envoyer email aux contacts RH et responsables avec le design ZaLaMa
      if (contacts.length > 0) {
        try {
          const adminSubject = `Nouveau partenariat approuvé - ${request.company_name}`;
          
          // Utiliser le template ZaLaMa pour les emails admin
          const adminHtml = getZalamaEmailTemplate({
            title: `Nouveau partenaire intégré`,
            content: `
              <tr>
                <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1e40af; margin: 0; font-size: 24px; font-weight: 700;">
                      Nouveau Partenaire Approuvé
                    </h1>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">
                      Un nouveau partenaire a été intégré à la plateforme ZaLaMa
                    </p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 2px solid #10b981;">
                    <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #059669; padding-bottom: 10px;">
                      Informations du partenaire
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; color: #374151; font-weight: 600; width: 40%;">Entreprise :</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${request.company_name}</td>
                      </tr>
                      <tr style="background-color: rgba(16, 185, 129, 0.05);">
                        <td style="padding: 10px 0; color: #374151; font-weight: 600;">Secteur :</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${request.activity_domain}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #374151; font-weight: 600;">Représentant :</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${request.rep_full_name}</td>
                      </tr>
                      <tr style="background-color: rgba(16, 185, 129, 0.05);">
                        <td style="padding: 10px 0; color: #374151; font-weight: 600;">Responsable RH :</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${request.hr_full_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #374151; font-weight: 600;">Contact :</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${request.email}</td>
                      </tr>
                      <tr style="background-color: rgba(16, 185, 129, 0.05);">
                        <td style="padding: 10px 0; color: #374151; font-weight: 600;">Téléphone :</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${request.phone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #374151; font-weight: 600;">Date d'approbation :</td>
                        <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${new Date().toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 6px solid #ef4444;">
                    <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Actions requises
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
                      <li style="margin-bottom: 8px; font-weight: 500;">Créer les comptes utilisateur du partenaire</li>
                      <li style="margin-bottom: 8px; font-weight: 500;">Planifier la formation d'intégration</li>
                      <li style="margin-bottom: 8px; font-weight: 500;">Envoyer les documents contractuels</li>
                      <li style="margin-bottom: 8px; font-weight: 500;">Configurer les paramètres de la plateforme</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 1px solid #cbd5e1;">
                    <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">
                      Cette notification a été générée automatiquement par le système ZaLaMa.<br>
                      Pour toute question, contactez l'équipe technique.
                    </p>
                  </div>
                </td>
              </tr>
            `
          });
          
          // Envoyer aux contacts admin
          const adminEmails = contacts.map(contact => contact.email).filter(email => email);
          const adminResponse = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: adminEmails,
              subject: adminSubject,
              html: adminHtml
            })
          });

          const adminEmailResult = await adminResponse.json();
          
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