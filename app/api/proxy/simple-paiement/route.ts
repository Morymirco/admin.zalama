import { NextRequest, NextResponse } from 'next/server';

// Proxy pour rediriger les requêtes vers l'API locale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Rediriger vers l'API locale
    const response = await fetch(`${request.nextUrl.origin}/api/remboursements/simple-paiement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erreur proxy:', error);
    return NextResponse.json(
      { error: 'Erreur de proxy' },
      { status: 500 }
    );
  }
} 