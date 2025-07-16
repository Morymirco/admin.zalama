import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration Lengo Pay
const LENGO_API_URL = (process.env.LENGO_API_URL || 'https://portal.lengopay.com').replace(/\/$/, '');
const LENGO_API_KEY = process.env.LENGO_API_KEY || 'bDM0WlhpcDRta052MmxIZEFFcEV1Mno0WERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw==';
const LENGO_WEBSITE_ID = process.env.LENGO_SITE_ID || 'ozazlahgzpntmYAG';

// Clés API pour l'authentification externe
const EXTERNAL_API_KEYS = {
  'partner-dashboard-1': 'zalama_partner_key_2024_secure_1',
  'partner-dashboard-2': 'zalama_partner_key_2024_secure_2',
  // Ajouter d'autres clés selon les besoins
};

// URLs de callback selon l'environnement
const getCallbackUrls = (partnerId: string) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://admin.zalamasas.com' 
    : 'http://localhost:3000';
  
  return {
    callback_url: `${baseUrl}/api/payments/lengo-external-callback`,
    return_url: `${baseUrl}/dashboard/partners/remboursements?status=success&partner=${partnerId}`
  };
};

// Interface pour les données de remboursement de transaction
interface TransactionReimbursement {
  transaction_id: string;
  description?: string;
}

// Interface pour les données de remboursement en masse de transactions
interface BulkTransactionReimbursementRequest {
  partner_id: string;
  currency?: string;
  reference?: string;
  description?: string;
  transactions: TransactionReimbursement[];
  metadata?: Record<string, unknown>;
}

