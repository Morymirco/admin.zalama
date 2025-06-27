import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log('🧪 Test de connexion à la base de données...');

    // Test 1: Vérifier la connexion
    const { data: testData, error: testError } = await supabase
      .from('partners')
      .select('count')
      .limit(1);

    if (testError) {
      return NextResponse.json(
        { success: false, error: `Erreur de connexion: ${testError.message}` },
        { status: 500 }
      );
    }

    // Test 2: Vérifier la table partners
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(5);

    if (partnersError) {
      return NextResponse.json(
        { success: false, error: `Erreur table partners: ${partnersError.message}` },
        { status: 500 }
      );
    }

    // Test 3: Vérifier la table employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, nom, prenom, partner_id')
      .limit(5);

    if (employeesError) {
      return NextResponse.json(
        { success: false, error: `Erreur table employees: ${employeesError.message}` },
        { status: 500 }
      );
    }

    // Test 4: Vérifier la structure de la table employees
    const { data: employeeStructure, error: structureError } = await supabase
      .from('employees')
      .select('*')
      .limit(0);

    if (structureError) {
      return NextResponse.json(
        { success: false, error: `Erreur structure employees: ${structureError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tests de base de données réussis',
      results: {
        connection: '✅ Connexion réussie',
        partners: {
          count: partners?.length || 0,
          sample: partners?.slice(0, 3) || []
        },
        employees: {
          count: employees?.length || 0,
          sample: employees?.slice(0, 3) || []
        },
        structure: '✅ Structure de table accessible'
      }
    });

  } catch (error) {
    console.error('❌ Erreur test base de données:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('error' in error) {
        errorMessage = String(error.error);
      } else {
        errorMessage = JSON.stringify(error);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors du test: ${errorMessage}`
      },
      { status: 500 }
    );
  }
} 