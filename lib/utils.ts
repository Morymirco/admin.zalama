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
    // Nettoyer le numéro de téléphone pour Nimba SMS (format sans +)
    const cleanNumber = cleanPhoneNumberForSMS(phoneNumber).replace('+', '');
    
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
        to: [cleanNumber], // Envoyer comme array selon le format Nimba SMS
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

/**
 * Nettoie les données d'un employé
 * @param employeeData Données brutes de l'employé
 * @returns Données nettoyées
 */
export function cleanEmployeeData(employeeData: any): any {
  const cleaned = { ...employeeData };
  
  // Nettoyer les chaînes de caractères
  if (cleaned.nom) cleaned.nom = cleaned.nom.trim();
  if (cleaned.prenom) cleaned.prenom = cleaned.prenom.trim();
  if (cleaned.email) cleaned.email = cleaned.email.trim().toLowerCase();
  if (cleaned.telephone) cleaned.telephone = cleaned.telephone.trim();
  if (cleaned.adresse) cleaned.adresse = cleaned.adresse.trim();
  if (cleaned.poste) cleaned.poste = cleaned.poste.trim();
  if (cleaned.role) cleaned.role = cleaned.role.trim();
  
  // Convertir les valeurs numériques
  if (cleaned.salaire_net) {
    cleaned.salaire_net = parseFloat(cleaned.salaire_net.toString());
  }
  
  // Convertir les valeurs booléennes
  if (cleaned.actif !== undefined) {
    cleaned.actif = Boolean(cleaned.actif);
  }
  
  return cleaned;
}

/**
 * Valide les données d'un employé
 * @param employeeData Données de l'employé
 * @returns Résultat de validation
 */
