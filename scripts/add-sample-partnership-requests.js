const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleRequests = [
  {
    company_name: 'TechSolutions SARL',
    legal_status: 'SARL',
    rccm: 'RCCM-CG-2024-001',
    nif: 'NIF-2024-001',
    activity_domain: 'Technologies de l\'information',
    headquarters_address: '123 Avenue de la Paix, Brazzaville',
    phone: '+242 06 123 4567',
    email: 'contact@techsolutions.cg',
    employees_count: 25,
    payroll: '15 000 000 FCFA',
    cdi_count: 20,
    cdd_count: 5,
    payment_date: '25 de chaque mois',
    rep_full_name: 'Jean-Pierre Mbemba',
    rep_position: 'Directeur Général',
    rep_email: 'jp.mbemba@techsolutions.cg',
    rep_phone: '+242 06 123 4568',
    hr_full_name: 'Marie-Louise Nzouzi',
    hr_email: 'hr@techsolutions.cg',
    hr_phone: '+242 06 123 4569',
    agreement: true,
    status: 'pending'
  },
  {
    company_name: 'AgroPlus Congo',
    legal_status: 'SA',
    rccm: 'RCCM-CG-2024-002',
    nif: 'NIF-2024-002',
    activity_domain: 'Agriculture et agroalimentaire',
    headquarters_address: '456 Boulevard Marien Ngouabi, Pointe-Noire',
    phone: '+242 06 234 5678',
    email: 'info@agroplus.cg',
    employees_count: 45,
    payroll: '25 000 000 FCFA',
    cdi_count: 35,
    cdd_count: 10,
    payment_date: '30 de chaque mois',
    rep_full_name: 'Pierre Kimbouala',
    rep_position: 'Président Directeur Général',
    rep_email: 'p.kimbouala@agroplus.cg',
    rep_phone: '+242 06 234 5679',
    hr_full_name: 'Sophie Makaya',
    hr_email: 'rh@agroplus.cg',
    hr_phone: '+242 06 234 5680',
    agreement: true,
    status: 'approved'
  },
  {
    company_name: 'Construction Congo SARL',
    legal_status: 'SARL',
    rccm: 'RCCM-CG-2024-003',
    nif: 'NIF-2024-003',
    activity_domain: 'Bâtiment et travaux publics',
    headquarters_address: '789 Rue de la République, Brazzaville',
    phone: '+242 06 345 6789',
    email: 'contact@construction-congo.cg',
    employees_count: 80,
    payroll: '40 000 000 FCFA',
    cdi_count: 60,
    cdd_count: 20,
    payment_date: '28 de chaque mois',
    rep_full_name: 'André Moukoko',
    rep_position: 'Directeur Général',
    rep_email: 'a.moukoko@construction-congo.cg',
    rep_phone: '+242 06 345 6790',
    hr_full_name: 'Lucie Bemba',
    hr_email: 'ressources.humaines@construction-congo.cg',
    hr_phone: '+242 06 345 6791',
    agreement: false,
    status: 'in_review'
  },
  {
    company_name: 'Transport Express Congo',
    legal_status: 'SA',
    rccm: 'RCCM-CG-2024-004',
    nif: 'NIF-2024-004',
    activity_domain: 'Transport et logistique',
    headquarters_address: '321 Avenue de l\'Indépendance, Pointe-Noire',
    phone: '+242 06 456 7890',
    email: 'info@transport-express.cg',
    employees_count: 120,
    payroll: '60 000 000 FCFA',
    cdi_count: 100,
    cdd_count: 20,
    payment_date: '27 de chaque mois',
    rep_full_name: 'Claude Nguesso',
    rep_position: 'Directeur Commercial',
    rep_email: 'c.nguesso@transport-express.cg',
    rep_phone: '+242 06 456 7891',
    hr_full_name: 'Francine Loundou',
    hr_email: 'f.loundou@transport-express.cg',
    hr_phone: '+242 06 456 7892',
    agreement: true,
    status: 'rejected'
  },
  {
    company_name: 'Santé Plus Congo',
    legal_status: 'SARL',
    rccm: 'RCCM-CG-2024-005',
    nif: 'NIF-2024-005',
    activity_domain: 'Santé et bien-être',
    headquarters_address: '654 Boulevard Denis Sassou Nguesso, Brazzaville',
    phone: '+242 06 567 8901',
    email: 'contact@sante-plus.cg',
    employees_count: 35,
    payroll: '20 000 000 FCFA',
    cdi_count: 30,
    cdd_count: 5,
    payment_date: '26 de chaque mois',
    rep_full_name: 'Dr. Sarah Makosso',
    rep_position: 'Directrice Médicale',
    rep_email: 'dr.makosso@sante-plus.cg',
    rep_phone: '+242 06 567 8902',
    hr_full_name: 'Patricia Mboungou',
    hr_email: 'p.mboungou@sante-plus.cg',
    hr_phone: '+242 06 567 8903',
    agreement: true,
    status: 'pending'
  }
];

async function addSamplePartnershipRequests() {
  try {
    console.log('🔄 Ajout des demandes de partenariat de test...');
    
    // Vérifier si la table existe
    const { data: existingRequests, error: checkError } = await supabase
      .from('partnership_requests')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification de la table:', checkError);
      console.log('💡 Assurez-vous que la table partnership_requests existe dans votre base de données Supabase');
      return;
    }
    
    // Supprimer les données existantes
    const { error: deleteError } = await supabase
      .from('partnership_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tout sauf un ID impossible
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression des données existantes:', deleteError);
      return;
    }
    
    console.log('🗑️  Anciennes données supprimées');
    
    // Insérer les nouvelles données une par une pour éviter les erreurs
    const insertedRequests = [];
    for (const request of sampleRequests) {
      const { data, error } = await supabase
        .from('partnership_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Erreur lors de l'ajout de ${request.company_name}:`, error);
      } else {
        insertedRequests.push(data);
        console.log(`✅ ${request.company_name} ajoutée`);
      }
    }
    
    console.log('\n✅ Demandes de partenariat ajoutées avec succès!');
    console.log(`📊 ${insertedRequests.length} demandes créées:`);
    
    insertedRequests.forEach((request, index) => {
      console.log(`   ${index + 1}. ${request.company_name} (${request.status})`);
    });
    
    console.log('\n🎯 Prochaines étapes:');
    console.log('   1. Vérifiez les demandes dans votre interface admin');
    console.log('   2. Testez les fonctionnalités d\'export PDF');
    console.log('   3. Testez les actions d\'approbation/rejet');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
addSamplePartnershipRequests(); 