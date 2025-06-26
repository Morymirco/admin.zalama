import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Génère un mot de passe sécurisé
 * @param length Longueur du mot de passe (défaut: 8)
 * @returns Mot de passe généré
 */
export function generatePassword(length: number = 8): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Assurer au moins une lettre majuscule, une minuscule, un chiffre et un caractère spécial
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Compléter avec des caractères aléatoires
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Nettoie et formate un numéro de téléphone pour l'envoi SMS
 * @param phoneNumber Numéro de téléphone
 * @returns Numéro formaté pour SMS
 */
export function cleanPhoneNumberForSMS(phoneNumber: string): string {
  // Supprimer tous les caractères non numériques
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Gérer les formats guinéens
  if (cleaned.startsWith('224')) {
    // Format: 224XXXXXXXXX -> +224XXXXXXXXX
    return '+' + cleaned;
  } else if (cleaned.startsWith('6') && cleaned.length === 9) {
    // Format: 6XXXXXXXX -> +2246XXXXXXXX
    return '+224' + cleaned;
  } else if (cleaned.startsWith('224') && cleaned.length === 12) {
    // Format: 224XXXXXXXXX -> +224XXXXXXXXX
    return '+' + cleaned;
  }
  
  // Si le numéro commence déjà par +, le retourner tel quel
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Par défaut, ajouter le préfixe guinéen
  return '+224' + cleaned;
}

/**
 * Envoie un SMS via l'API SMS
 * @param phoneNumber Numéro de téléphone
 * @param message Message à envoyer
 * @returns Promise<boolean>
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Nettoyer le numéro de téléphone
    const cleanNumber = cleanPhoneNumberForSMS(phoneNumber);
    
    console.log('📱 Envoi SMS:', {
      originalNumber: phoneNumber,
      cleanNumber: cleanNumber,
      message: message.substring(0, 50) + '...'
    });

    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: cleanNumber,
        message
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erreur SMS:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Erreur SMS: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ SMS envoyé avec succès:', result);
    return result.success;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    return false;
  }
}

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param phoneNumber Numéro de téléphone
 * @returns Numéro formaté
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Supprimer tous les caractères non numériques
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Formater selon le format guinéen
  if (cleaned.length === 9 && cleaned.startsWith('6')) {
    return `+224 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('224')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  return phoneNumber; // Retourner tel quel si le format n'est pas reconnu
}

/**
 * Valide un numéro de téléphone guinéen
 * @param phoneNumber Numéro de téléphone
 * @returns true si valide
 */
export function validateGuineanPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format guinéen: 6XXXXXXXX ou 224XXXXXXXX
  return /^(6\d{8}|224\d{9})$/.test(cleaned);
}

/**
 * Valide une adresse email
 * @param email Adresse email
 * @returns true si valide
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
