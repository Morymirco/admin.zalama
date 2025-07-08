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

export interface LengoPayStatusParams {
  pay_id: string;
  websiteid: string;
}

export interface LengoPayStatusResponse {
  status: string;
  pay_id: string;
  amount: number;
  account: number;
  date: string;
}

// Configuration depuis les variables d'environnement
const LENGO_API_URL = process.env.LENGO_API_URL || 'https://portal.lengopay.com';
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;
const LENGO_API_KEY = process.env.LENGO_API_KEY;
const LENGO_CALLBACK_URL = process.env.LENGO_CALLBACK_URL;

export async function lengoPayCashin(params: LengoPayCashinParams): Promise<LengoPayCashinResponse> {
  console.log('🔧 Début de lengoPayCashin avec les paramètres:', params);
  
  // Vérifier que les variables d'environnement sont configurées
  console.log('🔍 Vérification des variables d\'environnement:');
  console.log('  - LENGO_API_URL:', LENGO_API_URL);
  console.log('  - LENGO_SITE_ID:', LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');
  console.log('  - LENGO_API_KEY:', LENGO_API_KEY ? '✅ Présent' : '❌ Manquant');
  console.log('  - LENGO_CALLBACK_URL:', LENGO_CALLBACK_URL ? '✅ Présent' : '❌ Manquant');
  
  if (!LENGO_API_KEY) {
    console.error('❌ Variable d\'environnement LENGO_API_KEY manquante');
    throw new Error('Variable d\'environnement LENGO_API_KEY manquante');
  }

  // Vérifier que tous les paramètres requis sont présents
  console.log('🔍 Vérification des paramètres requis:');
  console.log('  - amount:', params.amount ? '✅ Présent' : '❌ Manquant');
  console.log('  - currency:', params.currency ? '✅ Présent' : '❌ Manquant');
  console.log('  - websiteid:', params.websiteid ? '✅ Présent' : '❌ Manquant');
  console.log('  - type_account:', params.type_account ? '✅ Présent' : '❌ Manquant');
  console.log('  - account:', params.account ? '✅ Présent' : '❌ Manquant');
  
  if (!params.amount || !params.currency || !params.websiteid || !params.type_account || !params.account) {
    console.error('❌ Paramètres manquants:', { 
      amount: !!params.amount, 
      currency: !!params.currency, 
      websiteid: !!params.websiteid, 
      type_account: !!params.type_account, 
      account: !!params.account 
    });
    throw new Error('Paramètres manquants: amount, currency, websiteid, type_account, account sont requis');
  }

  const headers = {
    'Authorization': `Basic ${LENGO_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify(params);

  console.log('🌐 Préparation de l\'appel API Lengo Pay:');
  console.log('  - URL:', `${LENGO_API_URL}/api/v2/cashin/request`);
  console.log('  - Method: POST');
  console.log('  - Headers:', { 
    'Authorization': LENGO_API_KEY ? 'Basic [HIDDEN]' : '❌ Manquant',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });
  console.log('  - Body:', { ...params, amount: params.amount + ' ' + params.currency });

  try {
    console.log('🌐 Envoi de la requête à l\'API Lengo Pay...');
    const response = await fetch(`${LENGO_API_URL}/api/v2/cashin/request`, {
      method: 'POST',
      headers,
      body,
    });

    console.log('📡 Réponse reçue de l\'API Lengo Pay:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Erreur API Lengo Pay:');
      console.error('  - Status:', response.status);
      console.error('  - Status Text:', response.statusText);
      console.error('  - Response Text:', text);
      throw new Error(`LengoPay API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log('✅ Réponse API Lengo Pay parsée avec succès:', data);
    return data;
  } catch (fetchError) {
    console.error('💥 Erreur lors de l\'appel fetch:', fetchError);
    if (fetchError instanceof Error) {
      console.error('  - Message:', fetchError.message);
      console.error('  - Stack:', fetchError.stack);
    }
    throw fetchError;
  }
}

export async function lengoPayStatus(params: LengoPayStatusParams): Promise<LengoPayStatusResponse> {
  console.log('🔍 Début de lengoPayStatus avec les paramètres:', params);
  
  // Vérifier que les variables d'environnement sont configurées
  console.log('🔍 Vérification des variables d\'environnement:');
  console.log('  - LENGO_API_URL:', LENGO_API_URL);
  console.log('  - LENGO_SITE_ID:', LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');
  console.log('  - LENGO_API_KEY:', LENGO_API_KEY ? '✅ Présent' : '❌ Manquant');
  
  if (!LENGO_API_KEY) {
    console.error('❌ Variable d\'environnement LENGO_API_KEY manquante');
    throw new Error('Variable d\'environnement LENGO_API_KEY manquante');
  }

  // Vérifier que tous les paramètres requis sont présents
  console.log('🔍 Vérification des paramètres requis:');
  console.log('  - pay_id:', params.pay_id ? '✅ Présent' : '❌ Manquant');
  console.log('  - websiteid:', params.websiteid ? '✅ Présent' : '❌ Manquant');
  
  if (!params.pay_id || !params.websiteid) {
    console.error('❌ Paramètres manquants:', { 
      pay_id: !!params.pay_id, 
      websiteid: !!params.websiteid
    });
    throw new Error('Paramètres manquants: pay_id, websiteid sont requis');
  }

  const headers = {
    'Authorization': `Basic ${LENGO_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify(params);

  console.log('🌐 Préparation de l\'appel API Lengo Pay pour vérifier le statut:');
  console.log('  - URL:', `${LENGO_API_URL}/api/v2/cashin/transaction`);
  console.log('  - Method: POST');
  console.log('  - Headers:', { 
    'Authorization': LENGO_API_KEY ? 'Basic [HIDDEN]' : '❌ Manquant',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });
  console.log('  - Body:', params);

  try {
    console.log('🌐 Envoi de la requête de vérification à l\'API Lengo Pay...');
    const response = await fetch(`${LENGO_API_URL}/api/v2/cashin/transaction`, {
      method: 'POST',
      headers,
      body,
    });

    console.log('📡 Réponse reçue de l\'API Lengo Pay:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Erreur API Lengo Pay:');
      console.error('  - Status:', response.status);
      console.error('  - Status Text:', response.statusText);
      console.error('  - Response Text:', text);
      throw new Error(`LengoPay API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log('✅ Réponse API Lengo Pay parsée avec succès:', data);
    return data;
  } catch (fetchError) {
    console.error('💥 Erreur lors de l\'appel fetch:', fetchError);
    if (fetchError instanceof Error) {
      console.error('  - Message:', fetchError.message);
      console.error('  - Stack:', fetchError.stack);
    }
    throw fetchError;
  }
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