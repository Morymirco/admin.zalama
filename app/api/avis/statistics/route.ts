import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET - Récupérer les statistiques des avis
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les avis
    const { data: avis, error } = await supabase
      .from('avis')
      .select('*');

    if (error) {
      console.error('Erreur lors de la récupération des avis pour stats:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      );
    }

    const avisList = avis || [];

    // Récupérer les IDs uniques des partenaires et employés
    const partnerIds = [...new Set(avisList.filter(avis => avis.partner_id).map(avis => avis.partner_id))];
    const employeeIds = [...new Set(avisList.filter(avis => avis.employee_id).map(avis => avis.employee_id))];

    // Récupérer les noms des partenaires
    const partnerNames = new Map();
    if (partnerIds.length > 0) {
      const { data: partners, error: partnerError } = await supabase
        .from('partners')
        .select('id, nom')
        .in('id', partnerIds);
      
      if (!partnerError && partners) {
        partners.forEach(partner => {
          partnerNames.set(partner.id, partner.nom);
        });
      }
    }

    // Récupérer les noms des employés
    const employeeNames = new Map();
    if (employeeIds.length > 0) {
      const { data: employees, error: employeeError } = await supabase
        .from('employees')
        .select('id, nom, prenom')
        .in('id', employeeIds);
      
      if (!employeeError && employees) {
        employees.forEach(employee => {
          employeeNames.set(employee.id, `${employee.prenom} ${employee.nom}`);
        });
      }
    }

    // Calculer les statistiques de base
    const total_avis = avisList.length;
    const moyenne_note = total_avis > 0 
      ? avisList.reduce((sum, avis) => sum + avis.note, 0) / total_avis 
      : 0;
    
    const avis_positifs = avisList.filter(avis => avis.type_retour === 'positif').length;
    const avis_negatifs = avisList.filter(avis => avis.type_retour === 'negatif').length;
    const avis_approuves = avisList.filter(avis => avis.approuve).length;
    const avis_en_attente = avisList.filter(avis => !avis.approuve).length;

    // Répartition par notes (1 à 5 étoiles)
    const repartition_notes = Array.from({ length: 5 }, (_, i) => {
      const note = i + 1;
      const count = avisList.filter(avis => avis.note === note).length;
      return { note, count };
    });

    // Répartition par partenaire avec vrais noms
    const partnerStats = new Map();
    avisList.forEach(avis => {
      if (avis.partner_id) {
        if (!partnerStats.has(avis.partner_id)) {
          const partnerName = partnerNames.get(avis.partner_id) || `Partenaire ${avis.partner_id}`;
          partnerStats.set(avis.partner_id, {
            partenaire_id: avis.partner_id,
            partenaire_nom: partnerName,
            count: 0,
            total_note: 0
          });
        }
        const stats = partnerStats.get(avis.partner_id);
        stats.count++;
        stats.total_note += avis.note;
      }
    });

    const repartition_par_partenaire = Array.from(partnerStats.values()).map(stats => ({
      partenaire_id: stats.partenaire_id,
      partenaire_nom: stats.partenaire_nom,
      count: stats.count,
      moyenne: stats.count > 0 ? Math.round((stats.total_note / stats.count) * 10) / 10 : 0
    }));

    // Répartition par employé avec vrais noms
    const employeeStats = new Map();
    avisList.forEach(avis => {
      if (avis.employee_id) {
        if (!employeeStats.has(avis.employee_id)) {
          const employeeName = employeeNames.get(avis.employee_id) || `Employé ${avis.employee_id}`;
          employeeStats.set(avis.employee_id, {
            employee_id: avis.employee_id,
            employee_nom: employeeName,
            count: 0,
            total_note: 0
          });
        }
        const stats = employeeStats.get(avis.employee_id);
        stats.count++;
        stats.total_note += avis.note;
      }
    });

    const repartition_par_employe = Array.from(employeeStats.values()).map(stats => ({
      employee_id: stats.employee_id,
      employee_nom: stats.employee_nom,
      count: stats.count,
      moyenne: stats.count > 0 ? Math.round((stats.total_note / stats.count) * 10) / 10 : 0
    }));

    // Statistiques par mois (12 derniers mois)
    const statsParMois = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const mois = date.getMonth();
      const annee = date.getFullYear();
      
      const avisDuMois = avisList.filter(avis => {
        const avisDate = new Date(avis.date_avis);
        return avisDate.getMonth() === mois && avisDate.getFullYear() === annee;
      });

      return {
        mois: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        count: avisDuMois.length,
        moyenne: avisDuMois.length > 0 
          ? Math.round((avisDuMois.reduce((sum, avis) => sum + avis.note, 0) / avisDuMois.length) * 10) / 10 
          : 0
      };
    }).reverse();

    const statistics = {
      total_avis,
      moyenne_note: Math.round(moyenne_note * 10) / 10,
      avis_positifs,
      avis_negatifs,
      avis_approuves,
      avis_en_attente,
      repartition_notes,
      repartition_par_partenaire,
      repartition_par_employe,
      stats_par_mois: statsParMois,
      // Calculs supplémentaires
      taux_approbation: total_avis > 0 ? Math.round((avis_approuves / total_avis) * 100) : 0,
      taux_satisfaction: total_avis > 0 ? Math.round((avis_positifs / total_avis) * 100) : 0,
      avis_par_jour_moyen: total_avis > 0 ? Math.round((total_avis / 30) * 10) / 10 : 0 // Estimation sur 30 jours
    };

    return NextResponse.json({ statistics });
  } catch (error) {
    console.error('Erreur API avis statistics:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 