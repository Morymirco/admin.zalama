import { Resend } from 'resend';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  nom: string;
  email: string;
  password: string;
  role: 'rh' | 'responsable' | 'employe';
  partenaireNom?: string;
}

export interface PartnershipApprovalEmailData {
  companyName: string;
  repName: string;
  hrName: string;
  email: string;
  activityDomain: string;
  phone: string;
}

export interface PartnershipApprovalAdminEmailData {
  companyName: string;
  repName: string;
  hrName: string;
  email: string;
  activityDomain: string;
  phone: string;
  adminContacts: Array<{ nom: string; prenom: string; email: string; telephone: string; role: string }>;
}

class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY || 're_aQWgf3nW_Ht5jAsAUj6BzqspyDqxEcCwB');

  async sendEmail(message: EmailMessage): Promise<any> {
    try {
      console.log('Début envoi email via Resend:', {
        to: message.to,
        subject: message.subject,
        from: 'ZaLaMa <noreply@zalamagn.com>'
      });

      const result = await this.resend.emails.send({
        from: 'ZaLaMa <noreply@zalamagn.com>',
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      });

      console.log('Email envoyé avec succès via Resend:', {
        id: result.data?.id,
        to: message.to,
        subject: message.subject
      });

      return {
        success: true,
        id: result.data?.id
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email via Resend:', error);
      console.error('Détails de l\'erreur:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      };
    }
  }

  /**
   * Envoyer un email de bienvenue pour un RH
   */
  async sendWelcomeEmailToRH(data: WelcomeEmailData): Promise<any> {
    const subject = `Bienvenue sur ZaLaMa - ${data.partenaireNom || 'Votre entreprise'}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue chez Zalama</title>
      </head>
      <body style="background-color: #ffffff; font-family: 'Roboto', Helvetica, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 100%; margin: 20px auto; background-color: #ffffff; border: 4px solid #1e40af; border-radius: 16px;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 12px 12px 0 0;">
              <span style="color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: inline-block; padding: 8px 16px; background-color: rgba(0,0,0,0.1); border-radius: 8px;">ZaLaMa</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #f9fafb;">
              <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Bienvenue chez ZaLaMa, ${data.nom}!</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    Votre compte RH a été créé dans notre système pour l'entreprise <span style="font-weight: bold; color: #1e40af;">${data.partenaireNom || 'votre entreprise'}</span>. En tant que responsable RH, vous avez maintenant accès à toutes les fonctionnalités de gestion des ressources humaines.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Vos identifiants de connexion :</span><br>
                    <strong>Email :</strong> ${data.email}<br>
                    <strong>Mot de passe :</strong> ${data.password}<br>
                    <strong>Rôle :</strong> Responsable RH
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="https://admin.zalama.com" style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 1px solid #1e40af;">Se connecter maintenant</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Fonctionnalités RH disponibles :</span><br>
                    • Gestion des employés et contrats<br>
                    • Suivi des congés et absences<br>
                    • Gestion des avances de salaire<br>
                    • Génération de fiches de paie<br>
                    • Tableau de bord RH en temps réel<br>
                    • Gestion des formations<br>
                    • Suivi des performances
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Note :</span> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">© 2024 ZaLaMa. Tous droits réservés.</p>
              <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
      Bienvenue sur ZaLaMa - ${data.partenaireNom || 'Votre entreprise'}
      
      Bonjour ${data.nom},
      
      Nous sommes ravis de vous accueillir dans la famille ZaLaMa !
      
      En tant que responsable RH de ${data.partenaireNom || 'votre entreprise'}, 
      vous avez maintenant accès à toutes les fonctionnalités de gestion des ressources humaines.
      
      Vos identifiants de connexion :
      - Email : ${data.email}
      - Mot de passe : ${data.password}
      - Rôle : Responsable RH
      
      Important : Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
      
      Connectez-vous sur : https://admin.zalama.com
      
      Fonctionnalités RH disponibles :
      - Gestion des employés et contrats
      - Suivi des congés et absences
      - Gestion des avances de salaire
      - Génération de fiches de paie
      - Tableau de bord RH en temps réel
      - Gestion des formations
      - Suivi des performances
      
      © 2024 ZaLaMa. Tous droits réservés.
    `;

    return this.sendEmail({
      to: data.email,
      subject: subject,
      html: html,
      text: text
    });
  }

  /**
   * Envoyer un email de bienvenue pour un responsable
   */
  async sendWelcomeEmailToResponsable(data: WelcomeEmailData): Promise<any> {
    const subject = `Bienvenue sur ZaLaMa - ${data.partenaireNom || 'Votre entreprise'}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue chez Zalama</title>
      </head>
      <body style="background-color: #ffffff; font-family: 'Roboto', Helvetica, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 100%; margin: 20px auto; background-color: #ffffff; border: 4px solid #1e40af; border-radius: 16px;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 12px 12px 0 0;">
              <span style="color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: inline-block; padding: 8px 16px; background-color: rgba(0,0,0,0.1); border-radius: 8px;">ZaLaMa</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #f9fafb;">
              <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Bienvenue chez ZaLaMa, ${data.nom}!</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    Votre compte responsable a été créé dans notre système pour l'entreprise <span style="font-weight: bold; color: #1e40af;">${data.partenaireNom || 'votre entreprise'}</span>. En tant que représentant, vous avez maintenant accès à toutes les fonctionnalités de gestion.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Vos identifiants de connexion :</span><br>
                    <strong>Email :</strong> ${data.email}<br>
                    <strong>Mot de passe :</strong> ${data.password}<br>
                    <strong>Rôle :</strong> Représentant
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="https://admin.zalama.com" style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 1px solid #1e40af;">Se connecter maintenant</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Fonctionnalités disponibles :</span><br>
                    • Vue d'ensemble de votre entreprise<br>
                    • Gestion des partenariats<br>
                    • Suivi des performances<br>
                    • Génération de rapports<br>
                    • Tableau de bord en temps réel
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Note :</span> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">© 2024 ZaLaMa. Tous droits réservés.</p>
              <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
      Bienvenue sur ZaLaMa - ${data.partenaireNom || 'Votre entreprise'}
      
      Bonjour ${data.nom},
      
      Nous sommes ravis de vous accueillir dans la famille ZaLaMa !
      
      En tant que représentant de ${data.partenaireNom || 'votre entreprise'}, 
      vous avez maintenant accès à toutes les fonctionnalités de gestion.
      
      Vos identifiants de connexion :
      - Email : ${data.email}
      - Mot de passe : ${data.password}
      - Rôle : Représentant
      
      Important : Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
      
      Connectez-vous sur : https://admin.zalama.com
      
      Fonctionnalités disponibles :
      - Vue d'ensemble de votre entreprise
      - Gestion des partenariats
      - Suivi des performances
      - Génération de rapports
      - Tableau de bord en temps réel
      
      © 2024 ZaLaMa. Tous droits réservés.
    `;

    return this.sendEmail({
      to: data.email,
      subject: subject,
      html: html,
      text: text
    });
  }

  /**
   * Envoyer un email de bienvenue pour un employé
   */
  async sendWelcomeEmailToEmployee(data: WelcomeEmailData): Promise<any> {
    // Afficher les identifiants dans la console
    console.log('ENVOI EMAIL EMPLOYÉ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Nom: ${data.nom}`);
    console.log(`Email: ${data.email}`);
    console.log(`Mot de passe: ${data.password}`);
    console.log(`Partenaire: ${data.partenaireNom || 'Aucun partenaire'}`);
    console.log(`URL de connexion: https://admin.zalama.com`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const subject = `Bienvenue sur ZaLaMa - ${data.partenaireNom || 'Votre entreprise'}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue chez Zalama</title>
      </head>
      <body style="background-color: #ffffff; font-family: 'Roboto', Helvetica, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 100%; margin: 20px auto; background-color: #ffffff; border: 4px solid #1e40af; border-radius: 16px;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 12px 12px 0 0;">
              <span style="color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: inline-block; padding: 8px 16px; background-color: rgba(0,0,0,0.1); border-radius: 8px;">ZaLaMa</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #f9fafb;">
              <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Bienvenue chez ZaLaMa, ${data.nom}!</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    Votre compte employé a été créé dans notre système pour l'entreprise <span style="font-weight: bold; color: #1e40af;">${data.partenaireNom || 'votre entreprise'}</span>. Vous avez maintenant accès à toutes les fonctionnalités de votre espace personnel.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Vos identifiants de connexion :</span><br>
                    <strong>Email :</strong> ${data.email}<br>
                    <strong>Mot de passe :</strong> ${data.password}<br>
                    <strong>Rôle :</strong> Employé
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="https://admin.zalama.com" style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 1px solid #1e40af;">Se connecter maintenant</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Fonctionnalités disponibles :</span><br>
                    • Consulter vos informations personnelles<br>
                    • Voir votre fiche de paie<br>
                    • Accéder à vos avantages<br>
                    • Suivre vos congés<br>
                    • Mettre à jour vos informations
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Note :</span> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">© 2024 ZaLaMa. Tous droits réservés.</p>
              <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
      Bienvenue sur ZaLaMa - ${data.partenaireNom || 'Votre entreprise'}
      
      Bonjour ${data.nom},
      
      Nous sommes ravis de vous accueillir dans la famille ZaLaMa !
      
      Votre compte employé pour ${data.partenaireNom || 'votre entreprise'} 
      a été créé avec succès.
      
      Vos identifiants de connexion :
      - Email : ${data.email}
      - Mot de passe : ${data.password}
      - Rôle : Employé
      
      Important : Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
      
      Connectez-vous sur : https://admin.zalama.com
      
      Fonctionnalités disponibles :
      - Consulter vos informations personnelles
      - Voir votre fiche de paie
      - Accéder à vos avantages
      - Suivre vos congés
      - Mettre à jour vos informations
      
      © 2024 ZaLaMa. Tous droits réservés.
    `;

    return this.sendEmail({
      to: data.email,
      subject: subject,
      html: html,
      text: text
    });
  }

  /**
   * Envoyer un email d'approbation de partenariat au partenaire
   */
  async sendPartnershipApprovalEmail(data: PartnershipApprovalEmailData): Promise<any> {
    const subject = `Demande de partenariat approuvée - ${data.companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partenariat Approuvé - ZaLaMa</title>
      </head>
      <body style="background-color: #ffffff; font-family: 'Roboto', Helvetica, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 100%; margin: 20px auto; background-color: #ffffff; border: 4px solid #1e40af; border-radius: 16px;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 12px 12px 0 0;">
              <span style="color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: inline-block; padding: 8px 16px; background-color: rgba(0,0,0,0.1); border-radius: 8px;">ZaLaMa</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #f9fafb;">
              <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Félicitations !</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    Bonjour ${data.repName},<br><br>
                    Nous avons le plaisir de vous informer que votre demande de partenariat pour <span style="font-weight: bold; color: #1e40af;">${data.companyName}</span> a été <span style="font-weight: bold; color: #1e40af;">approuvée</span> !
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Détails du partenariat :</span><br>
                    <strong>Entreprise :</strong> ${data.companyName}<br>
                    <strong>Domaine d'activité :</strong> ${data.activityDomain}<br>
                    <strong>Représentant :</strong> ${data.repName}<br>
                    <strong>Responsable RH :</strong> ${data.hrName}<br>
                    <strong>Email de contact :</strong> ${data.email}<br>
                    <strong>Téléphone :</strong> ${data.phone}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    Votre entreprise est maintenant officiellement partenaire de ZaLaMa. Vous allez recevoir dans les prochains jours :<br><br>
                    • Vos identifiants de connexion à la plateforme<br>
                    • Le contrat de partenariat signé<br>
                    • Un appel de bienvenue de notre équipe<br>
                    • Un guide d'utilisation de la plateforme
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Prochaines étapes :</span><br>
                    1. Attendre la réception de vos identifiants de connexion<br>
                    2. Configurer votre profil sur la plateforme<br>
                    3. Commencer à utiliser les services ZaLaMa<br>
                    4. Participer à notre formation d'intégration
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">© 2024 ZaLaMa. Tous droits réservés.</p>
              <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
      Félicitations ! Votre demande de partenariat a été approuvée
      
      Bonjour ${data.repName},
      
      Nous avons le plaisir de vous informer que votre demande de partenariat pour ${data.companyName} a été approuvée !
      
      Détails du partenariat :
      - Entreprise : ${data.companyName}
      - Domaine d'activité : ${data.activityDomain}
      - Représentant : ${data.repName}
      - Responsable RH : ${data.hrName}
      - Email de contact : ${data.email}
      - Téléphone : ${data.phone}
      
      Votre entreprise est maintenant officiellement partenaire de ZaLaMa. Vous allez recevoir dans les prochains jours :
      - Vos identifiants de connexion à la plateforme
      - Le contrat de partenariat signé
      - Un appel de bienvenue de notre équipe
      - Un guide d'utilisation de la plateforme
      
      Prochaines étapes :
      1. Attendre la réception de vos identifiants de connexion
      2. Configurer votre profil sur la plateforme
      3. Commencer à utiliser les services ZaLaMa
      4. Participer à notre formation d'intégration
      
      Nous sommes ravis de vous accueillir dans la famille ZaLaMa !
      
      Cordialement,
      L'équipe ZaLaMa
      
      © 2024 ZaLaMa. Tous droits réservés.
    `;

    return this.sendEmail({
      to: data.email,
      subject: subject,
      html: html,
      text: text
    });
  }

  /**
   * Envoyer un email d'approbation de partenariat aux administrateurs
   */
  async sendPartnershipApprovalAdminEmail(data: PartnershipApprovalAdminEmailData): Promise<any> {
    const subject = `Partenariat approuvé - ${data.companyName}`;
    
    const adminEmails = data.adminContacts.map(contact => contact.email).filter(Boolean);
    if (adminEmails.length === 0) {
      return { success: false, error: 'Aucun email admin trouvé' };
    }
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Partenariat Approuvé - Notification Admin</title>
      </head>
      <body style="background-color: #ffffff; font-family: 'Roboto', Helvetica, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 100%; margin: 20px auto; background-color: #ffffff; border: 4px solid #1e40af; border-radius: 16px;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 12px 12px 0 0;">
              <span style="color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: inline-block; padding: 8px 16px; background-color: rgba(0,0,0,0.1); border-radius: 8px;">ZaLaMa</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #f9fafb;">
              <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Partenariat Approuvé</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    Bonjour,<br><br>
                    Une nouvelle demande de partenariat a été <span style="font-weight: bold; color: #1e40af;">approuvée</span> et le partenaire a été notifié.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Détails du nouveau partenaire :</span><br>
                    <strong>Entreprise :</strong> ${data.companyName}<br>
                    <strong>Domaine d'activité :</strong> ${data.activityDomain}<br>
                    <strong>Représentant :</strong> ${data.repName}<br>
                    <strong>Responsable RH :</strong> ${data.hrName}<br>
                    <strong>Email de contact :</strong> ${data.email}<br>
                    <strong>Téléphone :</strong> ${data.phone}<br>
                    <strong>Date d'approbation :</strong> ${new Date().toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Contacts internes notifiés :</span><br>
                    ${data.adminContacts.map(contact => 
                      `<strong>${contact.prenom} ${contact.nom}</strong> (${contact.role}) - ${contact.email}<br>`
                    ).join('')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
                    <span style="font-weight: bold; color: #1e40af;">Actions à effectuer :</span><br>
                    • Envoyer les identifiants de connexion au partenaire<br>
                    • Préparer le contrat de partenariat<br>
                    • Planifier un appel de bienvenue<br>
                    • Organiser la formation d'intégration<br>
                    • Ajouter le partenaire aux rapports de suivi
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">© 2024 ZaLaMa. Tous droits réservés.</p>
              <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
      Partenariat Approuvé - Notification Admin
      
      Bonjour,
      
      Une nouvelle demande de partenariat a été approuvée et le partenaire a été notifié.
      
      Détails du nouveau partenaire :
      - Entreprise : ${data.companyName}
      - Domaine d'activité : ${data.activityDomain}
      - Représentant : ${data.repName}
      - Responsable RH : ${data.hrName}
      - Email de contact : ${data.email}
      - Téléphone : ${data.phone}
      - Date d'approbation : ${new Date().toLocaleDateString('fr-FR')}
      
      Contacts internes notifiés :
      ${data.adminContacts.map(contact => 
        `- ${contact.prenom} ${contact.nom} (${contact.role}) - ${contact.email}`
      ).join('\n')}
      
      Actions à effectuer :
      - Envoyer les identifiants de connexion au partenaire
      - Préparer le contrat de partenariat
      - Planifier un appel de bienvenue
      - Organiser la formation d'intégration
      - Ajouter le partenaire aux rapports de suivi
      
      Le partenaire a été automatiquement notifié par email et SMS.
      
      Cordialement,
      Système ZaLaMa
      
      © 2024 ZaLaMa. Tous droits réservés.
    `;

    return this.sendEmail({
      to: adminEmails.join(', '),
      subject: subject,
      html: html,
      text: text
    });
  }
}

export default new EmailService(); 