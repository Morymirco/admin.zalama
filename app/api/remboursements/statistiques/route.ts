import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase - Utiliser la clé anonyme comme les autres API
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/remboursements/statistiques - Récupérer les statistiques globales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partenaireId = searchParams.get('partenaire_id');

    if (partenaireId) {
      // Statistiques par partenaire
      return await getStatistiquesPartenaire(partenaireId);
    } else {
      // Statistiques globales
      return await getStatistiquesGlobales();
    }

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

async function getStatistiquesGlobales() {
  try {
    // Récupérer les statistiques depuis la table remboursements
    const { data, error } = await supabase
      .from('remboursements')
      .select(`
        *,
        employe:employees(nom, prenom, email, telephone),
        partenaire:partners(nom, email, email_rh, telephone),
        transaction:transactions(numero_transaction, methode_paiement, date_transaction, statut)
      `);

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      );
    }

    const remboursements = data || [];

    // Calculer les statistiques
    const totalRemboursements = remboursements.length;
    const remboursementsPayes = remboursements.filter(r => r.statut === 'PAYE').length;
    const remboursementsEnAttente = remboursements.filter(r => r.statut === 'EN_ATTENTE').length;
    const remboursementsEnRetard = remboursements.filter(r => r.statut === 'EN_RETARD').length;
    const remboursementsAnnules = remboursements.filter(r => r.statut === 'ANNULE').length;

    const montantTotalARembourser = remboursements.reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);
    const montantTotalRembourse = remboursements
      .filter(r => r.statut === 'PAYE')
      .reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);
    const montantEnRetard = remboursements
      .filter(r => r.statut === 'EN_RETARD')
      .reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);
    const montantEnAttente = remboursements
      .filter(r => r.statut === 'EN_ATTENTE')
      .reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);

    // Calculer le taux de remboursement
    const tauxRemboursement = montantTotalARembourser > 0 ? (montantTotalRembourse / montantTotalARembourser) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        globales: {
          total_remboursements: totalRemboursements,
          remboursements_en_attente: remboursementsEnAttente,
          remboursements_payes: remboursementsPayes,
          remboursements_en_retard: remboursementsEnRetard,
          remboursements_annules: remboursementsAnnules,
          montant_total_a_rembourser: montantTotalARembourser,
          montant_total_rembourse: montantTotalRembourse,
          montant_en_retard: montantEnRetard,
          montant_en_attente: montantEnAttente,
          taux_remboursement: Math.round(tauxRemboursement * 100) / 100
        },
        par_statut: {
          'EN_ATTENTE': remboursementsEnAttente,
          'PAYE': remboursementsPayes,
          'EN_RETARD': remboursementsEnRetard,
          'ANNULE': remboursementsAnnules
        },
        par_mois: [] // À implémenter si nécessaire
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

async function getStatistiquesPartenaire(partenaireId: string) {
  try {
    // Récupérer les remboursements du partenaire
    const { data, error } = await supabase
      .from('vue_remboursements_integraux')
      .select('*')
      .eq('entreprise_id', partenaireId);

    if (error) {
      console.error('Erreur lors de la récupération des statistiques du partenaire:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      );
    }

    const remboursements = data || [];

    // Calculer les statistiques
    const totalRemboursements = remboursements.length;
    const remboursementsPayes = remboursements.filter(r => r.statut_calcule === 'PAYE').length;
    const remboursementsEnAttente = remboursements.filter(r => r.statut_calcule === 'EN_ATTENTE').length;
    const remboursementsEnRetard = remboursements.filter(r => r.statut_calcule === 'EN_RETARD').length;

    const montantTotalARembourser = remboursements.reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);
    const montantTotalRembourse = remboursements
      .filter(r => r.statut_calcule === 'PAYE')
      .reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);
    const montantEnRetard = remboursements
      .filter(r => r.statut_calcule === 'EN_RETARD')
      .reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);

    return NextResponse.json({
      success: true,
      data: {
        partenaire_id: partenaireId,
        total_remboursements: totalRemboursements,
        remboursements_payes: remboursementsPayes,
        remboursements_en_attente: remboursementsEnAttente,
        remboursements_en_retard: remboursementsEnRetard,
        montant_total_a_rembourser: montantTotalARembourser,
        montant_total_rembourse: montantTotalRembourse,
        montant_en_retard: montantEnRetard,
        taux_remboursement: totalRemboursements > 0 ? (remboursementsPayes / totalRemboursements) * 100 : 0
      }
    });

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques du partenaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    );
  }
}

async function getStatistiquesParPartenaireArray() {
  try {
    // Récupérer tous les remboursements groupés par partenaire
    const { data, error } = await supabase
      .from('vue_remboursements_integraux')
      .select('*');

    if (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return [];
    }

    const remboursements = data || [];

    // Grouper par partenaire
    const groupByPartenaire = remboursements.reduce((acc, remboursement) => {
      const partenaireId = remboursement.entreprise_id;
      if (!acc[partenaireId]) {
        acc[partenaireId] = {
          partenaire_id: partenaireId,
          nom_entreprise: remboursement.nom_entreprise,
          remboursements: []
        };
      }
      acc[partenaireId].remboursements.push(remboursement);
      return acc;
    }, {} as Record<string, any>);

    // Calculer les statistiques pour chaque partenaire
    return Object.values(groupByPartenaire).map((partenaire: any) => {
      const remboursements = partenaire.remboursements;
      const totalRemboursements = remboursements.length;
      const remboursementsPayes = remboursements.filter((r: any) => r.statut_calcule === 'PAYE').length;
      const remboursementsEnAttente = remboursements.filter((r: any) => r.statut_calcule === 'EN_ATTENTE').length;
      const remboursementsEnRetard = remboursements.filter((r: any) => r.statut_calcule === 'EN_RETARD').length;

      const montantTotalARembourser = remboursements.reduce((sum: number, r: any) => sum + parseFloat(r.montant_total_remboursement), 0);
      const montantTotalRembourse = remboursements
        .filter((r: any) => r.statut_calcule === 'PAYE')
        .reduce((sum: number, r: any) => sum + parseFloat(r.montant_total_remboursement), 0);
      const montantEnRetard = remboursements
        .filter((r: any) => r.statut_calcule === 'EN_RETARD')
        .reduce((sum: number, r: any) => sum + parseFloat(r.montant_total_remboursement), 0);

      return {
        partenaire_id: partenaire.partenaire_id,
        nom_entreprise: partenaire.nom_entreprise,
        total_remboursements: totalRemboursements,
        remboursements_payes: remboursementsPayes,
        remboursements_en_attente: remboursementsEnAttente,
        remboursements_en_retard: remboursementsEnRetard,
        montant_total_a_rembourser: montantTotalARembourser,
        montant_total_rembourse: montantTotalRembourse,
        montant_en_retard: montantEnRetard,
        taux_remboursement: totalRemboursements > 0 ? (remboursementsPayes / totalRemboursements) * 100 : 0
      };
    });

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques par partenaire:', error);
    return [];
  }
} 