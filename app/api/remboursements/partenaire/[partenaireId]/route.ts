import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/remboursements/partenaire/{partenaireId} - Récupérer les remboursements d'un partenaire
export async function GET(
  request: NextRequest,
  { params }: { params: { partenaireId: string } }
) {
  try {
    const { partenaireId } = params;
    const { searchParams } = new URL(request.url);

    // Paramètres de filtrage
    const statut = searchParams.get('statut');
    const employeId = searchParams.get('employe_id');
    const dateDebut = searchParams.get('date_debut');
    const dateFin = searchParams.get('date_fin');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Construction de la requête
    let query = supabase
      .from('remboursements')
      .select(`
        *,
        employe:employees(id, nom, prenom, email, telephone),
        partenaire:partners(id, nom, email, email_rh, telephone),
        transaction:transactions(id, numero_transaction, methode_paiement, date_transaction, statut),
        demande:salary_advance_requests(id, motif, montant_demande, frais_service)
      `)
      .eq('partenaire_id', partenaireId);

    // Filtres optionnels
    if (statut) {
      query = query.eq('statut', statut);
    }

    if (employeId) {
      query = query.eq('employe_id', employeId);
    }

    if (dateDebut) {
      query = query.gte('date_creation', dateDebut);
    }

    if (dateFin) {
      query = query.lte('date_creation', dateFin);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    // Tri par date de création (plus récent en premier)
    query = query.order('date_creation', { ascending: false });

    const { data: remboursements, error: fetchError } = await query;

    if (fetchError) {
      console.error('Erreur lors de la récupération des remboursements:', fetchError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des remboursements' },
        { status: 500 }
      );
    }

    // Calculer les statistiques
    const { data: statsData, error: statsError } = await supabase
      .from('remboursements')
      .select('statut, montant_total_remboursement')
      .eq('partenaire_id', partenaireId);

    if (statsError) {
      console.error('Erreur lors du calcul des statistiques:', statsError);
    }

    // Calculer les statistiques
    const stats = {
      total: statsData?.length || 0,
      en_attente: statsData?.filter(r => r.statut === 'EN_ATTENTE').length || 0,
      payes: statsData?.filter(r => r.statut === 'PAYE').length || 0,
      en_retard: statsData?.filter(r => r.statut === 'EN_RETARD').length || 0,
      annules: statsData?.filter(r => r.statut === 'ANNULE').length || 0,
      montant_total: statsData?.reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0) || 0,
      montant_paye: statsData?.filter(r => r.statut === 'PAYE').reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0) || 0,
      montant_en_attente: statsData?.filter(r => r.statut === 'EN_ATTENTE').reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0) || 0,
      montant_en_retard: statsData?.filter(r => r.statut === 'EN_RETARD').reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0) || 0
    };

    // Ajouter les jours de retard pour chaque remboursement
    const remboursementsAvecRetard = remboursements?.map(remb => {
      const joursRetard = remb.statut === 'EN_RETARD' 
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(remb.date_limite_remboursement).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        ...remb,
        jours_retard: joursRetard
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: remboursementsAvecRetard,
      statistiques: stats,
      pagination: {
        limit,
        offset,
        total: stats.total
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