import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration SMS
const SMS_API_URL = process.env.NEXT_PUBLIC_SMS_API_URL || 'https://api.nimbasms.com';
const SMS_API_KEY = process.env.NEXT_PUBLIC_SMS_API_KEY || '';

interface SMSMessage {
  to: string;
  message: string;
  from?: string;
}

interface SMSResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

// Fonction pour envoyer un SMS
export async function sendSMS(smsData: SMSMessage): Promise<SMSResponse> {
  try {
    // Vérifier les paramètres requis
    if (!smsData.to || !smsData.message) {
      throw new Error('Numéro de téléphone et message requis');
    }

    // Préparer les données pour l'API
    const payload = {
      to: smsData.to,
      message: smsData.message,
      from: smsData.from || 'ZALAMA'
    };

    // Envoyer la requête à l'API SMS
    const response = await fetch(`${SMS_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de l\'envoi du SMS');
    }

    // Enregistrer le message dans Supabase pour l'historique
    await supabase
      .from('sms_messages')
      .insert([{
        to: smsData.to,
        message: smsData.message,
        from: smsData.from || 'ZALAMA',
        status: 'sent',
        message_id: result.message_id,
        sent_at: new Date().toISOString()
      }]);

    return {
      success: true,
      message_id: result.message_id
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    
    // Enregistrer l'erreur dans Supabase
    await supabase
      .from('sms_messages')
      .insert([{
        to: smsData.to,
        message: smsData.message,
        from: smsData.from || 'ZALAMA',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        sent_at: new Date().toISOString()
      }]);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Fonction pour envoyer un SMS de bienvenue
export async function sendWelcomeSMS(phoneNumber: string, userName: string): Promise<SMSResponse> {
  const message = `Bienvenue ${userName} sur la plateforme ZALAMA ! Votre compte a été créé avec succès.`;
  return sendSMS({ to: phoneNumber, message });
}

// Fonction pour envoyer un SMS de notification
export async function sendNotificationSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
  return sendSMS({ to: phoneNumber, message });
}

// Fonction pour vérifier le solde SMS
export async function checkSMSCredit(): Promise<{ balance: number; currency: string }> {
  try {
    const response = await fetch(`${SMS_API_URL}/balance`, {
      headers: {
        'Authorization': `Bearer ${SMS_API_KEY}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur lors de la vérification du solde SMS:', error);
    throw error;
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