export function validateEmployeeData(employeeData: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validation des champs obligatoires
  if (!employeeData.nom || employeeData.nom.trim().length === 0) {
    errors.push('Le nom est obligatoire');
  }
  
  if (!employeeData.prenom || employeeData.prenom.trim().length === 0) {
    errors.push('Le prénom est obligatoire');
  }
  
  if (!employeeData.partner_id) {
    errors.push('Le partenaire est obligatoire');
  }
  
  if (!employeeData.poste || employeeData.poste.trim().length === 0) {
    errors.push('Le poste est obligatoire');
  }
  
  // Validation de l'email si fourni
  if (employeeData.email) {
    if (!validateEmail(employeeData.email)) {
      errors.push('Format d\'email invalide');
    }
  } else {
    warnings.push('L\'email est recommandé pour créer un compte de connexion');
  }
  
  // Validation du téléphone si fourni
  if (employeeData.telephone) {
    if (!validateGuineanPhoneNumber(employeeData.telephone)) {
      errors.push('Format de téléphone invalide (format guinéen attendu)');
    }
  } else {
    warnings.push('Le téléphone est recommandé pour recevoir les notifications SMS');
  }
  
  // Validation du salaire si fourni
  if (employeeData.salaire_net !== undefined && employeeData.salaire_net !== null) {
    if (isNaN(employeeData.salaire_net) || employeeData.salaire_net < 0) {
      errors.push('Le salaire doit être un nombre positif');
    }
  }
  
  // Validation de la date d'embauche si fournie
  if (employeeData.date_embauche) {
    const dateEmbauche = new Date(employeeData.date_embauche);
    if (isNaN(dateEmbauche.getTime())) {
      errors.push('Format de date d\'embauche invalide');
    } else if (dateEmbauche > new Date()) {
      warnings.push('La date d\'embauche ne peut pas être dans le futur');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Nettoie les données d'un partenaire
 * @param partnerData Données brutes du partenaire
 * @returns Données nettoyées
 */
export function cleanPartnerData(partnerData: any): any {
  const cleaned = { ...partnerData };
  
  // Nettoyer les chaînes de caractères
  if (cleaned.nom) cleaned.nom = cleaned.nom.trim();
  if (cleaned.type) cleaned.type = cleaned.type.trim();
  if (cleaned.secteur) cleaned.secteur = cleaned.secteur.trim();
  if (cleaned.description) cleaned.description = cleaned.description.trim();
  if (cleaned.nom_representant) cleaned.nom_representant = cleaned.nom_representant.trim();
  if (cleaned.email_representant) cleaned.email_representant = cleaned.email_representant.trim().toLowerCase();
  if (cleaned.telephone_representant) cleaned.telephone_representant = cleaned.telephone_representant.trim();
  if (cleaned.nom_rh) cleaned.nom_rh = cleaned.nom_rh.trim();
  if (cleaned.email_rh) cleaned.email_rh = cleaned.email_rh.trim().toLowerCase();
  if (cleaned.telephone_rh) cleaned.telephone_rh = cleaned.telephone_rh.trim();
  if (cleaned.rccm) cleaned.rccm = cleaned.rccm.trim();
  if (cleaned.nif) cleaned.nif = cleaned.nif.trim();
  if (cleaned.email) cleaned.email = cleaned.email.trim().toLowerCase();
  if (cleaned.telephone) cleaned.telephone = cleaned.telephone.trim();
  if (cleaned.adresse) cleaned.adresse = cleaned.adresse.trim();
  if (cleaned.site_web) cleaned.site_web = cleaned.site_web.trim();
  
  // Convertir les valeurs numériques
  if (cleaned.nombre_employes) {
    cleaned.nombre_employes = parseInt(cleaned.nombre_employes.toString());
  }
  if (cleaned.salaire_net_total) {
    cleaned.salaire_net_total = parseFloat(cleaned.salaire_net_total.toString());
  }
  
  // Convertir les valeurs booléennes
  if (cleaned.actif !== undefined) {
    cleaned.actif = Boolean(cleaned.actif);
  }
  
  return cleaned;
}

/**
 * Valide les données d'un partenaire
 * @param partnerData Données du partenaire
 * @returns Résultat de validation
 */
export function validatePartnerData(partnerData: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validation des champs obligatoires
  if (!partnerData.nom || partnerData.nom.trim().length === 0) {
    errors.push('Le nom du partenaire est obligatoire');
  }
  
  if (!partnerData.type || partnerData.type.trim().length === 0) {
    errors.push('Le type de partenaire est obligatoire');
  }
  
  if (!partnerData.secteur || partnerData.secteur.trim().length === 0) {
    errors.push('Le secteur d\'activité est obligatoire');
  }
  
  // Validation des emails si fournis
  if (partnerData.email) {
    if (!validateEmail(partnerData.email)) {
      errors.push('Format d\'email principal invalide');
    }
  }
  
  if (partnerData.email_rh) {
    if (!validateEmail(partnerData.email_rh)) {
      errors.push('Format d\'email RH invalide');
    }
  } else {
    warnings.push('L\'email RH est recommandé pour créer un compte RH');
  }
  
  if (partnerData.email_representant) {
    if (!validateEmail(partnerData.email_representant)) {
      errors.push('Format d\'email représentant invalide');
    }
  } else {
    warnings.push('L\'email représentant est recommandé pour créer un compte responsable');
  }
  
  // Validation des téléphones si fournis
  if (partnerData.telephone) {
    if (!validateGuineanPhoneNumber(partnerData.telephone)) {
      errors.push('Format de téléphone principal invalide');
    }
  }
  
  if (partnerData.telephone_rh) {
    if (!validateGuineanPhoneNumber(partnerData.telephone_rh)) {
      errors.push('Format de téléphone RH invalide');
    }
  } else {
    warnings.push('Le téléphone RH est recommandé pour recevoir les notifications SMS');
  }
  
  if (partnerData.telephone_representant) {
    if (!validateGuineanPhoneNumber(partnerData.telephone_representant)) {
      errors.push('Format de téléphone représentant invalide');
    }
  } else {
    warnings.push('Le téléphone représentant est recommandé pour recevoir les notifications SMS');
  }
  
  // Validation des valeurs numériques
  if (partnerData.nombre_employes !== undefined && partnerData.nombre_employes !== null) {
    if (isNaN(partnerData.nombre_employes) || partnerData.nombre_employes < 0) {
      errors.push('Le nombre d\'employés doit être un nombre positif');
    }
  }
  
  if (partnerData.salaire_net_total !== undefined && partnerData.salaire_net_total !== null) {
    if (isNaN(partnerData.salaire_net_total) || partnerData.salaire_net_total < 0) {
      errors.push('Le salaire net total doit être un nombre positif');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