// Interface pour les données de remboursement individuel de transaction
interface SingleTransactionReimbursementRequest {
  partner_id: string;
  transaction_id: string;
  currency?: string;
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

// Interface pour les données de remboursement libre (ancien format)
interface FreeReimbursementRequest {
  partner_id: string;
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  employee_id?: string;
  metadata?: Record<string, unknown>;
}

// POST /api/payments/lengo-external - Remboursement externe sécurisé (transactions ou libre)
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🌐 [${timestamp}] [${requestId}] REMBOURSEMENT EXTERNE LENGO PAY`);
  
  try {
    // 1. Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!apiKey || !Object.values(EXTERNAL_API_KEYS).includes(apiKey)) {
      console.log(`❌ [${requestId}] Authentification échouée`);
      return NextResponse.json(
        { error: 'Clé API invalide ou manquante' },
        { status: 401 }
      );
    }

    // 2. Vérification de l'origine (CORS)
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://partner.zalama.com',
      'https://dashboard.zalama.com',
      // Ajouter d'autres domaines partenaires autorisés
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      console.log(`❌ [${requestId}] Origine non autorisée:`, origin);
      return NextResponse.json(
        { error: 'Origine non autorisée' },
        { status: 403 }
      );
    }

    // 3. Parsing et validation des données
    const body = await request.json();
    
    // Détecter le type de remboursement
    if (body.transactions && Array.isArray(body.transactions)) {
      // Remboursement en masse de transactions
      return await handleBulkTransactionReimbursement(body as BulkTransactionReimbursementRequest, requestId, timestamp);
    } else if (body.transaction_id) {
      // Remboursement d'une transaction spécifique
      return await handleSingleTransactionReimbursement(body as SingleTransactionReimbursementRequest, requestId, timestamp);
    } else if (body.amount) {
      // Remboursement libre (ancien format)
      return await handleFreeReimbursement(body as FreeReimbursementRequest, requestId, timestamp);
    } else {
      return NextResponse.json(
        { error: 'Format de données invalide. Spécifiez transaction_id, transactions[] ou amount' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erreur serveur:`, error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// Gestion du remboursement d'une transaction spécifique
async function handleSingleTransactionReimbursement(
  body: SingleTransactionReimbursementRequest, 
  requestId: string, 
  timestamp: string
) {
  const { partner_id, transaction_id, currency = 'GNF', description, reference, metadata } = body;

  // Validation des données requises
  if (!partner_id) {
    return NextResponse.json(
      { error: 'partner_id requis' },
      { status: 400 }
    );
  }

  if (!transaction_id) {
    return NextResponse.json(
      { error: 'transaction_id requis' },
      { status: 400 }
    );
  }

  // 4. Vérification du partenaire en base
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('id, nom, email, telephone, actif')
    .eq('id', partner_id)
    .single();

  if (partnerError || !partner) {
    console.log(`❌ [${requestId}] Partenaire non trouvé:`, partner_id);
    return NextResponse.json(
      { error: 'Partenaire non trouvé ou invalide' },
      { status: 404 }
    );
  }

  if (!partner.actif) {
    console.log(`❌ [${requestId}] Partenaire inactif:`, partner_id);
    return NextResponse.json(
      { error: 'Partenaire inactif' },
      { status: 403 }
    );
  }

  console.log(`✅ [${requestId}] Partenaire validé:`, {
    id: partner.id,
    nom: partner.nom,
    email: partner.email
  });

  // 5. Vérification de la transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select(`
      *,
      employe:employees(id, nom, prenom, email, telephone, partner_id),
      demande:demandes_avance_salaire(id, motif, montant_demande, frais_service)
    `)
    .eq('id', transaction_id)
    .eq('entreprise_id', partner_id)
    .eq('statut', 'EFFECTUEE')
    .single();

  if (transactionError || !transaction) {
    console.log(`❌ [${requestId}] Transaction non trouvée ou invalide:`, transaction_id);
    return NextResponse.json(
      { error: 'Transaction non trouvée, n\'appartient pas au partenaire ou non effectuée' },
      { status: 404 }
    );
  }

  // 6. Vérifier si un remboursement existe déjà pour cette transaction
  const { data: existingReimbursement, error: reimbursementError } = await supabase
    .from('remboursements')
    .select('id, statut')
    .eq('transaction_id', transaction_id)
    .single();

  if (existingReimbursement) {
    console.log(`❌ [${requestId}] Remboursement déjà existant pour cette transaction:`, transaction_id);
    return NextResponse.json(
      { error: 'Un remboursement existe déjà pour cette transaction' },
      { status: 409 }
    );
  }

  console.log(`✅ [${requestId}] Transaction validée:`, {
    id: transaction.id,
    employe: `${transaction.employe.nom} ${transaction.employe.prenom}`,
    montant: transaction.montant,
    numero_transaction: transaction.numero_transaction
  });

  // 7. Calculer le montant total à rembourser
  const fraisService = transaction.demande?.frais_service || 0;
  const montantTotal = transaction.montant + fraisService;

  console.log(`💰 [${requestId}] Calcul montant remboursement:`, {
    montant_transaction: transaction.montant,
    frais_service: fraisService,
    montant_total: montantTotal
  });

  // 8. Créer le remboursement de transaction
  return await createTransactionReimbursement({
    partner,
    transaction,
    amount: montantTotal,
    currency,
    description: description || `Remboursement transaction ${transaction.numero_transaction}`,
    reference: reference || `TXN-${transaction.numero_transaction}`,
    metadata,
    requestId,
    timestamp
  });
}

// Gestion du remboursement en masse de transactions
async function handleBulkTransactionReimbursement(
  body: BulkTransactionReimbursementRequest, 
  requestId: string, 
  timestamp: string
) {
  const { partner_id, currency = 'GNF', description, reference, transactions, metadata } = body;

  // Validation des données requises
  if (!partner_id) {
    return NextResponse.json(
      { error: 'partner_id requis' },
      { status: 400 }
    );
  }

  if (!transactions || transactions.length === 0) {
    return NextResponse.json(
      { error: 'Liste des transactions requise et non vide' },
      { status: 400 }
    );
  }

  // 4. Vérification du partenaire en base
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('id, nom, email, telephone, actif')
    .eq('id', partner_id)
    .single();

  if (partnerError || !partner) {
    console.log(`❌ [${requestId}] Partenaire non trouvé:`, partner_id);
    return NextResponse.json(
      { error: 'Partenaire non trouvé ou invalide' },
      { status: 404 }
    );
  }

  if (!partner.actif) {
    console.log(`❌ [${requestId}] Partenaire inactif:`, partner_id);
    return NextResponse.json(
      { error: 'Partenaire inactif' },
      { status: 403 }
    );
  }

  console.log(`✅ [${requestId}] Partenaire validé pour remboursement en masse:`, {
    id: partner.id,
    nom: partner.nom,
    email: partner.email,
    nombre_transactions: transactions.length
  });

  // 5. Vérification de toutes les transactions
  const transactionIds = transactions.map(t => t.transaction_id);
  const { data: allTransactions, error: transactionsError } = await supabase
    .from('transactions')
    .select(`
      *,
      employe:employees(id, nom, prenom, email, telephone, partner_id),
      demande:demandes_avance_salaire(id, motif, montant_demande, frais_service)
    `)
    .eq('entreprise_id', partner_id)
    .eq('statut', 'EFFECTUEE')
    .in('id', transactionIds);

  if (transactionsError) {
    console.log(`❌ [${requestId}] Erreur récupération transactions:`, transactionsError);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transactions' },
      { status: 500 }
    );
  }

  if (!allTransactions || allTransactions.length !== transactions.length) {
    console.log(`❌ [${requestId}] Certaines transactions n'appartiennent pas au partenaire ou ne sont pas effectuées`);
    return NextResponse.json(
      { error: 'Certaines transactions n\'appartiennent pas au partenaire ou ne sont pas effectuées' },
      { status: 404 }
    );
  }

