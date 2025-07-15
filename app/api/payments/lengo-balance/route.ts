import { LengoBalanceService } from '@/lib/lengoBalanceService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'origine de la requête pour la sécurité
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://admin-zalama.vercel.app',
      'https://admin-zalama-git-feature-last-version-zalama.vercel.app'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Origine non autorisée' },
        { status: 403 }
      );
    }

    console.log('💰 Récupération du solde Lengo Pay...');
    
    const balanceData = await LengoBalanceService.getBalance();
    
    console.log('✅ Solde récupéré avec succès:', balanceData);
    
    return NextResponse.json({
      success: true,
      data: balanceData,
      formattedBalance: LengoBalanceService.formatBalance(balanceData.balance, balanceData.currency)
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du solde:', error);
    
    let errorMessage = 'Erreur lors de la récupération du solde';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Configuration Lengo Pay manquante')) {
        errorMessage = 'Configuration Lengo Pay manquante';
        statusCode = 500;
      } else if (error.message.includes('401')) {
        errorMessage = 'Clé API Lengo Pay invalide';
        statusCode = 401;
      } else if (error.message.includes('404')) {
        errorMessage = 'Site ID Lengo Pay introuvable';
        statusCode = 404;
      } else if (error.message.includes('400')) {
        errorMessage = 'Requête mal formée';
        statusCode = 400;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: statusCode }
    );
  }
} 