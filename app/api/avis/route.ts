import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Clés directes pour éviter les erreurs d'API key
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.QWaVPwIjJAJGr7fJfg8MMBUGyfTG0VoSP5cQzrZJQQU';

console.log('🔧 Configuration Supabase pour avis:', {
  url: supabaseUrl,
  keyPrefix: supabaseServiceKey.substring(0, 20) + '...'
});

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET - Récupérer tous les avis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');
    const employeeId = searchParams.get('employee_id');
    const searchTerm = searchParams.get('search');

    let query = supabase
      .from('avis')
      .select(`
        *,
        employee:employees(id, nom, prenom, email, poste),
        partner:partners(id, nom, type)
      `)
      .order('created_at', { ascending: false });

    // Filtres
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (searchTerm) {
      query = query.or(`commentaire.ilike.%${searchTerm}%,employee.nom.ilike.%${searchTerm}%,employee.prenom.ilike.%${searchTerm}%,partner.nom.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des avis' },
        { status: 500 }
      );
    }

    return NextResponse.json({ avis: data || [] });
  } catch (error) {
    console.error('Erreur API avis GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel avis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, partner_id, note, commentaire, type_retour } = body;

    // Validation des données
    if (!note || note < 1 || note > 5) {
      return NextResponse.json(
        { error: 'La note doit être comprise entre 1 et 5' },
        { status: 400 }
      );
    }

    const avisData = {
      employee_id,
      partner_id,
      note,
      commentaire,
      type_retour,
      date_avis: new Date().toISOString(),
      approuve: false // Par défaut, les avis ne sont pas approuvés
    };

    const { data, error } = await supabase
      .from('avis')
      .insert([avisData])
      .select(`
        *,
        employee:employees(id, nom, prenom, email, poste),
        partner:partners(id, nom, type)
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'avis' },
        { status: 500 }
      );
    }

    return NextResponse.json({ avis: data }, { status: 201 });
  } catch (error) {
    console.error('Erreur API avis POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 