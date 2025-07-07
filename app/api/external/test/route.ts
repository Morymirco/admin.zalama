import { NextRequest, NextResponse } from 'next/server';

// Clé API pour sécuriser l'accès
const API_KEY = process.env.EXTERNAL_API_KEY || 'zalama_external_key_2024';

export async function GET(request: NextRequest) {
  try {
    // Vérifier la clé API
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Clé API invalide ou manquante',
          code: 'UNAUTHORIZED'
        }, 
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API externe ZaLaMa accessible',
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

  } catch (error) {
    console.error('Erreur route externe test:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
} 