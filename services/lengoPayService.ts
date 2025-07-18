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

// Configuration directe avec les valeurs fournies
const LENGO_API_URL = 'https://portal.lengopay.com';
const LENGO_SITE_ID = 'ozazlahgzpntmYAG';
const LENGO_API_KEY = 'bDM0WlhpcDRta052MmxIZEFFcEV1Mno0WERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw==';
const LENGO_CALLBACK_URL = process.env.LENGO_CALLBACK_URL || 'https://admin.zalamasas.com/api/payments/lengo-callback';

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
  console.log('  - URL:', `${LENGO_API_URL}/api/v2/cashin/transactions`);
  console.log('  - Method: POST');
  console.log('  - Headers:', { 
    'Authorization': LENGO_API_KEY ? 'Basic [HIDDEN]' : '❌ Manquant',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });
  console.log('  - Body:', params);

  try {
    console.log('🌐 Envoi de la requête de vérification à l\'API Lengo Pay...');
    const response = await fetch(`${LENGO_API_URL}/api/v2/cashin/transactions`, {
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
  console.log('🔄 Début du traitement du callback Lengo Pay:', callbackData);
  
  const { pay_id, status, amount, message, account } = callbackData;
  
  // Mapper le statut Lengo Pay vers notre statut
  let statut;
  switch (status.toUpperCase()) {
    case 'SUCCESS':
    case 'SUCCEEDED':
      statut = 'EFFECTUEE';
      break;
    case 'FAILED':
    case 'FAILURE':
      statut = 'ECHEC';
      break;
    case 'PENDING':
    case 'INITIATED':
      statut = 'EN_ATTENTE';
      break;
    default:
      statut = 'EN_ATTENTE';
      console.warn('⚠️ Statut inconnu de Lengo Pay:', status);
  }
  
  console.log('📊 Mise à jour de la transaction:', {
    pay_id,
    statut_lengo: status,
    statut_mappé: statut,
    amount,
    account
  });

  // Mettre à jour la transaction dans la table transactions
  // ✅ CORRECTION: Ne pas modifier le montant, seulement le statut et autres infos
  const updateData = {
    statut,
    numero_reception: account,
    message_callback: message,
    date_transaction: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('💾 Données de mise à jour:', updateData);

  const { data: transactionData, error: transactionError } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('numero_transaction', pay_id)
    .select()
    .single();

  if (transactionError) {
    console.error('❌ Erreur lors de la mise à jour de la transaction:', transactionError);
    throw new Error('Erreur lors de la mise à jour de la transaction: ' + transactionError.message);
  }

  console.log('✅ Transaction mise à jour avec succès:', transactionData);

  // Si le paiement est réussi et qu'il y a une demande d'avance associée, la mettre à jour
  if (statut === 'EFFECTUEE' && transactionData.demande_avance_id) {
    console.log('🔄 Mise à jour de la demande d\'avance associée:', transactionData.demande_avance_id);
    
    const { error: demandeError } = await supabase
      .from('salary_advance_requests')
      .update({ 
        statut: 'Validé',
        date_validation: new Date().toISOString(),
        numero_reception: pay_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionData.demande_avance_id);

    if (demandeError) {
      console.error('⚠️ Erreur lors de la mise à jour de la demande d\'avance:', demandeError);
      // Ne pas faire échouer le callback pour cette erreur
    } else {
      console.log('✅ Demande d\'avance mise à jour avec succès');
    }
  }

  // Si le paiement est réussi et qu'il y a un employé associé, envoyer une notification
  if (statut === 'EFFECTUEE' && transactionData.employe_id) {
    console.log('📱 Envoi de notification SMS à l\'employé:', transactionData.employe_id);
    
    try {
      // Récupérer les informations de l'employé
      const { data: employeData } = await supabase
        .from('employees')
        .select('nom, prenom, telephone')
        .eq('id', transactionData.employe_id)
        .single();

      if (employeData && employeData.telephone) {
        const message = `Félicitations ${employeData.prenom} ! Votre avance de salaire de ${amount} GNF a été traitée avec succès. Transaction: ${pay_id}`;
        
        // Importer le service SMS
        const smsService = (await import('./smsService')).default;
        await smsService.sendSMS({
          to: [employeData.telephone],
          message: message
        });
        
        console.log('✅ SMS de confirmation envoyé à l\'employé');
      }
    } catch (smsError) {
      console.error('⚠️ Erreur lors de l\'envoi du SMS de confirmation:', smsError);
      // Ne pas faire échouer le callback pour cette erreur
    }
  }

  console.log('🎉 Callback Lengo Pay traité avec succès');
  return transactionData;
} 