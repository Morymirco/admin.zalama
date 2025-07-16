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

// Interface pour les données de remboursement individuel
interface EmployeeReimbursement {
  employee_id: string;
  amount: number;
  description?: string;
}

// Interface pour les données de remboursement en masse
interface BulkReimbursementRequest {
  partner_id: string;
  currency?: string;
  reference?: string;
  description?: string;
  employees: EmployeeReimbursement[];
  metadata?: Record<string, unknown>;
}

// Interface pour les données de remboursement individuel
interface SingleReimbursementRequest {
  partner_id: string;
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  employee_id?: string;
  metadata?: Record<string, unknown>;
}

// POST /api/payments/lengo-external - Remboursement externe sécurisé (individuel ou en masse)
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
    
    // Détecter si c'est un remboursement en masse ou individuel
    const isBulkReimbursement = body.employees && Array.isArray(body.employees);
    
    if (isBulkReimbursement) {
      return await handleBulkReimbursement(body as BulkReimbursementRequest, requestId, timestamp);
    } else {
      return await handleSingleReimbursement(body as SingleReimbursementRequest, requestId, timestamp);
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erreur serveur:`, error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// Gestion du remboursement individuel
async function handleSingleReimbursement(
  body: SingleReimbursementRequest, 
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

  // 6. Créer le remboursement individuel
  return await createReimbursement({
    partner,
    employee,
    amount,
    currency,
    description: description || `Remboursement externe partenaire ${partner.nom}`,
    reference: reference || `EXT-${Date.now()}`,
    metadata,
    requestId,
    timestamp
  });
}

// Gestion du remboursement en masse
async function handleBulkReimbursement(
  body: BulkReimbursementRequest, 
  requestId: string, 
  timestamp: string
) {
  const { partner_id, currency = 'GNF', description, reference, employees, metadata } = body;

  // Validation des données requises
  if (!partner_id) {
    return NextResponse.json(
      { error: 'partner_id requis' },
      { status: 400 }
    );
  }

  if (!employees || employees.length === 0) {
    return NextResponse.json(
      { error: 'Liste des employés requise et non vide' },
      { status: 400 }
    );
  }

  // Validation des montants
  for (const emp of employees) {
    if (!emp.amount || emp.amount <= 0) {
      return NextResponse.json(
        { error: `Montant invalide pour l'employé ${emp.employee_id} (doit être > 0)` },
        { status: 400 }
      );
    }
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
    nombre_employes: employees.length
  });

  // 5. Vérification de tous les employés
  const employeeIds = employees.map(emp => emp.employee_id);
  const { data: allEmployees, error: employeesError } = await supabase
    .from('employees')
    .select('id, nom, prenom, email, telephone')
    .eq('partner_id', partner_id)
    .in('id', employeeIds);

  if (employeesError) {
    console.log(`❌ [${requestId}] Erreur récupération employés:`, employeesError);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des employés' },
      { status: 500 }
    );
  }

  if (!allEmployees || allEmployees.length !== employees.length) {
    console.log(`❌ [${requestId}] Certains employés n'appartiennent pas au partenaire`);
    return NextResponse.json(
      { error: 'Certains employés n\'appartiennent pas au partenaire' },
      { status: 404 }
    );
  }

  console.log(`✅ [${requestId}] Tous les employés validés:`, allEmployees.length);

  // 6. Calculer le montant total
  const totalAmount = employees.reduce((sum, emp) => sum + emp.amount, 0);
  console.log(`💰 [${requestId}] Montant total du remboursement en masse:`, totalAmount);

  // 7. Créer le remboursement en masse
  return await createReimbursement({
    partner,
    employees: allEmployees,
    employeeReimbursements: employees,
    amount: totalAmount,
    currency,
    description: description || `Remboursement en masse partenaire ${partner.nom} (${employees.length} employés)`,
    reference: reference || `BULK-EXT-${Date.now()}`,
    metadata,
    requestId,
    timestamp,
    isBulk: true
  });
}

// Fonction commune pour créer un remboursement
async function createReimbursement({
  partner,
  employee = null,
  employees = null,
  employeeReimbursements = null,
  amount,
  currency,
  description,
  reference,
  metadata,
  requestId,
  timestamp,
  isBulk = false
}: {
  partner: any;
  employee?: any;
  employees?: any[];
  employeeReimbursements?: EmployeeReimbursement[];
  amount: number;
  currency: string;
  description: string;
  reference: string;
  metadata?: Record<string, unknown>;
  requestId: string;
  timestamp: string;
  isBulk?: boolean;
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
  const remboursementData = {
    partenaire_id: partner.id,
    employe_id: employee?.id || null,
    montant_total_remboursement: amount,
    montant_transaction: amount,
    frais_service: 0, // Pas de frais pour les remboursements externes
    methode_remboursement: 'MOBILE_MONEY',
    numero_transaction_remboursement: lengoResult.pay_id,
    reference_paiement: reference,
    statut: 'EN_ATTENTE',
    commentaire_partenaire: description,
    metadata: {
      ...metadata,
      is_bulk: isBulk,
      employee_count: employees?.length || 1,
      employee_details: isBulk ? employeeReimbursements : null
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
  console.log(`✅ [${requestId}] Remboursement Lengo Pay initié avec succès:`, {
    pay_id: lengoResult.pay_id,
    payment_url: lengoResult.payment_url,
    is_bulk: isBulk
  });

  return NextResponse.json({
    success: true,
    message: isBulk ? 'Remboursement en masse Lengo Pay initié avec succès' : 'Remboursement Lengo Pay initié avec succès',
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
      employees: employees ? employees.map(emp => ({
        id: emp.id,
        nom: emp.nom,
        prenom: emp.prenom
      })) : null,
      employee_reimbursements: employeeReimbursements,
      reference: remboursementData.reference_paiement,
      is_bulk: isBulk,
      employee_count: employees?.length || 1,
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
    version: '1.0.0',
    endpoints: {
      remboursement: 'POST /api/payments/lengo-external',
      callback: 'POST /api/payments/lengo-external-callback',
      status: 'GET /api/payments/lengo-external/status/{remboursement_id}'
    },
    features: {
      remboursement_individuel: 'Remboursement d\'un employé spécifique',
      remboursement_en_masse: 'Remboursement de tous les employés en une fois'
    },
    authentication: 'Bearer Token required',
    documentation: 'Contactez l\'équipe ZaLaMa pour obtenir votre clé API'
  });
} 