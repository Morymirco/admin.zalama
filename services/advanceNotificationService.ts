import { createClient } from '@supabase/supabase-js';
import serverEmailService from './serverEmailService';
import serverSmsService from './serverSmsService';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          const smsMessage = `✅ Votre demande d'avance de ${this.formatCurrency(request.montant_demande)} a été approuvée! Vous recevrez le paiement dans les prochaines heures. ZaLaMa`;
          
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
          const subject = `✅ Demande d'avance approuvée - ${request.employe.nom} ${request.employe.prenom}`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Demande d'avance approuvée</h2>
              <p>Bonjour ${request.employe.prenom} ${request.employe.nom},</p>
              <p>Nous avons le plaisir de vous informer que votre demande d'avance de <strong>${this.formatCurrency(request.montant_demande)}</strong> a été approuvée.</p>
              
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0369a1;">Détails de votre demande</h3>
                <p><strong>Montant demandé:</strong> ${this.formatCurrency(request.montant_demande)}</p>
                <p><strong>Motif:</strong> ${request.motif}</p>
                <p><strong>Entreprise:</strong> ${request.partenaire.nom}</p>
                <p><strong>Date d'approbation:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              
              <p>Le paiement sera effectué dans les prochaines heures. Vous recevrez une notification SMS et email dès que le paiement sera traité.</p>
              
              <p>Cordialement,<br>L'équipe ZaLaMa</p>
            </div>
          `;
          
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
          const smsMessage = `❌ Votre demande d'avance de ${this.formatCurrency(request.montant_demande)} a été rejetée. Motif: ${motif_rejet}. Contactez votre RH pour plus d'informations. ZaLaMa`;
          
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
          const subject = `❌ Demande d'avance rejetée - ${request.employe.nom} ${request.employe.prenom}`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Demande d'avance rejetée</h2>
              <p>Bonjour ${request.employe.prenom} ${request.employe.nom},</p>
              <p>Nous regrettons de vous informer que votre demande d'avance de <strong>${this.formatCurrency(request.montant_demande)}</strong> a été rejetée.</p>
              
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #dc2626;">Détails de votre demande</h3>
                <p><strong>Montant demandé:</strong> ${this.formatCurrency(request.montant_demande)}</p>
                <p><strong>Motif de la demande:</strong> ${request.motif}</p>
                <p><strong>Motif du rejet:</strong> ${motif_rejet}</p>
                <p><strong>Entreprise:</strong> ${request.partenaire.nom}</p>
                <p><strong>Date de rejet:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              
              <p>Pour plus d'informations, veuillez contacter votre responsable RH.</p>
              
              <p>Cordialement,<br>L'équipe ZaLaMa</p>
            </div>
          `;
          
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
          const smsMessage = `✅ Paiement confirmé! Votre avance de ${this.formatCurrency(payment.montant)} a été traitée avec succès. ID: ${payment.numero_transaction.slice(0, 8)}... Méthode: ${payment.methode_paiement}. ZaLaMa`;
          
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
          const subject = `✅ Paiement confirmé - Avance sur salaire`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Paiement confirmé</h2>
              <p>Bonjour ${payment.employe.prenom} ${payment.employe.nom},</p>
              <p>Nous confirmons que votre avance de <strong>${this.formatCurrency(payment.montant)}</strong> a été traitée avec succès.</p>
              
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0369a1;">Détails du paiement</h3>
                <p><strong>Montant:</strong> ${this.formatCurrency(payment.montant)}</p>
                <p><strong>Méthode de paiement:</strong> ${payment.methode_paiement}</p>
                <p><strong>Numéro de transaction:</strong> ${payment.numero_transaction}</p>
                <p><strong>Statut:</strong> ${payment.statut}</p>
                <p><strong>Date de traitement:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              
              <p>L'argent devrait être disponible sur votre compte dans les prochaines minutes.</p>
              
              <p>Cordialement,<br>L'équipe ZaLaMa</p>
            </div>
          `;
          
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
          const smsMessage = `❌ Paiement échoué! Votre avance de ${this.formatCurrency(payment.montant)} n'a pas pu être traitée. Veuillez réessayer ou contacter le support. ZaLaMa`;
          
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
          const subject = `❌ Paiement échoué - Avance sur salaire`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Paiement échoué</h2>
              <p>Bonjour ${payment.employe.prenom} ${payment.employe.nom},</p>
              <p>Nous regrettons de vous informer que le traitement de votre avance de <strong>${this.formatCurrency(payment.montant)}</strong> a échoué.</p>
              
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #dc2626;">Détails de l'échec</h3>
                <p><strong>Montant:</strong> ${this.formatCurrency(payment.montant)}</p>
                <p><strong>Méthode de paiement:</strong> ${payment.methode_paiement}</p>
                <p><strong>Numéro de transaction:</strong> ${payment.numero_transaction}</p>
                <p><strong>Statut:</strong> ${payment.statut}</p>
                <p><strong>Raison de l'échec:</strong> ${errorMessage}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              
              <p>Veuillez réessayer le paiement ou contacter le support technique si le problème persiste.</p>
              
              <p>Cordialement,<br>L'équipe ZaLaMa</p>
            </div>
          `;
          
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
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

const advanceNotificationService = new AdvanceNotificationService();
export default advanceNotificationService; 