  // 6. Vérifier qu'aucune transaction n'a déjà un remboursement
  const { data: existingReimbursements, error: reimbursementError } = await supabase
    .from('remboursements')
    .select('transaction_id')
    .in('transaction_id', transactionIds);

  if (existingReimbursements && existingReimbursements.length > 0) {
    const existingIds = existingReimbursements.map(r => r.transaction_id);
    console.log(`❌ [${requestId}] Certaines transactions ont déjà un remboursement:`, existingIds);
    return NextResponse.json(
      { error: `Certaines transactions ont déjà un remboursement: ${existingIds.join(', ')}` },
      { status: 409 }
    );
  }

  console.log(`✅ [${requestId}] Toutes les transactions validées:`, allTransactions.length);

  // 7. Calculer le montant total
  const totalAmount = allTransactions.reduce((sum, txn) => {
    const fraisService = txn.demande?.frais_service || 0;
    return sum + txn.montant + fraisService;
  }, 0);

  console.log(`💰 [${requestId}] Montant total du remboursement en masse:`, totalAmount);

  // 8. Créer le remboursement en masse
  return await createBulkTransactionReimbursement({
    partner,
    transactions: allTransactions,
    transactionReimbursements: transactions,
    amount: totalAmount,
    currency,
    description: description || `Remboursement en masse partenaire ${partner.nom} (${transactions.length} transactions)`,
    reference: reference || `BULK-TXN-${Date.now()}`,
    metadata,
    requestId,
    timestamp
  });
}

// Gestion du remboursement libre (ancien format)
async function handleFreeReimbursement(
  body: FreeReimbursementRequest, 
  requestId: string, 
  timestamp: string
) {
  const { partner_id, amount, currency = 'GNF', description, reference, employee_id, metadata } = body;

  // Validation des données requises
  if (!partner_id) {
    return NextResponse.json(
      { error: 'partner_id requis' },
      { status: 400 }
    );
  }

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: 'Montant invalide (doit être > 0)' },
      { status: 400 }
    );
  }

  // 4. Vérification du partenaire en base
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('id, nom, email, telephone, actif')
    .eq('id', partner_id)
    .single();

  if (partnerError || !partner) {
    console.log(`❌ [${requestId}] Partenaire non trouvé:`, partner_id);
    return NextResponse.json(
      { error: 'Partenaire non trouvé ou invalide' },
      { status: 404 }
    );
  }

  if (!partner.actif) {
    console.log(`❌ [${requestId}] Partenaire inactif:`, partner_id);
    return NextResponse.json(
      { error: 'Partenaire inactif' },
      { status: 403 }
    );
  }

  console.log(`✅ [${requestId}] Partenaire validé:`, {
    id: partner.id,
    nom: partner.nom,
    email: partner.email
  });

  // 5. Vérification de l'employé si fourni
  let employee = null;
  if (employee_id) {
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('id, nom, prenom, email, telephone')
      .eq('id', employee_id)
      .eq('partner_id', partner_id)
      .single();

    if (empError || !emp) {
      console.log(`❌ [${requestId}] Employé non trouvé ou n'appartient pas au partenaire:`, employee_id);
      return NextResponse.json(
        { error: 'Employé non trouvé ou n\'appartient pas au partenaire' },
        { status: 404 }
      );
    }
    employee = emp;
    console.log(`✅ [${requestId}] Employé validé:`, {
      id: employee.id,
      nom: employee.nom,
      prenom: employee.prenom
    });
  }

  // 6. Créer le remboursement libre
  return await createFreeReimbursement({
    partner,
    employee,
    amount,
    currency,
    description: description || `Remboursement libre partenaire ${partner.nom}`,
    reference: reference || `FREE-${Date.now()}`,
    metadata,
    requestId,
    timestamp
  });
}

