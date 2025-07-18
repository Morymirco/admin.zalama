import { getZalamaEmailTemplate } from '@/lib/email-template';
import { createClient } from '@supabase/supabase-js';
import serverEmailService from './serverEmailService';
import serverSmsService from './serverSmsService';

// Configuration Supabase - Clés directes pour éviter les erreurs d'API key
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🔧 Configuration Supabase pour advanceNotificationService:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
});

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

interface NotificationResult {
  success: boolean;
  sms_sent?: boolean;
  email_sent?: boolean;
  error?: string;
  details?: {
    sms?: { success: boolean; error?: string };
    email?: { success: boolean; error?: string };
  };
}

interface EmployeeInfo {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  partner_id: string;
}

interface PartnerInfo {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
}

interface AdvanceRequestInfo {
  id: string;
  montant_demande: number;
  motif: string;
  statut: string;
  employe: EmployeeInfo;
  partenaire: PartnerInfo;
}

interface PaymentInfo {
  id: string;
  montant: number;
  methode_paiement: string;
  statut: string;
  numero_transaction: string;
  demande_avance_id: string;
}

class AdvanceNotificationService {
  /**
   * Envoyer les notifications lors de la réception d'une demande d'avance
   */
  async sendRequestReceivedNotification(requestId: string): Promise<NotificationResult> {
    try {
      console.log('🔄 Envoi des notifications de réception pour la demande:', requestId);

      // Récupérer les détails de la demande
      const request = await this.getRequestDetails(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Demande d\'avance non trouvée'
        };
      }

      const results = {
        sms: { success: false, error: '' },
        email: { success: false, error: '' }
      };

      // Envoyer SMS à l'employé
      if (request.employe.telephone) {
        try {
          const dateDemande = new Date().toLocaleDateString('fr-FR');
          const smsMessage = `ZaLaMa - Confirmation de réception de votre demande d'avance sur salaire de ${this.formatCurrency(request.montant_demande)} effectuée le ${dateDemande}. Votre demande est en cours de traitement. Vous serez informé de la décision par SMS et email. Merci.`;
          
          const smsResult = await serverSmsService.sendSMS({
            to: [request.employe.telephone],
            message: smsMessage,
            sender_name: 'ZaLaMa'
          });
          
          results.sms = {
            success: smsResult.success,
            error: smsResult.error || smsResult.message || ''
          };
          
          console.log('📱 SMS employé (réception):', results.sms.success ? '✅ Envoyé' : `❌ ${results.sms.error}`);
        } catch (smsError) {
          results.sms = {
            success: false,
            error: `Erreur SMS: ${smsError instanceof Error ? smsError.message : String(smsError)}`
          };
          console.error('❌ Erreur SMS employé (réception):', smsError);
        }
      }

      // Envoyer SMS interne à ZaLaMa
      try {
        const dateDemande = new Date().toLocaleDateString('fr-FR');
        const smsInterne = `ZaLaMa - Nouvelle demande d'avance: ${this.formatCurrency(request.montant_demande)} de ${request.employe.nom} ${request.employe.prenom} (${request.partenaire.nom}) pour ${request.motif} le ${dateDemande}. Traitement requis.`;
        
        // Envoyer aux administrateurs (RH et responsables)
        const adminContacts = await this.getAdminContacts();
        if (adminContacts.length > 0) {
          const phoneNumbers = adminContacts.map(contact => contact.telephone).filter((phone): phone is string => !!phone);
          
          if (phoneNumbers.length > 0) {
            const smsResult = await serverSmsService.sendSMS({
              to: phoneNumbers,
              message: smsInterne,
              sender_name: 'ZaLaMa'
            });
            
            console.log('📱 SMS interne ZaLaMa:', smsResult.success ? '✅ Envoyé' : `❌ ${smsResult.error}`);
          }
        }
      } catch (smsError) {
        console.error('❌ Erreur SMS interne ZaLaMa:', smsError);
      }

      // Email de réception de demande
      if (request.employe.email) {
        try {
          const subject = `Confirmation de réception - Demande d'avance sur salaire`;
          const content = `
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous vous remercions pour votre confiance en ZaLaMa.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous accusons bonne réception de votre demande d'avance sur salaire de <span style="font-weight: bold; color: #1e40af;">${this.formatCurrency(request.montant_demande)}</span> effectuée ce jour.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Notre équipe procède actuellement à l'analyse de votre dossier et vous informera de la décision dans les plus brefs délais.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Vous recevrez une notification par email et SMS dès que votre demande aura été traitée.
              </td>
            </tr>
          `;
          const html = getZalamaEmailTemplate({
            title: 'Confirmation de réception',
            content,
            username: `${request.employe.prenom} ${request.employe.nom}`
          });
          const emailResult = await serverEmailService.sendEmail({
            to: [request.employe.email],
            subject: subject,
            html: html
          });
          results.email = {
            success: emailResult.success,
            error: emailResult.error || ''
          };
          console.log('📧 Email employé (réception):', results.email.success ? '✅ Envoyé' : `❌ ${results.email.error}`);
        } catch (emailError) {
          results.email = {
            success: false,
            error: `Erreur email: ${emailError instanceof Error ? emailError.message : String(emailError)}`
          };
          console.error('❌ Erreur email employé (réception):', emailError);
        }
      }

      const overallSuccess = results.sms.success || results.email.success;
      
      return {
        success: overallSuccess,
        sms_sent: results.sms.success,
        email_sent: results.email.success,
        details: results,
        error: overallSuccess ? undefined : 'Aucune notification envoyée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications de réception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Envoyer les notifications lors de l'approbation d'une demande d'avance
   */
  async sendApprovalNotification(requestId: string): Promise<NotificationResult> {
    try {
      console.log('🔄 Envoi des notifications d\'approbation pour la demande:', requestId);

      // Récupérer les détails de la demande
      const request = await this.getRequestDetails(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Demande d\'avance non trouvée'
        };
      }

      const results = {
        sms: { success: false, error: '' },
        email: { success: false, error: '' }
      };

      // Envoyer SMS à l'employé
      if (request.employe.telephone) {
        try {
          const smsMessage = `ZaLaMa - Votre demande d'avance de ${this.formatCurrency(request.montant_demande)} a été approuvée. Le paiement sera effectué via Lengo Pay conformément aux modalités convenues. Merci pour votre confiance.`;
          
          const smsResult = await serverSmsService.sendSMS({
            to: [request.employe.telephone],
            message: smsMessage,
            sender_name: 'ZaLaMa'
          });
          
          results.sms = {
            success: smsResult.success,
            error: smsResult.error || smsResult.message || ''
          };
          
          console.log('📱 SMS employé:', results.sms.success ? '✅ Envoyé' : `❌ ${results.sms.error}`);
        } catch (smsError) {
          results.sms = {
            success: false,
            error: `Erreur SMS: ${smsError instanceof Error ? smsError.message : String(smsError)}`
          };
          console.error('❌ Erreur SMS employé:', smsError);
        }
      }

      // Envoyer email à l'employé
      if (request.employe.email) {
        try {
          const subject = `Demande d'avance approuvée - ${request.employe.nom} ${request.employe.prenom}`;
          const content = `
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous avons le plaisir de vous informer que votre demande d'avance sur salaire a été <span style="font-weight: bold; color: #059669;">approuvée</span>.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Le montant de <span style="font-weight: bold; color: #1e40af;">${this.formatCurrency(request.montant_demande)}</span> sera versé dans les meilleurs délais via notre plateforme partenaire Lengo Pay.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Vous recevrez une notification de confirmation dès que le virement aura été traité.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous vous remercions pour votre confiance en ZaLaMa.
              </td>
            </tr>
          `;
          const html = getZalamaEmailTemplate({
            title: 'Demande d\'avance approuvée',
            content,
            username: `${request.employe.prenom} ${request.employe.nom}`
          });
          const emailResult = await serverEmailService.sendEmail({
            to: [request.employe.email],
            subject: subject,
            html: html
          });
          results.email = {
            success: emailResult.success,
            error: emailResult.error || ''
          };
          console.log('📧 Email employé:', results.email.success ? '✅ Envoyé' : `❌ ${results.email.error}`);
        } catch (emailError) {
          results.email = {
            success: false,
            error: `Erreur email: ${emailError instanceof Error ? emailError.message : String(emailError)}`
          };
          console.error('❌ Erreur email employé:', emailError);
        }
      }

      // Notifier les administrateurs
      await this.notifyAdmins('Demande d\'avance approuvée', 
        `La demande d'avance de ${request.employe.nom} ${request.employe.prenom} (${request.partenaire.nom}) de ${this.formatCurrency(request.montant_demande)} a été approuvée.`);

      const overallSuccess = results.sms.success || results.email.success;
      
      console.log('📊 Résultats notifications approbation:');
      console.log('   SMS:', results.sms.success ? '✅' : '❌', results.sms.error || '');
      console.log('   Email:', results.email.success ? '✅' : '❌', results.email.error || '');

      return {
        success: overallSuccess,
        sms_sent: results.sms.success,
        email_sent: results.email.success,
        details: results,
        error: overallSuccess ? undefined : 'Aucune notification envoyée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications d\'approbation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Envoyer les notifications lors du rejet d'une demande d'avance
   */
  async sendRejectionNotification(requestId: string, motif_rejet: string): Promise<NotificationResult> {
    try {
      console.log('🔄 Envoi des notifications de rejet pour la demande:', requestId);

      // Récupérer les détails de la demande
      const request = await this.getRequestDetails(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Demande d\'avance non trouvée'
        };
      }

      const results = {
        sms: { success: false, error: '' },
        email: { success: false, error: '' }
      };

      // Envoyer SMS à l'employé
      if (request.employe.telephone) {
        try {
          const smsMessage = `ZaLaMa - Votre demande d'avance de ${this.formatCurrency(request.montant_demande)} a été rejetée. Motif: ${motif_rejet}. Pour plus d'informations, veuillez contacter votre responsable RH ou notre service client.`;
          
          const smsResult = await serverSmsService.sendSMS({
            to: [request.employe.telephone],
            message: smsMessage,
            sender_name: 'ZaLaMa'
          });
          
          results.sms = {
            success: smsResult.success,
            error: smsResult.error || smsResult.message || ''
          };
          
          console.log('📱 SMS employé (rejet):', results.sms.success ? '✅ Envoyé' : `❌ ${results.sms.error}`);
        } catch (smsError) {
          results.sms = {
            success: false,
            error: `Erreur SMS: ${smsError instanceof Error ? smsError.message : String(smsError)}`
          };
          console.error('❌ Erreur SMS employé (rejet):', smsError);
        }
      }

      // Envoyer email à l'employé
      if (request.employe.email) {
        try {
          const subject = `Demande d'avance rejetée - ${request.employe.nom} ${request.employe.prenom}`;
          const content = `
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous regrettons de vous informer que votre demande d'avance sur salaire a été <span style="font-weight: bold; color: #ef4444;">rejetée</span>.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Motif du rejet : <span style="font-weight: bold; color: #1e40af;">${motif_rejet}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Pour plus d'informations concernant cette décision, nous vous invitons à contacter votre responsable RH.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous restons à votre disposition pour toute nouvelle demande ou question.
              </td>
            </tr>
          `;
          const html = getZalamaEmailTemplate({
            title: 'Demande d\'avance rejetée',
            content,
            username: `${request.employe.prenom} ${request.employe.nom}`
          });
          const emailResult = await serverEmailService.sendEmail({
            to: [request.employe.email],
            subject: subject,
            html: html
          });
          results.email = {
            success: emailResult.success,
            error: emailResult.error || ''
          };
          console.log('📧 Email employé (rejet):', results.email.success ? '✅ Envoyé' : `❌ ${results.email.error}`);
        } catch (emailError) {
          results.email = {
            success: false,
            error: `Erreur email: ${emailError instanceof Error ? emailError.message : String(emailError)}`
          };
          console.error('❌ Erreur email employé (rejet):', emailError);
        }
      }

      // Notifier les administrateurs
      await this.notifyAdmins('Demande d\'avance rejetée', 
        `La demande d'avance de ${request.employe.nom} ${request.employe.prenom} (${request.partenaire.nom}) de ${this.formatCurrency(request.montant_demande)} a été rejetée. Motif: ${motif_rejet}`);

      const overallSuccess = results.sms.success || results.email.success;
      
      return {
        success: overallSuccess,
        sms_sent: results.sms.success,
        email_sent: results.email.success,
        details: results,
        error: overallSuccess ? undefined : 'Aucune notification envoyée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications de rejet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Envoyer les notifications lors du paiement d'une avance
   */
  async sendPaymentNotification(paymentId: string): Promise<NotificationResult> {
    try {
      console.log('🔄 Envoi des notifications de paiement pour la transaction:', paymentId);

      // Récupérer les détails du paiement
      const payment = await this.getPaymentDetails(paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'Transaction de paiement non trouvée'
        };
      }

      // Vérifier que le statut est EFFECTUEE
      if (payment.statut !== 'EFFECTUEE') {
        return {
          success: false,
          error: `Statut de transaction invalide: ${payment.statut}. Seules les transactions EFFECTUEE peuvent déclencher des notifications de succès.`
        };
      }

      const results = {
        sms: { success: false, error: '' },
        email: { success: false, error: '' }
      };

      // Envoyer SMS à l'employé
      if (payment.employe.telephone) {
        try {
          const smsMessage = `ZaLaMa - Paiement confirmé. Votre avance de ${this.formatCurrency(payment.montant)} a été traitée avec succès. Réf: ${payment.numero_transaction.slice(0, 8)}... Méthode: ${payment.methode_paiement}.`;
          
          const smsResult = await serverSmsService.sendSMS({
            to: [payment.employe.telephone],
            message: smsMessage,
            sender_name: 'ZaLaMa'
          });
          
          results.sms = {
            success: smsResult.success,
            error: smsResult.error || smsResult.message || ''
          };
          
          console.log('📱 SMS employé (paiement):', results.sms.success ? '✅ Envoyé' : `❌ ${results.sms.error}`);
        } catch (smsError) {
          results.sms = {
            success: false,
            error: `Erreur SMS: ${smsError instanceof Error ? smsError.message : String(smsError)}`
          };
          console.error('❌ Erreur SMS employé (paiement):', smsError);
        }
      }

      // Envoyer email à l'employé
      if (payment.employe.email) {
        try {
          const subject = `Paiement confirmé - Avance sur salaire`;
          const content = `
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous vous confirmons que le paiement de votre avance sur salaire a été effectué avec <span style="font-weight: bold; color: #059669;">succès</span>.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Montant versé : <span style="font-weight: bold; color: #1e40af;">${this.formatCurrency(payment.montant)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Les fonds seront disponibles sur votre compte dans les prochaines minutes selon votre opérateur mobile.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous vous remercions pour votre confiance en ZaLaMa.
              </td>
            </tr>
          `;
          const html = getZalamaEmailTemplate({
            title: 'Paiement confirmé',
            content,
            username: `${payment.employe.prenom} ${payment.employe.nom}`
          });
          const emailResult = await serverEmailService.sendEmail({
            to: [payment.employe.email],
            subject: subject,
            html: html
          });
          results.email = {
            success: emailResult.success,
            error: emailResult.error || ''
          };
          console.log('📧 Email employé (paiement):', results.email.success ? '✅ Envoyé' : `❌ ${results.email.error}`);
        } catch (emailError) {
          results.email = {
            success: false,
            error: `Erreur email: ${emailError instanceof Error ? emailError.message : String(emailError)}`
          };
          console.error('❌ Erreur email employé (paiement):', emailError);
        }
      }

      // Notifier les administrateurs
      await this.notifyAdmins('Paiement d\'avance effectué', 
        `Le paiement de ${this.formatCurrency(payment.montant)} pour ${payment.employe.nom} ${payment.employe.prenom} (${payment.entreprise.nom}) a été effectué avec succès. Méthode: ${payment.methode_paiement}`);

      const overallSuccess = results.sms.success || results.email.success;
      
      return {
        success: overallSuccess,
        sms_sent: results.sms.success,
        email_sent: results.email.success,
        details: results,
        error: overallSuccess ? undefined : 'Aucune notification envoyée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications de paiement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Envoyer les notifications lors de l'échec d'un paiement
   */
  async sendPaymentFailureNotification(paymentId: string, errorMessage: string): Promise<NotificationResult> {
    try {
      console.log('🔄 Envoi des notifications d\'échec de paiement pour la transaction:', paymentId);

      // Récupérer les détails du paiement
      const payment = await this.getPaymentDetails(paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'Transaction de paiement non trouvée'
        };
      }

      // Vérifier que le statut est ANNULEE
      if (payment.statut !== 'ANNULEE') {
        return {
          success: false,
          error: `Statut de transaction invalide: ${payment.statut}. Seules les transactions ANNULEE peuvent déclencher des notifications d'échec.`
        };
      }

      const results = {
        sms: { success: false, error: '' },
        email: { success: false, error: '' }
      };

      // Envoyer SMS à l'employé
      if (payment.employe.telephone) {
        try {
          const smsMessage = `ZaLaMa - Échec de paiement. Votre avance de ${this.formatCurrency(payment.montant)} n'a pas pu être traitée. Veuillez réessayer ultérieurement ou contacter notre service client pour assistance.`;
          
          const smsResult = await serverSmsService.sendSMS({
            to: [payment.employe.telephone],
            message: smsMessage,
            sender_name: 'ZaLaMa'
          });
          
          results.sms = {
            success: smsResult.success,
            error: smsResult.error || smsResult.message || ''
          };
          
          console.log('📱 SMS employé (échec):', results.sms.success ? '✅ Envoyé' : `❌ ${results.sms.error}`);
        } catch (smsError) {
          results.sms = {
            success: false,
            error: `Erreur SMS: ${smsError instanceof Error ? smsError.message : String(smsError)}`
          };
          console.error('❌ Erreur SMS employé (échec):', smsError);
        }
      }

      // Envoyer email à l'employé
      if (payment.employe.email) {
        try {
          const subject = `Paiement échoué - Avance sur salaire`;
          const content = `
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous regrettons de vous informer que le traitement de votre avance sur salaire a rencontré un <span style="font-weight: bold; color: #ef4444;">problème technique</span>.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Montant concerné : <span style="font-weight: bold; color: #1e40af;">${this.formatCurrency(payment.montant)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous vous invitons à réessayer le paiement dans quelques minutes ou à contacter notre service client pour assistance.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                Nous nous excusons pour ce désagrément et vous remercions de votre patience.
              </td>
            </tr>
          `;
          const html = getZalamaEmailTemplate({
            title: 'Paiement échoué',
            content,
            username: `${payment.employe.prenom} ${payment.employe.nom}`
          });
          
          const emailResult = await serverEmailService.sendEmail({
            to: [payment.employe.email],
            subject: subject,
            html: html
          });
          
          results.email = {
            success: emailResult.success,
            error: emailResult.error || ''
          };
          
          console.log('📧 Email employé (échec):', results.email.success ? '✅ Envoyé' : `❌ ${results.email.error}`);
        } catch (emailError) {
          results.email = {
            success: false,
            error: `Erreur email: ${emailError instanceof Error ? emailError.message : String(emailError)}`
          };
          console.error('❌ Erreur email employé (échec):', emailError);
        }
      }

      // Notifier les administrateurs
      await this.notifyAdmins('Échec de paiement d\'avance', 
        `Le paiement de ${this.formatCurrency(payment.montant)} pour ${payment.employe.nom} ${payment.employe.prenom} (${payment.entreprise.nom}) a échoué. Statut: ${payment.statut}, Erreur: ${errorMessage}`);

      const overallSuccess = results.sms.success || results.email.success;
      
      return {
        success: overallSuccess,
        sms_sent: results.sms.success,
        email_sent: results.email.success,
        details: results,
        error: overallSuccess ? undefined : 'Aucune notification envoyée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications d\'échec:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Méthodes privées utilitaires
  private async getRequestDetails(requestId: string): Promise<AdvanceRequestInfo | null> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          id,
          montant_demande,
          motif,
          statut,
          employe:employees(id, nom, prenom, email, telephone, partner_id),
          partenaire:partners(id, nom, email, telephone)
        `)
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la demande:', error);
      return null;
    }
  }

  private async getPaymentDetails(paymentId: string): Promise<PaymentInfo & { employe: EmployeeInfo; entreprise: PartnerInfo } | null> {
    try {
      console.log('🔍 Recherche de la transaction avec numero_transaction:', paymentId);
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          montant,
          methode_paiement,
          statut,
          numero_transaction,
          demande_avance_id,
          employe_id,
          entreprise_id,
          employe:employees!employe_id(id, nom, prenom, email, telephone, partner_id),
          entreprise:partners!entreprise_id(id, nom, email, telephone)
        `)
        .eq('numero_transaction', paymentId)
        .single();

      if (error) {
        console.error('❌ Erreur Supabase lors de la recherche:', error);
        throw error;
      }
      
      if (!data) {
        console.log('⚠️ Aucune transaction trouvée avec numero_transaction:', paymentId);
        return null;
      }
      
      console.log('✅ Transaction trouvée:', {
        id: data.id,
        numero_transaction: data.numero_transaction,
        statut: data.statut,
        montant: data.montant
      });
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des détails du paiement:', error);
      return null;
    }
  }

  private async getAdminContacts(): Promise<{ email?: string; telephone?: string; role: string }[]> {
    try {
      const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('email, telephone, role')
        .in('role', ['rh', 'responsable', 'manager', 'admin'])
        .eq('is_active', true);

      if (error) {
        console.error('Erreur lors de la récupération des administrateurs:', error);
        return [];
      }

      return adminUsers || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des contacts admin:', error);
      return [];
    }
  }

  private async notifyAdmins(title: string, message: string): Promise<void> {
    try {
      // Récupérer tous les administrateurs actifs
      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('id, nom, prenom, email')
        .eq('active', true)
        .in('role', ['admin', 'responsable', 'rh']);

      if (error) throw error;

      // Créer des notifications pour chaque admin
      for (const admin of admins || []) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: admin.id,
            titre: title,
            message: message,
            type: 'Information',
            date_creation: new Date().toISOString()
          }]);
      }

      console.log(`📢 Notifications admin créées pour ${admins?.length || 0} administrateurs`);
    } catch (error) {
      console.error('Erreur lors de la notification des administrateurs:', error);
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

const advanceNotificationService = new AdvanceNotificationService();
export default advanceNotificationService; 