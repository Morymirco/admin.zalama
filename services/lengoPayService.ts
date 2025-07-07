import fetch from 'node-fetch';

export interface LengoPayCashinParams {
  amount: string;
  currency: string;
  websiteid: string;
  type_account: string;
  account: string;
  callback_url?: string;
}

export interface LengoPayCashinResponse {
  status: string;
  pay_id?: string;
  message: string;
}

// Configuration depuis les variables d'environnement
const LENGO_API_URL = process.env.LENGO_API_URL || 'https://portal.lengopay.com';
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;
const LENGO_API_KEY = process.env.LENGO_API_KEY;
const LENGO_CALLBACK_URL = process.env.LENGO_CALLBACK_URL;

export async function lengoPayCashin(params: LengoPayCashinParams): Promise<LengoPayCashinResponse> {
  // Vérifier que les variables d'environnement sont configurées
  if (!LENGO_API_KEY) {
    throw new Error('Variable d\'environnement LENGO_API_KEY manquante');
  }

  // Vérifier que tous les paramètres requis sont présents
  if (!params.amount || !params.currency || !params.websiteid || !params.type_account || !params.account) {
    throw new Error('Paramètres manquants: amount, currency, websiteid, type_account, account sont requis');
  }

  const headers = {
    'Authorization': `Basic ${LENGO_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify(params);

  console.log('🌐 Appel API Lengo Pay:', {
    url: `${LENGO_API_URL}/api/v2/cashin/request`,
    params: { ...params, amount: params.amount + ' ' + params.currency }
  });

  const response = await fetch(`${LENGO_API_URL}/api/v2/cashin/request`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('❌ Erreur API Lengo Pay:', response.status, text);
    throw new Error(`LengoPay API error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  console.log('✅ Réponse API Lengo Pay:', data);
  return data;
}

// Pour le callback, on attend un objet avec pay_id, status, amount, message, account
export interface LengoPayCallback {
  pay_id: string;
  status: string;
  amount: number;
  message: string;
  account: string;
}

// Cette fonction sera appelée par la route callback
export async function handleLengoPayCallback(callbackData: LengoPayCallback, supabase: any) {
  // Met à jour la transaction dans la table transactions
  // On suppose que pay_id = numero_transaction
  const { pay_id, status, amount, message, account } = callbackData;
  const statut = status === 'SUCCESS' ? 'EFFECTUEE' : 'ECHEC';

  const { data, error } = await supabase
    .from('transactions')
    .update({
      statut,
      montant: amount,
      numero_reception: account,
      message_callback: message,
      date_transaction: new Date().toISOString(),
    })
    .eq('numero_transaction', pay_id)
    .select();

  if (error) {
    throw new Error('Erreur lors de la mise à jour de la transaction: ' + error.message);
  }
  return data;
} 