// Fonction commune pour créer un remboursement de transaction
async function createTransactionReimbursement({
  partner,
  transaction,
  amount,
  currency,
  description,
  reference,
  metadata,
  requestId,
  timestamp
}: {
  partner: any;
  transaction: any;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  metadata?: Record<string, unknown>;
  requestId: string;
  timestamp: string;
}) {

  // 6. Préparation du payload Lengo Pay
  const { callback_url, return_url } = getCallbackUrls(partner.id);
  
  const lengoPayload = {
    websiteid: LENGO_WEBSITE_ID,
    amount: Math.round(amount),
    currency: currency,
    return_url: return_url,
    callback_url: callback_url
  };

  console.log(`📤 [${requestId}] Données envoyées à Lengo Pay:`, lengoPayload);

  // 7. Appel à l'API Lengo Pay
  const apiUrl = `${LENGO_API_URL}/api/v1/payments`;
  console.log(`🌐 [${requestId}] URL complète de l'API:`, apiUrl);
  
  const lengoResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${LENGO_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lengoPayload)
  });

  console.log(`📥 [${requestId}] Réponse Lengo Pay:`, {
    status: lengoResponse.status,
    statusText: lengoResponse.statusText,
    contentType: lengoResponse.headers.get('content-type')
  });

  // 8. Vérification du type de contenu de la réponse
  const contentType = lengoResponse.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await lengoResponse.text();
    console.error(`❌ [${requestId}] Réponse non-JSON de Lengo Pay:`, {
      status: lengoResponse.status,
      contentType,
      responseText: responseText.substring(0, 500)
    });
    
    return NextResponse.json(
      { error: `Erreur API Lengo Pay: Réponse non-JSON (${lengoResponse.status})` },
      { status: 500 }
    );
  }

  // 9. Parsing de la réponse JSON
  let lengoResult;
  try {
    lengoResult = await lengoResponse.json();
  } catch (parseError) {
    console.error(`❌ [${requestId}] Erreur parsing JSON Lengo Pay:`, parseError);
    return NextResponse.json(
      { error: 'Erreur parsing réponse Lengo Pay' },
      { status: 500 }
    );
  }

  if (!lengoResponse.ok) {
    console.error(`❌ [${requestId}] Erreur API Lengo Pay:`, {
      status: lengoResponse.status,
      statusText: lengoResponse.statusText,
      result: lengoResult
    });
    return NextResponse.json(
      { error: `Erreur Lengo Pay: ${lengoResult.message || lengoResult.error || 'Erreur inconnue'}` },
      { status: lengoResponse.status }
    );
  }

  // 10. Création du remboursement en base
  const fraisService = transaction.demande?.frais_service || 0;
  const remboursementData = {
    transaction_id: transaction.id,
    demande_avance_id: transaction.demande_avance_id,
    employe_id: transaction.employe_id,
    partenaire_id: partner.id,
    montant_transaction: transaction.montant,
    frais_service: fraisService,
    montant_total_remboursement: amount,
    methode_remboursement: 'MOBILE_MONEY',
    date_transaction_effectuee: transaction.date_transaction,
    date_limite_remboursement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
    numero_transaction_remboursement: lengoResult.pay_id,
    reference_paiement: reference,
    statut: 'EN_ATTENTE',
    commentaire_partenaire: description,
    metadata: {
      ...metadata,
      type: 'transaction_reimbursement',
      numero_transaction_original: transaction.numero_transaction
    },
    created_at: new Date().toISOString()
  };

  const { data: remboursement, error: remboursementError } = await supabase
    .from('remboursements')
    .insert([remboursementData])
    .select()
    .single();

  if (remboursementError) {
    console.error(`❌ [${requestId}] Erreur création remboursement:`, remboursementError);
    return NextResponse.json(
      { error: 'Erreur lors de la création du remboursement' },
      { status: 500 }
    );
  }

  console.log(`✅ [${requestId}] Remboursement créé:`, remboursement.id);

  // 11. Réponse de succès
  console.log(`✅ [${requestId}] Remboursement transaction Lengo Pay initié avec succès:`, {
    pay_id: lengoResult.pay_id,
    payment_url: lengoResult.payment_url
  });

  return NextResponse.json({
    success: true,
    message: 'Remboursement transaction Lengo Pay initié avec succès',
    data: {
      remboursement_id: remboursement.id,
      pay_id: lengoResult.pay_id,
      payment_url: lengoResult.payment_url,
      amount: lengoPayload.amount,
      currency: lengoPayload.currency,
      partner: {
        id: partner.id,
        nom: partner.nom
      },
      transaction: {
        id: transaction.id,
        numero_transaction: transaction.numero_transaction,
        montant: transaction.montant,
        date_transaction: transaction.date_transaction
      },
      employe: {
        id: transaction.employe.id,
        nom: transaction.employe.nom,
        prenom: transaction.employe.prenom
      },
      demande: {
        id: transaction.demande_avance_id,
        motif: transaction.demande?.motif
      },
      reference: remboursementData.reference_paiement,
      type: 'transaction_reimbursement',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    },
    request_id: requestId,
    timestamp
  });
}

