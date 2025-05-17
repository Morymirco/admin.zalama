import { Resend } from 'resend';

// Initialiser Resend avec votre clé API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoie un email de réinitialisation de mot de passe à un nouvel utilisateur
 * @param email Adresse email du destinataire
 * @param displayName Nom complet de l'utilisateur
 * @param resetLink Lien de réinitialisation de mot de passe
 * @returns Résultat de l'envoi
 */
export async function sendPasswordResetEmail(email: string, displayName: string, resetLink: string) {
  try {
    // Utiliser le domaine resend.dev pour les tests
    const { data, error } = await resend.emails.send({
      from: 'Zalama <contact@zalamagn.com>',
      to: email,
      subject: 'Bienvenue chez Zalama - Configurez votre compte',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.zalamagn.com/images/zalama-logo.svg" alt="Zalama Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Bienvenue chez Zalama, ${displayName}!</h2>
          <p style="color: #555; line-height: 1.5;">Votre compte a été créé dans notre système. Pour commencer à utiliser la plateforme, veuillez configurer votre mot de passe en cliquant sur le lien ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Configurer mon mot de passe</a>
          </div>
          <p style="color: #555; line-height: 1.5;">Ce lien est valable pendant 24 heures. Si vous n'avez pas demandé la création de ce compte, veuillez ignorer cet email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px; text-align: center;">
            <p>© ${new Date().getFullYear()} Zalama. Tous droits réservés.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return false;
    }

    console.log('Email envoyé avec succès:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
} 

// Envoyer un email de réinitialisation de mot de passe pour le RH
export async function sendPasswordResetEmailRH(email: string, displayName: string, resetLink: string, partenaireNom: string) {
  try {
    // Utiliser le domaine resend.dev pour les tests
    const { data, error } = await resend.emails.send({
      from: 'Zalama <contact@zalamagn.com>',
      to: email,
      subject: 'Bienvenue sur l\'espace RH Zalama - Configurez votre compte',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.zalamagn.com/images/zalama-logo.svg" alt="Zalama Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Bienvenue sur l'espace RH Zalama, ${displayName}!</h2>
          <p style="color: #555; line-height: 1.5;">Votre compte administrateur RH pour <strong>${partenaireNom}</strong> a été créé dans notre système. En tant que responsable RH, vous aurez accès à :</p>
          
          <ul style="color: #555; line-height: 1.5;">
            <li>La gestion des employés de votre entreprise</li>
            <li>Le suivi des formations et certifications</li>
            <li>Les tableaux de bord analytiques RH</li>
            <li>La gestion des demandes de congés et absences</li>
            <li>Les outils d'évaluation et de performance</li>
          </ul>
          
          <p style="color: #555; line-height: 1.5;">Pour commencer à utiliser la plateforme, veuillez configurer votre mot de passe en cliquant sur le lien ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Configurer mon mot de passe</a>
          </div>
          
          <p style="color: #555; line-height: 1.5;">Ce lien est valable pendant 24 heures. Après avoir configuré votre mot de passe, vous pourrez vous connecter à l'espace RH Zalama et commencer à gérer les ressources humaines de votre entreprise.</p>
          
          <p style="color: #555; line-height: 1.5;">Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe support à <a href="mailto:support@zalamagn.com">support@zalamagn.com</a>.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px; text-align: center;">
            <p>© ${new Date().getFullYear()} Zalama. Tous droits réservés.</p>
            <p>Cet email a été envoyé à ${email}. Si vous n'avez pas demandé la création de ce compte, veuillez nous contacter immédiatement.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return false;
    }

    console.log('Email RH envoyé avec succès:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email RH:', error);
    return false;
  }
}
//Envoie un email au responsable de l'entreprise  
export async function sendWelcomeEmailToResponsable(email: string, displayName: string, partenaireNom: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Zalama <contact@zalamagn.com>',
      to: email,
      subject: 'Bienvenue sur l\'espace d\'administration de votre entreprise - Configurez votre compte',
      html: `
        <div>
          <p>Bonjour ${displayName},</p>
          <p>Vous avez été ajouté comme responsable de l'entreprise ${partenaireNom}.</p>
          <p>Vous pouvez désormais accéder à l'espace d'administration Zalama en utilisant votre email et votre mot de passe.</p>
          <p>Pour configurer votre mot de passe, veuillez cliquer sur le lien ci-dessous :</p>
          <a href="${resetLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Configurer mon mot de passe</a>

        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px; text-align: center;">
            <p>© ${new Date().getFullYear()} Zalama. Tous droits réservés.</p>
            <p>Cet email a été envoyé à ${email}. Si vous n'avez pas demandé la création de ce compte, veuillez nous contacter immédiatement.</p>
          </div>  
      `,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email au responsable:', error);
    return false;
  }
}
