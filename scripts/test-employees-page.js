require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEmployeesPage() {
  console.log('🧪 Test de la page des employés...\n');

  try {
    // 1. Vérifier la connexion à Supabase
    console.log('1. Test de connexion à Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('partenaires')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Erreur de connexion: ${testError.message}`);
    }
    console.log('✅ Connexion à Supabase réussie\n');

    // 2. Récupérer tous les partenaires
    console.log('2. Récupération des partenaires...');
    const { data: partners, error: partnersError } = await supabase
      .from('partenaires')
      .select('*')
      .order('created_at', { ascending: false });

    if (partnersError) {
      throw new Error(`Erreur lors de la récupération des partenaires: ${partnersError.message}`);
    }

    console.log(`✅ ${partners.length} partenaires trouvés\n`);

    // 3. Récupérer tous les employés
    console.log('3. Récupération des employés...');
    const { data: employees, error: employeesError } = await supabase
      .from('employes')
      .select(`
        *,
        partenaire:partenaires(nom)
      `)
      .order('created_at', { ascending: false });

    if (employeesError) {
      throw new Error(`Erreur lors de la récupération des employés: ${employeesError.message}`);
    }

    console.log(`✅ ${employees.length} employés trouvés\n`);

    // 4. Calculer les statistiques
    console.log('4. Calcul des statistiques...');
    const total = employees.length;
    const actifs = employees.filter(emp => emp.actif).length;
    const inactifs = total - actifs;

    // Statistiques par partenaire
    const parPartenaire = {};
    employees.forEach(emp => {
      const partnerName = emp.partenaire?.nom || 'Inconnu';
      parPartenaire[partnerName] = (parPartenaire[partnerName] || 0) + 1;
    });

    // Statistiques par poste
    const parPoste = {};
    employees.forEach(emp => {
      const poste = emp.poste || 'Non défini';
      parPoste[poste] = (parPoste[poste] || 0) + 1;
    });

    console.log('📊 Statistiques:');
    console.log(`   - Total employés: ${total}`);
    console.log(`   - Employés actifs: ${actifs}`);
    console.log(`   - Employés inactifs: ${inactifs}`);
    console.log(`   - Par partenaire:`, parPartenaire);
    console.log(`   - Par poste:`, parPoste);
    console.log('');

    // 5. Tester la recherche
    console.log('5. Test de recherche...');
    if (employees.length > 0) {
      const firstEmployee = employees[0];
      const searchTerm = firstEmployee.nom?.substring(0, 3) || 'test';
      
      const { data: searchResults, error: searchError } = await supabase
        .from('employes')
        .select(`
          *,
          partenaire:partenaires(nom)
        `)
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(5);

      if (searchError) {
        console.log(`⚠️  Erreur lors de la recherche: ${searchError.message}`);
      } else {
        console.log(`✅ Recherche réussie: ${searchResults.length} résultats pour "${searchTerm}"`);
      }
    }
    console.log('');

    // 6. Tester le filtrage par partenaire
    console.log('6. Test de filtrage par partenaire...');
    if (partners.length > 0) {
      const firstPartner = partners[0];
      
      const { data: filteredEmployees, error: filterError } = await supabase
        .from('employes')
        .select(`
          *,
          partenaire:partenaires(nom)
        `)
        .eq('partner_id', firstPartner.id);

      if (filterError) {
        console.log(`⚠️  Erreur lors du filtrage: ${filterError.message}`);
      } else {
        console.log(`✅ Filtrage réussi: ${filteredEmployees.length} employés pour le partenaire "${firstPartner.nom}"`);
      }
    }
    console.log('');

    // 7. Afficher un exemple d'employé
    if (employees.length > 0) {
      console.log('7. Exemple d\'employé:');
      const example = employees[0];
      console.log(`   - Nom: ${example.prenom} ${example.nom}`);
      console.log(`   - Email: ${example.email}`);
      console.log(`   - Téléphone: ${example.telephone}`);
      console.log(`   - Poste: ${example.poste}`);
      console.log(`   - Partenaire: ${example.partenaire?.nom}`);
      console.log(`   - Salaire: ${example.salaire_net} GNF`);
      console.log(`   - Statut: ${example.actif ? 'Actif' : 'Inactif'}`);
      console.log('');
    }

    console.log('🎉 Test de la page des employés terminé avec succès!');
    console.log('\n📋 Résumé:');
    console.log(`   - ${partners.length} partenaires disponibles`);
    console.log(`   - ${employees.length} employés au total`);
    console.log(`   - ${actifs} employés actifs`);
    console.log(`   - ${inactifs} employés inactifs`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testEmployeesPage(); 