// Fonction pour créer un remboursement en masse de transactions
async function createBulkTransactionReimbursement({
  partner,
  transactions,
  transactionReimbursements,
  amount,
  currency,
  description,
  reference,
  metadata,
  requestId,
  timestamp
}: {
  partner: any;
  transactions: any[];
  transactionReimbursements: TransactionReimbursement[];
  amount: number;
  currency: string;
  description: string;
  reference: string;
  metadata?: Record<string, unknown>;
  requestId: string;
  timestamp: string;
}) {

  // 6. Préparation du payload Lengo Pay
  const { callback_url, return_url } = getCallbackUrls(partner.id);
  
  const lengoPayload = {
    websiteid: LENGO_WEBSITE_ID,
    amount: Math.round(amount),
    currency: currency,
    return_url: return_url,
    callback_url: callback_url
  };

  console.log(`📤 [${requestId}] Données envoyées à Lengo Pay:`, lengoPayload);

  // 7. Appel à l'API Lengo Pay
  const apiUrl = `${LENGO_API_URL}/api/v1/payments`;
  console.log(`🌐 [${requestId}] URL complète de l'API:`, apiUrl);
  
  const lengoResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${LENGO_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lengoPayload)
  });

  console.log(`📥 [${requestId}] Réponse Lengo Pay:`, {
    status: lengoResponse.status,
    statusText: lengoResponse.statusText,
    contentType: lengoResponse.headers.get('content-type')
  });

  // 8. Vérification du type de contenu de la réponse
  const contentType = lengoResponse.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await lengoResponse.text();
    console.error(`❌ [${requestId}] Réponse non-JSON de Lengo Pay:`, {
      status: lengoResponse.status,
      contentType,
      responseText: responseText.substring(0, 500)
    });
    
    return NextResponse.json(
      { error: `Erreur API Lengo Pay: Réponse non-JSON (${lengoResponse.status})` },
      { status: 500 }
    );
  }

  // 9. Parsing de la réponse JSON
  let lengoResult;
  try {
    lengoResult = await lengoResponse.json();
  } catch (parseError) {
    console.error(`❌ [${requestId}] Erreur parsing JSON Lengo Pay:`, parseError);
    return NextResponse.json(
      { error: 'Erreur parsing réponse Lengo Pay' },
      { status: 500 }
    );
  }

  if (!lengoResponse.ok) {
    console.error(`❌ [${requestId}] Erreur API Lengo Pay:`, {
      status: lengoResponse.status,
      statusText: lengoResponse.statusText,
      result: lengoResult
    });
    return NextResponse.json(
      { error: `Erreur Lengo Pay: ${lengoResult.message || lengoResult.error || 'Erreur inconnue'}` },
      { status: lengoResponse.status }
    );
  }

  // 10. Création des remboursements en base
  const remboursementsData = transactions.map(txn => {
    const fraisService = txn.demande?.frais_service || 0;
    const montantTotal = txn.montant + fraisService;
    
    return {
      transaction_id: txn.id,
      demande_avance_id: txn.demande_avance_id,
      employe_id: txn.employe_id,
      partenaire_id: partner.id,
      montant_transaction: txn.montant,
      frais_service: fraisService,
      montant_total_remboursement: montantTotal,
      methode_remboursement: 'MOBILE_MONEY',
      date_transaction_effectuee: txn.date_transaction,
      date_limite_remboursement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
      numero_transaction_remboursement: lengoResult.pay_id,
      reference_paiement: `${reference}-${txn.numero_transaction}`,
      statut: 'EN_ATTENTE',
      commentaire_partenaire: description,
      metadata: {
        ...metadata,
        type: 'bulk_transaction_reimbursement',
        numero_transaction_original: txn.numero_transaction,
        bulk_reference: reference
      },
      created_at: new Date().toISOString()
    };
  });

  const { data: remboursements, error: remboursementsError } = await supabase
    .from('remboursements')
    .insert(remboursementsData)
    .select();

  if (remboursementsError) {
    console.error(`❌ [${requestId}] Erreur création remboursements:`, remboursementsError);
    return NextResponse.json(
      { error: 'Erreur lors de la création des remboursements' },
      { status: 500 }
    );
  }

  console.log(`✅ [${requestId}] Remboursements créés:`, remboursements.length);

  // 11. Réponse de succès
  console.log(`✅ [${requestId}] Remboursement en masse transactions Lengo Pay initié avec succès:`, {
    pay_id: lengoResult.pay_id,
    payment_url: lengoResult.payment_url,
    nombre_remboursements: remboursements.length
  });

  return NextResponse.json({
    success: true,
    message: 'Remboursement en masse transactions Lengo Pay initié avec succès',
    data: {
      remboursements_ids: remboursements.map(r => r.id),
      pay_id: lengoResult.pay_id,
      payment_url: lengoResult.payment_url,
      amount: lengoPayload.amount,
      currency: lengoPayload.currency,
      partner: {
        id: partner.id,
        nom: partner.nom
      },
      transactions: transactions.map(txn => ({
        id: txn.id,
        numero_transaction: txn.numero_transaction,
        montant: txn.montant,
        employe: {
          id: txn.employe.id,
          nom: txn.employe.nom,
          prenom: txn.employe.prenom
        }
      })),
      transaction_reimbursements: transactionReimbursements,
      reference: reference,
      type: 'bulk_transaction_reimbursement',
      nombre_remboursements: remboursements.length,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    },
    request_id: requestId,
    timestamp
  });
}

