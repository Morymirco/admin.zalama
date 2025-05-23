import admin from '@/lib/firebase-admin';

/**
 * Envoie un SMS à un nouvel utilisateur
 * @param phoneNumber Numéro de téléphone du destinataire (format international)
 * @param displayName Nom complet de l'utilisateur
 * @param resetLink Lien de réinitialisation de mot de passe (optionnel)
 * @param userType Type d'utilisateur (standard, rh, responsable, admin)
 * @returns Résultat de l'envoi
 */
export async function sendWelcomeSMS(phoneNumber: string, displayName: string, resetLink?: string, userType: string = 'standard') {
  try {
    if (!phoneNumber) {
      console.error('Numéro de téléphone manquant');
      return false;
    }

    // Formater le numéro de téléphone
    const formattedPhone = phoneNumber;
    
    // Créer le message en fonction du type d'utilisateur
    let message = '';
    
    switch(userType) {
      case 'rh':
        message = resetLink 
          ? `Bienvenue chez Zalama, ${displayName}! Votre compte RH a été créé. Configurez votre mot de passe ici: ${resetLink}`
          : `Bienvenue chez Zalama, ${displayName}! Votre compte RH a été créé. Consultez votre email pour configurer votre mot de passe.`;
        break;
      case 'responsable':
        message = resetLink 
          ? `Bienvenue chez Zalama, ${displayName}! Votre compte Responsable a été créé. Configurez votre mot de passe ici: ${resetLink}`
          : `Bienvenue chez Zalama, ${displayName}! Votre compte Responsable a été créé. Consultez votre email pour configurer votre mot de passe.`;
        break;
      case 'admin':
        message = resetLink 
          ? `Bienvenue chez Zalama, ${displayName}! Votre compte Administrateur a été créé. Configurez votre mot de passe ici: ${resetLink}`
          : `Bienvenue chez Zalama, ${displayName}! Votre compte Administrateur a été créé. Consultez votre email pour configurer votre mot de passe.`;
        break;
      default:
        message = resetLink 
          ? `Bienvenue chez Zalama, ${displayName}! Votre compte a été créé. Configurez votre mot de passe ici: ${resetLink}`
          : `Bienvenue chez Zalama, ${displayName}! Votre compte a été créé. Consultez votre email pour configurer votre mot de passe.`;
    }

    // Ajouter le message à la collection Firebase pour l'envoi
    await admin
      .firestore()
      .collection("messages")
      .add({
        to: [formattedPhone],
        sendername: "Nimba API",
        message: message,
      });

    console.log('SMS mis en file d\'attente pour livraison!');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    return false;
  }
}

/**
 * Formate un numéro de téléphone au format international
 * @param phoneNumber Numéro de téléphone à formater
 * @returns Numéro de téléphone formaté
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Supprimer tous les caractères non numériques
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // S'assurer que le numéro commence par le code pays
  if (!cleaned.startsWith('224') && !cleaned.startsWith('+224')) {
    cleaned = '224' + cleaned;
  }
  
  // Supprimer le + si présent
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
} 