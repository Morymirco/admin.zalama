import { Resend } from 'resend';

// Initialiser Resend avec votre clé API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoie un email de réinitialisation de mot de passe à un nouvel utilisateur
 * @param email Adresse email du destinataire
 * @param displayName Nom complet de l'utilisateur
 * @param resetLink Lien de réinitialisation de mot de passe
 * @param companyName Nom de l'entreprise
 * @returns Résultat de l'envoi
 */
export async function sendPasswordResetEmail(email: string, displayName: string, resetLink: string, companyName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@zalamagn.com',
      to: [email],
      subject: 'Bienvenue chez ZaLaMa',
      html: `
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
        <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Bienvenue chez ZaLaMa, ${displayName}!</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
              Votre compte a été créé dans notre système pour l'entreprise <span style="font-weight: bold; color: #1e40af;">${companyName}</span>. Pour commencer à utiliser la plateforme, veuillez configurer votre mot de passe en cliquant sur le bouton ci-dessous :
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3); transition: all 0.3s ease; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Configurer mon mot de passe</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
              <span style="font-weight: bold; color: #1e40af;">Note :</span> Ce lien est valable pendant 24 heures. Si vous n'avez pas demandé la création de ce compte, veuillez ignorer cet email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #1e40af; padding: 25px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 15px 0; font-weight: 500;">ZaLaMa SAS - Plateforme de gestion</p>
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 12px 30px; border-radius: 10px; border: 1px solid #ffffff;">
              <a href="mailto:contact@zalamagn.com" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Contactez-nous</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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

/**
 * Envoie un email de réinitialisation de mot de passe pour le RH
 * @param email Adresse email du destinataire
 * @param displayName Nom complet de l'utilisateur
 * @param resetLink Lien de réinitialisation de mot de passe
 * @param partenaireNom Nom du partenaire/entreprise
 * @returns Résultat de l'envoi
 */
export async function sendPasswordResetEmailRH(email: string, displayName: string, resetLink: string, partenaireNom: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@zalamagn.com',
      to: [email],
      subject: 'Accès RH - Configuration de votre compte ZaLaMa',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accès RH - ZaLaMa</title>
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
        <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Bienvenue dans l'espace RH, ${displayName}!</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
              Nous avons le plaisir de vous confirmer que votre entreprise a été intégrée avec succès au tableau de bord partenaire de ZaLaMa, conformément à l'accord de partenariat récemment conclu.
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
              Vous disposez d'un accès sécurisé à votre espace RH, vous permettant notamment de :
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Suivre en temps réel les demandes de vos employés</li>
                <li style="margin-bottom: 8px;">Accéder aux statistiques d'utilisation en temps réel</li>
                <li>Accéder aux rapports d'activité détaillés</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3); transition: all 0.3s ease; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Accéder à mon espace RH</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
              <span style="font-weight: bold; color: #1e40af;">Important :</span> Ce lien est valable 24 heures. Après activation, vous pourrez accéder à l'espace RH de votre entreprise via <a href="https://zalama-partner-dashboard-4esq.vercel.app/" style="color: #1e40af; text-decoration: none;">https://zalama-partner-dashboard-4esq.vercel.app/</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #1e40af; padding: 25px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 15px 0; font-weight: 500;">ZaLaMa SAS - Espace Ressources Humaines</p>
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 12px 30px; border-radius: 10px; border: 1px solid #ffffff;">
              <a href="mailto:rh@zalamagn.com" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Support RH</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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

/**
 * Envoie un email au responsable de l'entreprise
 * @param email Adresse email du destinataire
 * @param displayName Nom complet de l'utilisateur
 * @param partenaireNom Nom de l'entreprise
 * @param resetLink Lien de réinitialisation de mot de passe
 * @returns Résultat de l'envoi
 */
export async function sendWelcomeEmailToResponsable(email: string, displayName: string, partenaireNom: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@zalamagn.com',
      to: [email],
      subject: 'Accès Responsable - Configuration de votre compte ZaLaMa',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accès Responsable - ZaLaMa</title>
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
        <h2 style="color: #1e3a8a; font-size: 30px; font-weight: 700; margin: 0 0 25px 0; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">Bienvenue dans l'espace Responsable, ${displayName}!</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
              Vous avez été désigné comme responsable de l'entreprise <strong style="color: #1e40af;">${partenaireNom}</strong> sur la plateforme Zalama.
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
              En tant qu'administrateur, vous aurez accès à toutes les fonctionnalités de gestion de votre entreprise, y compris la création de comptes utilisateurs, la gestion des accès et la configuration des paramètres organisationnels.
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3); transition: all 0.3s ease; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Accéder à mon espace</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; border: 1px solid #dbeafe;">
              <span style="font-weight: bold; color: #1e40af;">Important :</span> Ce lien est valable 24 heures. Après activation, vous pourrez accéder à l'espace d'administration de votre entreprise via <a href="https://zalama-partner-dashboard-4esq.vercel.app/" style="color: #1e40af; text-decoration: none;">https://zalama-partner-dashboard-4esq.vercel.app/</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #1e40af; padding: 25px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 15px 0; font-weight: 500;">Zalama SAS - Espace Administration Entreprise</p>
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 12px 30px; border-radius: 10px; border: 1px solid #ffffff;">
              <a href="mailto:admin@zalamagn.com" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Support Administrateur</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return false;
    }

    console.log('Email responsable envoyé avec succès:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email au responsable:', error);
    return false;
  }
}