// Fonction pour créer un remboursement libre
async function createFreeReimbursement({
  partner,
  employee,
  amount,
  currency,
  description,
  reference,
  metadata,
  requestId,
  timestamp
}: {
  partner: any;
  employee?: any;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  metadata?: Record<string, unknown>;
  requestId: string;
  timestamp: string;
}) {

  // 6. Préparation du payload Lengo Pay
  const { callback_url, return_url } = getCallbackUrls(partner.id);
  
  const lengoPayload = {
    websiteid: LENGO_WEBSITE_ID,
    amount: Math.round(amount),
    currency: currency,
    return_url: return_url,
    callback_url: callback_url
  };

  console.log(`📤 [${requestId}] Données envoyées à Lengo Pay:`, lengoPayload);

  // 7. Appel à l'API Lengo Pay
  const apiUrl = `${LENGO_API_URL}/api/v1/payments`;
  console.log(`🌐 [${requestId}] URL complète de l'API:`, apiUrl);
  
  const lengoResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${LENGO_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lengoPayload)
  });

  console.log(`📥 [${requestId}] Réponse Lengo Pay:`, {
    status: lengoResponse.status,
    statusText: lengoResponse.statusText,
    contentType: lengoResponse.headers.get('content-type')
  });

  // 8. Vérification du type de contenu de la réponse
  const contentType = lengoResponse.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await lengoResponse.text();
    console.error(`❌ [${requestId}] Réponse non-JSON de Lengo Pay:`, {
      status: lengoResponse.status,
      contentType,
      responseText: responseText.substring(0, 500)
    });
    
    return NextResponse.json(
      { error: `Erreur API Lengo Pay: Réponse non-JSON (${lengoResponse.status})` },
      { status: 500 }
    );
  }

  // 9. Parsing de la réponse JSON
  let lengoResult;
  try {
    lengoResult = await lengoResponse.json();
  } catch (parseError) {
    console.error(`❌ [${requestId}] Erreur parsing JSON Lengo Pay:`, parseError);
    return NextResponse.json(
      { error: 'Erreur parsing réponse Lengo Pay' },
      { status: 500 }
    );
  }

  if (!lengoResponse.ok) {
    console.error(`❌ [${requestId}] Erreur API Lengo Pay:`, {
      status: lengoResponse.status,
      statusText: lengoResponse.statusText,
      result: lengoResult
    });
    return NextResponse.json(
      { error: `Erreur Lengo Pay: ${lengoResult.message || lengoResult.error || 'Erreur inconnue'}` },
      { status: lengoResponse.status }
    );
  }

  // 10. Création du remboursement libre en base
  const remboursementData = {
    partenaire_id: partner.id,
    employe_id: employee?.id || null,
    montant_total_remboursement: amount,
    montant_transaction: amount,
    frais_service: 0, // Pas de frais pour les remboursements libres
    methode_remboursement: 'MOBILE_MONEY',
    numero_transaction_remboursement: lengoResult.pay_id,
    reference_paiement: reference,
    statut: 'EN_ATTENTE',
    commentaire_partenaire: description,
    metadata: {
      ...metadata,
      type: 'free_reimbursement'
    },
    created_at: new Date().toISOString()
  };

  const { data: remboursement, error: remboursementError } = await supabase
    .from('remboursements')
    .insert([remboursementData])
    .select()
    .single();

  if (remboursementError) {
    console.error(`❌ [${requestId}] Erreur création remboursement:`, remboursementError);
    return NextResponse.json(
      { error: 'Erreur lors de la création du remboursement' },
      { status: 500 }
    );
  }

  console.log(`✅ [${requestId}] Remboursement créé:`, remboursement.id);

  // 11. Réponse de succès
  console.log(`✅ [${requestId}] Remboursement libre Lengo Pay initié avec succès:`, {
    pay_id: lengoResult.pay_id,
    payment_url: lengoResult.payment_url
  });

  return NextResponse.json({
    success: true,
    message: 'Remboursement libre Lengo Pay initié avec succès',
    data: {
      remboursement_id: remboursement.id,
      pay_id: lengoResult.pay_id,
      payment_url: lengoResult.payment_url,
      amount: lengoPayload.amount,
      currency: lengoPayload.currency,
      partner: {
        id: partner.id,
        nom: partner.nom
      },
      employee: employee ? {
        id: employee.id,
        nom: employee.nom,
        prenom: employee.prenom
      } : null,
      reference: remboursementData.reference_paiement,
      type: 'free_reimbursement',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    },
    request_id: requestId,
    timestamp
  });
}

// GET /api/payments/lengo-external - Vérification de l'API
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API de remboursement externe Lengo Pay disponible',
    version: '2.0.0',
    endpoints: {
      remboursement: 'POST /api/payments/lengo-external',
      callback: 'POST /api/payments/lengo-external-callback',
      status: 'GET /api/payments/lengo-external/status/{remboursement_id}'
    },
    features: {
      remboursement_transaction: 'Remboursement d\'une transaction spécifique',
      remboursement_transactions_masse: 'Remboursement de plusieurs transactions en une fois',
      remboursement_libre: 'Remboursement libre (montant personnalisé)'
    },
    authentication: 'Bearer Token required',
    documentation: 'Contactez l\'équipe ZaLaMa pour obtenir votre clé API'
  });
} 