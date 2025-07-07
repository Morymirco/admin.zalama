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

class EmailClientService {
  private baseUrl = '/api/email/send';

  async sendEmail(message: EmailMessage): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email');
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
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
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue sur ZaLaMa</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur ZaLaMa</h1>
            <p>Votre compte RH a été créé avec succès</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.nom},</h2>
            
            <p>Nous sommes ravis de vous accueillir dans la famille ZaLaMa !</p>
            
            <p>En tant que responsable RH de <strong>${data.partenaireNom || 'votre entreprise'}</strong>, 
            vous avez maintenant accès à toutes les fonctionnalités de gestion des ressources humaines.</p>
            
            <div class="credentials">
              <h3>🔐 Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${data.email}</p>
              <p><strong>Mot de passe :</strong> ${data.password}</p>
              <p><strong>Rôle :</strong> Responsable RH</p>
            </div>
            
            <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
            
            <a href="https://admin.zalama.com" class="button">Se connecter maintenant</a>
            
            <h3>🚀 Fonctionnalités RH disponibles :</h3>
            <ul>
              <li>Gestion des employés et contrats</li>
              <li>Suivi des congés et absences</li>
              <li>Gestion des avances de salaire</li>
              <li>Génération de fiches de paie</li>
              <li>Tableau de bord RH en temps réel</li>
              <li>Gestion des formations</li>
              <li>Suivi des performances</li>
            </ul>
            
            <p>Pour toute question ou assistance, n'hésitez pas à nous contacter :</p>
            <ul>
              <li>📧 Email : support@zalama.com</li>
              <li>📞 Téléphone : +224 XXX XXX XXX</li>
              <li>💬 Chat en ligne : Disponible sur la plateforme</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
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
      
      Pour toute question ou assistance :
      - Email : support@zalama.com
      - Téléphone : +224 XXX XXX XXX
      - Chat en ligne : Disponible sur la plateforme
      
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
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue sur ZaLaMa</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur ZaLaMa</h1>
            <p>Votre compte responsable a été créé avec succès</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.nom},</h2>
            
            <p>Nous sommes ravis de vous accueillir dans la famille ZaLaMa !</p>
            
            <p>En tant que représentant de <strong>${data.partenaireNom || 'votre entreprise'}</strong>, 
            vous avez maintenant accès à toutes les fonctionnalités de gestion.</p>
            
            <div class="credentials">
              <h3>🔐 Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${data.email}</p>
              <p><strong>Mot de passe :</strong> ${data.password}</p>
              <p><strong>Rôle :</strong> Représentant</p>
            </div>
            
            <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
            
            <a href="https://admin.zalama.com" class="button">Se connecter maintenant</a>
            
            <h3>🚀 Fonctionnalités disponibles :</h3>
            <ul>
              <li>Vue d'ensemble de votre entreprise</li>
              <li>Gestion des partenariats</li>
              <li>Suivi des performances</li>
              <li>Génération de rapports</li>
              <li>Tableau de bord en temps réel</li>
            </ul>
            
            <p>Pour toute question ou assistance, n'hésitez pas à nous contacter :</p>
            <ul>
              <li>📧 Email : support@zalama.com</li>
              <li>📞 Téléphone : +224 XXX XXX XXX</li>
              <li>💬 Chat en ligne : Disponible sur la plateforme</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
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
      
      Pour toute question ou assistance :
      - Email : support@zalama.com
      - Téléphone : +224 XXX XXX XXX
      - Chat en ligne : Disponible sur la plateforme
      
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
    const subject = `Bienvenue sur ZaLaMa - ${data.partenaireNom || 'Votre entreprise'}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue sur ZaLaMa</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur ZaLaMa</h1>
            <p>Votre compte a été créé avec succès</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.nom},</h2>
            
            <p>Nous sommes ravis de vous accueillir dans la famille ZaLaMa !</p>
            
            <p>Votre compte employé pour <strong>${data.partenaireNom || 'votre entreprise'}</strong> 
            a été créé avec succès.</p>
            
            <div class="credentials">
              <h3>🔐 Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${data.email}</p>
              <p><strong>Mot de passe :</strong> ${data.password}</p>
              <p><strong>Rôle :</strong> Employé</p>
            </div>
            
            <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
            
            <a href="https://admin.zalama.com" class="button">Se connecter maintenant</a>
            
            <h3>🚀 Fonctionnalités disponibles :</h3>
            <ul>
              <li>Consulter vos informations personnelles</li>
              <li>Voir votre fiche de paie</li>
              <li>Accéder à vos avantages</li>
              <li>Suivre vos congés</li>
              <li>Mettre à jour vos informations</li>
            </ul>
            
            <p>Pour toute question ou assistance, n'hésitez pas à nous contacter :</p>
            <ul>
              <li>📧 Email : support@zalama.com</li>
              <li>📞 Téléphone : +224 XXX XXX XXX</li>
              <li>💬 Chat en ligne : Disponible sur la plateforme</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
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
      
      Pour toute question ou assistance :
      - Email : support@zalama.com
      - Téléphone : +224 XXX XXX XXX
      - Chat en ligne : Disponible sur la plateforme
      
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
    const subject = `🎉 Demande de partenariat approuvée - ${data.companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Partenariat Approuvé - ZaLaMa</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Félicitations !</h1>
            <p>Votre demande de partenariat a été approuvée</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.repName},</h2>
            
            <p>Nous avons le plaisir de vous informer que votre demande de partenariat pour <strong>${data.companyName}</strong> a été <strong>approuvée</strong> !</p>
            
            <div class="info-box">
              <h3>📋 Détails du partenariat :</h3>
              <p><strong>Entreprise :</strong> ${data.companyName}</p>
              <p><strong>Domaine d'activité :</strong> ${data.activityDomain}</p>
              <p><strong>Représentant :</strong> ${data.repName}</p>
              <p><strong>Responsable RH :</strong> ${data.hrName}</p>
              <p><strong>Email de contact :</strong> ${data.email}</p>
              <p><strong>Téléphone :</strong> ${data.phone}</p>
            </div>
            
            <p>Votre entreprise est maintenant officiellement partenaire de ZaLaMa. Vous allez recevoir dans les prochains jours :</p>
            
            <ul>
              <li>📧 Vos identifiants de connexion à la plateforme</li>
              <li>📋 Le contrat de partenariat signé</li>
              <li>📞 Un appel de bienvenue de notre équipe</li>
              <li>🎯 Un guide d'utilisation de la plateforme</li>
            </ul>
            
            <p><strong>Prochaines étapes :</strong></p>
            <ol>
              <li>Attendre la réception de vos identifiants de connexion</li>
              <li>Configurer votre profil sur la plateforme</li>
              <li>Commencer à utiliser les services ZaLaMa</li>
              <li>Participer à notre formation d'intégration</li>
            </ol>
            
            <p>Pour toute question ou assistance, n'hésitez pas à nous contacter :</p>
            <ul>
              <li>📧 Email : partenariats@zalama.com</li>
              <li>📞 Téléphone : +224 XXX XXX XXX</li>
              <li>💬 Chat en ligne : Disponible sur la plateforme</li>
            </ul>
            
            <p>Nous sommes ravis de vous accueillir dans la famille ZaLaMa !</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe ZaLaMa</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
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
      
      Pour toute question ou assistance :
      - Email : partenariats@zalama.com
      - Téléphone : +224 XXX XXX XXX
      - Chat en ligne : Disponible sur la plateforme
      
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
    const subject = `✅ Partenariat approuvé - ${data.companyName}`;
    
    const adminEmails = data.adminContacts.map(contact => contact.email).filter(Boolean);
    if (adminEmails.length === 0) {
      return { success: false, error: 'Aucun email admin trouvé' };
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Partenariat Approuvé - Notification Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff; }
          .contact-list { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Partenariat Approuvé</h1>
            <p>Notification automatique - Nouveau partenaire</p>
          </div>
          
          <div class="content">
            <h2>Bonjour,</h2>
            
            <p>Une nouvelle demande de partenariat a été <strong>approuvée</strong> et le partenaire a été notifié.</p>
            
            <div class="info-box">
              <h3>📋 Détails du nouveau partenaire :</h3>
              <p><strong>Entreprise :</strong> ${data.companyName}</p>
              <p><strong>Domaine d'activité :</strong> ${data.activityDomain}</p>
              <p><strong>Représentant :</strong> ${data.repName}</p>
              <p><strong>Responsable RH :</strong> ${data.hrName}</p>
              <p><strong>Email de contact :</strong> ${data.email}</p>
              <p><strong>Téléphone :</strong> ${data.phone}</p>
              <p><strong>Date d'approbation :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div class="contact-list">
              <h4>👥 Contacts internes notifiés :</h4>
              <ul>
                ${data.adminContacts.map(contact => 
                  `<li><strong>${contact.prenom} ${contact.nom}</strong> (${contact.role}) - ${contact.email}</li>`
                ).join('')}
              </ul>
            </div>
            
            <p><strong>Actions à effectuer :</strong></p>
            <ul>
              <li>📧 Envoyer les identifiants de connexion au partenaire</li>
              <li>📋 Préparer le contrat de partenariat</li>
              <li>📞 Planifier un appel de bienvenue</li>
              <li>🎯 Organiser la formation d'intégration</li>
              <li>📊 Ajouter le partenaire aux rapports de suivi</li>
            </ul>
            
            <p>Le partenaire a été automatiquement notifié par email et SMS.</p>
            
            <p>Cordialement,<br>
            <strong>Système ZaLaMa</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
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

export default new EmailClientService(); 