const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSalaryAdvanceData() {
  console.log('🔍 Test des données de salary advance requests...\n');

  try {
    // 1. Vérifier si la table existe et compter les enregistrements
    console.log('1. Vérification de la table salary_advance_requests...');
    const { count, error: countError } = await supabase
      .from('salary_advance_requests')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError);
      return;
    }

    console.log(`✅ Table trouvée avec ${count} enregistrement(s)\n`);

    // 2. Récupérer quelques enregistrements pour vérifier la structure
    console.log('2. Récupération des données existantes...');
    const { data: existingData, error: fetchError } = await supabase
      .from('salary_advance_requests')
      .select(`
        *,
        employe:employees(nom, prenom, email, telephone, poste, salaire_net),
        partenaire:partners(nom, type, secteur, email, telephone)
      `)
      .limit(5);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
      return;
    }

    console.log(`✅ ${existingData.length} enregistrement(s) récupéré(s)`);
    
    if (existingData.length > 0) {
      console.log('📋 Premier enregistrement:');
      console.log(JSON.stringify(existingData[0], null, 2));
    }

    // 3. Vérifier s'il y a des employés et partenaires
    console.log('\n3. Vérification des employés et partenaires...');
    
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, nom, prenom, email')
      .limit(3);

    if (employeesError) {
      console.error('❌ Erreur lors de la récupération des employés:', employeesError);
    } else {
      console.log(`✅ ${employees.length} employé(s) trouvé(s)`);
      if (employees.length > 0) {
        console.log('👥 Employés disponibles:', employees.map(e => `${e.prenom} ${e.nom}`));
      }
    }

    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom, type, secteur')
      .limit(3);

    if (partnersError) {
      console.error('❌ Erreur lors de la récupération des partenaires:', partnersError);
    } else {
      console.log(`✅ ${partners.length} partenaire(s) trouvé(s)`);
      if (partners.length > 0) {
        console.log('🏢 Partenaires disponibles:', partners.map(p => p.nom));
      }
    }

    // 4. Si pas de données, ajouter des données de test
    if (count === 0 && employees.length > 0 && partners.length > 0) {
      console.log('\n4. Ajout de données de test...');
      
      const testData = [
        {
          employe_id: employees[0].id,
          partenaire_id: partners[0].id,
          montant_demande: 500000,
          type_motif: 'Urgence médicale',
          motif: 'Frais médicaux pour consultation et médicaments',
          frais_service: 5000,
          montant_total: 505000,
          salaire_disponible: 800000,
          avance_disponible: 300000,
          statut: 'En attente',
          date_creation: new Date().toISOString()
        },
        {
          employe_id: employees.length > 1 ? employees[1].id : employees[0].id,
          partenaire_id: partners.length > 1 ? partners[1].id : partners[0].id,
          montant_demande: 300000,
          type_motif: 'Éducation',
          motif: 'Frais de scolarité pour les enfants',
          frais_service: 3000,
          montant_total: 303000,
          salaire_disponible: 750000,
          avance_disponible: 250000,
          statut: 'Approuvée',
          date_creation: new Date(Date.now() - 86400000).toISOString(), // Hier
          date_validation: new Date().toISOString()
        },
        {
          employe_id: employees[0].id,
          partenaire_id: partners[0].id,
          montant_demande: 200000,
          type_motif: 'Réparation véhicule',
          motif: 'Réparation du moteur de la voiture',
          frais_service: 2000,
          montant_total: 202000,
          salaire_disponible: 800000,
          avance_disponible: 200000,
          statut: 'Rejetée',
          date_creation: new Date(Date.now() - 172800000).toISOString(), // Avant-hier
          date_rejet: new Date(Date.now() - 86400000).toISOString(),
          motif_rejet: 'Montant trop élevé par rapport au salaire disponible'
        }
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from('salary_advance_requests')
        .insert(testData)
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `);

      if (insertError) {
        console.error('❌ Erreur lors de l\'insertion:', insertError);
      } else {
        console.log(`✅ ${insertedData.length} demande(s) de test ajoutée(s)`);
        console.log('📋 Données ajoutées:');
        insertedData.forEach((item, index) => {
          console.log(`${index + 1}. ${item.employe?.prenom} ${item.employe?.nom} - ${item.montant_demande} GNF - ${item.statut}`);
        });
      }
    } else if (count === 0) {
      console.log('\n⚠️  Impossible d\'ajouter des données de test: employés ou partenaires manquants');
    }

    // 5. Vérifier les statistiques
    console.log('\n5. Vérification des statistiques...');
    
    const { data: statsData, error: statsError } = await supabase
      .from('salary_advance_requests')
      .select('statut, montant_demande');

    if (statsError) {
      console.error('❌ Erreur lors de la récupération des statistiques:', statsError);
    } else {
      const stats = {
        total: statsData.length,
        enAttente: statsData.filter(s => s.statut === 'En attente').length,
        approuvees: statsData.filter(s => s.statut === 'Approuvée').length,
        rejetees: statsData.filter(s => s.statut === 'Rejetée').length,
        montantTotal: statsData.reduce((sum, s) => sum + (s.montant_demande || 0), 0),
        montantMoyen: statsData.length > 0 ? statsData.reduce((sum, s) => sum + (s.montant_demande || 0), 0) / statsData.length : 0
      };
      
      console.log('📊 Statistiques:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   En attente: ${stats.enAttente}`);
      console.log(`   Approuvées: ${stats.approuvees}`);
      console.log(`   Rejetées: ${stats.rejetees}`);
      console.log(`   Montant total: ${stats.montantTotal.toLocaleString()} GNF`);
      console.log(`   Montant moyen: ${Math.round(stats.montantMoyen).toLocaleString()} GNF`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testSalaryAdvanceData().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 