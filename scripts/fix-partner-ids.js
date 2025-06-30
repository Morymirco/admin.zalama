const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixPartnerIds() {
  console.log('🔧 Correction des partenaire_id manquants...\n');

  try {
    // 1. Récupérer les demandes avec partenaire_id null
    console.log('1. Récupération des demandes avec partenaire_id null...');
    const { data: requestsWithNullPartner, error: fetchError } = await supabase
      .from('salary_advance_requests')
      .select(`
        *,
        employe:employees(nom, prenom, email, telephone, poste, salaire_net, partner_id)
      `)
      .is('partenaire_id', null);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
      return;
    }

    console.log(`✅ ${requestsWithNullPartner.length} demande(s) avec partenaire_id null trouvée(s)`);

    if (requestsWithNullPartner.length === 0) {
      console.log('✅ Aucune correction nécessaire');
      return;
    }

    // 2. Récupérer les partenaires disponibles
    console.log('\n2. Récupération des partenaires disponibles...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom, type, secteur');

    if (partnersError) {
      console.error('❌ Erreur lors de la récupération des partenaires:', partnersError);
      return;
    }

    console.log(`✅ ${partners.length} partenaire(s) disponible(s)`);
    partners.forEach(p => console.log(`   - ${p.nom} (${p.id})`));

    if (partners.length === 0) {
      console.log('❌ Aucun partenaire disponible pour la correction');
      return;
    }

    // 3. Corriger les demandes
    console.log('\n3. Correction des demandes...');
    const defaultPartnerId = partners[0].id; // Utiliser le premier partenaire comme défaut

    for (const request of requestsWithNullPartner) {
      console.log(`   Correction de la demande ${request.id}...`);
      
      // Utiliser le partner_id de l'employé s'il existe, sinon utiliser le partenaire par défaut
      const partnerId = request.employe?.partner_id || defaultPartnerId;
      
      const { error: updateError } = await supabase
        .from('salary_advance_requests')
        .update({ 
          partenaire_id: partnerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) {
        console.error(`   ❌ Erreur lors de la correction de ${request.id}:`, updateError);
      } else {
        console.log(`   ✅ Demande ${request.id} corrigée avec partenaire_id: ${partnerId}`);
      }
    }

    // 4. Vérifier le résultat
    console.log('\n4. Vérification du résultat...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('salary_advance_requests')
      .select(`
        id,
        employe:employees(nom, prenom),
        partenaire:partners(nom),
        statut,
        montant_demande
      `)
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log('📋 Demandes après correction:');
      finalCheck.forEach((item, index) => {
        console.log(`${index + 1}. ${item.employe?.prenom} ${item.employe?.nom} - ${item.partenaire?.nom || 'Aucun partenaire'} - ${item.montant_demande} GNF - ${item.statut}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la correction
fixPartnerIds().then(() => {
  console.log('\n✅ Correction terminée');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 