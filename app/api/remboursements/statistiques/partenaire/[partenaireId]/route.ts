import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/remboursements/statistiques/partenaire/{partenaireId} - Statistiques des remboursements d'un partenaire
export async function GET(
  request: NextRequest,
  { params }: { params: { partenaireId: string } }
) {
  try {
    const { partenaireId } = params;

    // Validation du partenaireId
    if (!partenaireId) {
      return NextResponse.json(
        { error: 'ID du partenaire requis' },
        { status: 400 }
      );
    }

    // Vérifier que le partenaire existe
    const { data: partenaire, error: partenaireError } = await supabase
      .from('partners')
      .select('id, nom, email, telephone, actif')
      .eq('id', partenaireId)
      .single();

    if (partenaireError || !partenaire) {
      return NextResponse.json(
        { error: 'Partenaire non trouvé' },
        { status: 404 }
      );
    }

    if (!partenaire.actif) {
      return NextResponse.json(
        { error: 'Partenaire inactif' },
        { status: 403 }
      );
    }

    // Récupérer tous les remboursements du partenaire
    const { data: remboursements, error: fetchError } = await supabase
      .from('remboursements')
      .select('statut, montant_total_remboursement, date_creation, date_limite_remboursement, date_remboursement_effectue')
      .eq('partenaire_id', partenaireId);

    if (fetchError) {
      console.error('Erreur lors de la récupération des remboursements:', fetchError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      );
    }

    // Calculer les statistiques de base
    const totalRemboursements = remboursements?.length || 0;
    const remboursementsPayes = remboursements?.filter(r => r.statut === 'PAYE') || [];
    const remboursementsEnAttente = remboursements?.filter(r => r.statut === 'EN_ATTENTE') || [];
    const remboursementsEnRetard = remboursements?.filter(r => r.statut === 'EN_RETARD') || [];
    const remboursementsAnnules = remboursements?.filter(r => r.statut === 'ANNULE') || [];

    // Calculer les montants
    const montantTotal = remboursements?.reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0) || 0;
    const montantPaye = remboursementsPayes.reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);
    const montantEnAttente = remboursementsEnAttente.reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);
    const montantEnRetard = remboursementsEnRetard.reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

    // Calculer le taux de paiement
    const tauxPaiement = totalRemboursements > 0 ? (remboursementsPayes.length / totalRemboursements) * 100 : 0;

    // Calculer la moyenne des jours de retard
    const joursRetard = remboursementsEnRetard.map(remb => {
      const dateLimite = new Date(remb.date_limite_remboursement);
      const maintenant = new Date();
      return Math.max(0, Math.floor((maintenant.getTime() - dateLimite.getTime()) / (1000 * 60 * 60 * 24)));
    });

    const moyenneRetardJours = joursRetard.length > 0 
      ? joursRetard.reduce((sum, jours) => sum + jours, 0) / joursRetard.length 
      : 0;

    // Statistiques par mois (12 derniers mois)
    const statistiquesParMois = [];
    const maintenant = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const moisSuivant = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      const remboursementsDuMois = remboursements?.filter(remb => {
        const dateCreation = new Date(remb.date_creation);
        return dateCreation >= date && dateCreation < moisSuivant;
      }) || [];

      const montantDuMois = remboursementsDuMois.reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);
      const payesDuMois = remboursementsDuMois.filter(r => r.statut === 'PAYE').length;

      statistiquesParMois.push({
        mois: date.toISOString().substring(0, 7), // Format YYYY-MM
        total: remboursementsDuMois.length,
        payes: payesDuMois,
        montant: montantDuMois,
        montant_paye: remboursementsDuMois
          .filter(r => r.statut === 'PAYE')
          .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0)
      });
    }

    // Statistiques par employé
    const { data: remboursementsAvecEmployes, error: employesError } = await supabase
      .from('remboursements')
      .select(`
        statut, 
        montant_total_remboursement,
        employe:employees(id, nom, prenom)
      `)
      .eq('partenaire_id', partenaireId);

    const statistiquesParEmploye = [];
    if (remboursementsAvecEmployes) {
      const employesMap = new Map();
      
      remboursementsAvecEmployes.forEach(remb => {
        const employeId = remb.employe?.id;
        if (employeId) {
          if (!employesMap.has(employeId)) {
            employesMap.set(employeId, {
              employe_id: employeId,
              nom: remb.employe?.nom,
              prenom: remb.employe?.prenom,
              total_remboursements: 0,
              remboursements_payes: 0,
              montant_total: 0,
              montant_paye: 0
            });
          }
          
          const stats = employesMap.get(employeId);
          stats.total_remboursements++;
          stats.montant_total += remb.montant_total_remboursement || 0;
          
          if (remb.statut === 'PAYE') {
            stats.remboursements_payes++;
            stats.montant_paye += remb.montant_total_remboursement || 0;
          }
        }
      });
      
      statistiquesParEmploye.push(...employesMap.values());
    }

    const statistiques = {
      partenaire_id: partenaireId,
      partenaire_nom: partenaire.nom,
      total_remboursements: totalRemboursements,
      remboursements_payes: remboursementsPayes.length,
      remboursements_en_attente: remboursementsEnAttente.length,
      remboursements_en_retard: remboursementsEnRetard.length,
      remboursements_annules: remboursementsAnnules.length,
      montant_total_a_rembourser: montantTotal,
      montant_total_rembourse: montantPaye,
      montant_en_attente: montantEnAttente,
      montant_en_retard: montantEnRetard,
      taux_paiement: Math.round(tauxPaiement * 100) / 100,
      moyenne_retard_jours: Math.round(moyenneRetardJours * 10) / 10,
      statistiques_par_mois: statistiquesParMois,
      statistiques_par_employe: statistiquesParEmploye
    };

    return NextResponse.json({
      success: true,
      data: statistiques
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 