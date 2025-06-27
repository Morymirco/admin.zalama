// Service Email utilisant l'API route Next.js

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

class EmailService {
  /**
   * Envoyer un email simple
   */
  async sendEmail(message: EmailMessage): Promise<any> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Email envoyé avec succès via API route:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email de bienvenue pour un compte RH
   */
  async sendWelcomeEmailToRH(data: WelcomeEmailData): Promise<any> {
    const subject = `Bienvenue sur ZaLaMa RH - ${data.partenaireNom || 'Votre entreprise'}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue sur ZaLaMa RH</title>
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
            <h1>🎉 Bienvenue sur ZaLaMa RH</h1>
            <p>Votre compte a été créé avec succès</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.nom},</h2>
            
            <p>Nous sommes ravis de vous accueillir dans la famille ZaLaMa !</p>
            
            <p>En tant que responsable RH de <strong>${data.partenaireNom || 'votre entreprise'}</strong>, 
            vous avez maintenant accès à toutes les fonctionnalités de gestion des employés.</p>
            
            <div class="credentials">
              <h3>🔐 Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${data.email}</p>
              <p><strong>Mot de passe :</strong> ${data.password}</p>
              <p><strong>Rôle :</strong> Responsable RH</p>
            </div>
            
            <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
            
            <a href="https://admin.zalama.com" class="button">Se connecter maintenant</a>
            
            <h3>🚀 Fonctionnalités disponibles :</h3>
            <ul>
              <li>Gestion complète des employés</li>
              <li>Suivi des salaires et avantages</li>
              <li>Génération de rapports RH</li>
              <li>Gestion des contrats</li>
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
      Bienvenue sur ZaLaMa RH - ${data.partenaireNom || 'Votre entreprise'}
      
      Bonjour ${data.nom},
      
      Nous sommes ravis de vous accueillir dans la famille ZaLaMa !
      
      En tant que responsable RH de ${data.partenaireNom || 'votre entreprise'}, 
      vous avez maintenant accès à toutes les fonctionnalités de gestion des employés.
      
      Vos identifiants de connexion :
      - Email : ${data.email}
      - Mot de passe : ${data.password}
      - Rôle : Responsable RH
      
      Important : Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
      
      Connectez-vous sur : https://admin.zalama.com
      
      Fonctionnalités disponibles :
      - Gestion complète des employés
      - Suivi des salaires et avantages
      - Génération de rapports RH
      - Gestion des contrats
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
   * Envoyer un email de bienvenue pour un compte responsable
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
            <p>Votre compte a été créé avec succès</p>
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
}

export default new EmailService(); 