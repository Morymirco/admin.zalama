import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nom, prenom, partner_id } = body;

    console.log('🧪 Test création compte employé:', { email, nom, prenom, partner_id });

    // Validation
    if (!email || !nom || !prenom || !partner_id) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Appeler l'API de création de compte
    const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://admin.zalama.com' : 'http://localhost:3001'}/api/auth/create-employee-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeData: {
          email,
          nom,
          prenom,
          partner_id,
          id: `test_${Date.now()}`
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.error || `Erreur HTTP ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test de création de compte employé réussi',
      result: result
    });

  } catch (error) {
    console.error('❌ Erreur test création compte employé:', error);
    
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