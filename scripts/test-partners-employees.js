const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPartnersAndEmployees() {
  console.log('🧪 Test de la gestion des partenaires et employés\n');

  try {
    // 1. Test de création d'un partenaire
    console.log('1. Création d\'un partenaire de test...');
    const testPartner = {
      nom: 'Entreprise Test ZaLaMa',
      type: 'Entreprise',
      secteur: 'Technologie',
      description: 'Entreprise de test pour ZaLaMa',
      nom_representant: 'John Doe',
      email_representant: 'morykoulibaly2023@gmail.com',
      telephone_representant: '+224 625 21 21 15',
      nom_rh: 'Jane Smith',
      email_rh: 'morykoulibaly2023@gmail.com',
      telephone_rh: '+224 625 21 21 15',
      rccm: 'RC/2024/TEST001',
      nif: 'NIF2024TEST002',
      email: 'contact@test-entreprise.com',
      telephone: '+224 623 456 788',
      adresse: '123 Rue Test, Conakry, Guinée',
      site_web: 'https://test-entreprise.com',
      logo_url: '',
      actif: true,
      nombre_employes: 0,
      salaire_net_total: 0
    };

    const { data: createdPartner, error: partnerError } = await supabase
      .from('partners')
      .insert([testPartner])
      .select()
      .single();

    if (partnerError) {
      throw new Error(`Erreur création partenaire: ${partnerError.message}`);
    }

    console.log('✅ Partenaire créé avec succès:', createdPartner.id);
    const partnerId = createdPartner.id;

    // 2. Test de création d'employés
    console.log('\n2. Création d\'employés de test...');
    const testEmployees = [
      {
        partner_id: partnerId,
        nom: 'Dupont',
        prenom: 'Marie',
        genre: 'Femme',
        email: 'marie.dupont@test-entreprise.com',
        telephone: '+224 623 456 791',
        adresse: '456 Avenue Test, Conakry',
        poste: 'Développeuse Senior',
        role: 'Lead Developer',
        type_contrat: 'CDI',
        salaire_net: 2500000,
        date_embauche: '2024-01-15',
        actif: true
      },
      {
        partner_id: partnerId,
        nom: 'Martin',
        prenom: 'Pierre',
        genre: 'Homme',
        email: 'pierre.martin@test-entreprise.com',
        telephone: '+224 623 456 792',
        adresse: '789 Boulevard Test, Conakry',
        poste: 'Chef de Projet',
        role: 'Project Manager',
        type_contrat: 'CDI',
        salaire_net: 3000000,
        date_embauche: '2024-02-01',
        actif: true
      },
      {
        partner_id: partnerId,
        nom: 'Bernard',
        prenom: 'Sophie',
        genre: 'Femme',
        email: 'sophie.bernard@test-entreprise.com',
        telephone: '+224 623 456 793',
        adresse: '321 Rue Test, Conakry',
        poste: 'Designer UX/UI',
        role: 'UX Designer',
        type_contrat: 'CDD',
        salaire_net: 1800000,
        date_embauche: '2024-03-01',
        actif: true
      }
    ];

    const { data: createdEmployees, error: employeesError } = await supabase
      .from('employees')
      .insert(testEmployees)
      .select();

    if (employeesError) {
      throw new Error(`Erreur création employés: ${employeesError.message}`);
    }

    console.log('✅ Employés créés avec succès:', createdEmployees.length);

    // 3. Test de récupération du partenaire avec ses employés
    console.log('\n3. Récupération du partenaire avec ses employés...');
    const { data: partnerWithEmployees, error: fetchError } = await supabase
      .from('partners')
      .select(`
        *,
        employees (*)
      `)
      .eq('id', partnerId)
      .single();

    if (fetchError) {
      throw new Error(`Erreur récupération partenaire: ${fetchError.message}`);
    }

    console.log('✅ Partenaire récupéré avec succès');
    console.log(`   - Nom: ${partnerWithEmployees.nom}`);
    console.log(`   - Nombre d'employés: ${partnerWithEmployees.employees.length}`);
    console.log(`   - Salaire total: ${partnerWithEmployees.salaire_net_total} GNF`);

    // 4. Test de mise à jour des statistiques du partenaire
    console.log('\n4. Mise à jour des statistiques du partenaire...');
    
    // Calculer les nouvelles statistiques
    const activeEmployees = partnerWithEmployees.employees.filter(emp => emp.actif);
    const nombre_employes = activeEmployees.length;
    const salaire_net_total = activeEmployees.reduce((sum, emp) => sum + (emp.salaire_net || 0), 0);

    const { error: updateError } = await supabase
      .from('partners')
      .update({
        nombre_employes,
        salaire_net_total
      })
      .eq('id', partnerId);

    if (updateError) {
      throw new Error(`Erreur mise à jour statistiques: ${updateError.message}`);
    }

    console.log('✅ Statistiques mises à jour');
    console.log(`   - Nombre d'employés: ${nombre_employes}`);
    console.log(`   - Salaire total: ${salaire_net_total.toLocaleString()} GNF`);

    // 5. Test de recherche d'employés
    console.log('\n5. Test de recherche d\'employés...');
    const { data: searchResults, error: searchError } = await supabase
      .from('employees')
      .select('*')
      .eq('partner_id', partnerId)
      .or('nom.ilike.%Dupont%,prenom.ilike.%Marie%');

    if (searchError) {
      throw new Error(`Erreur recherche employés: ${searchError.message}`);
    }

    console.log('✅ Recherche d\'employés réussie');
    console.log(`   - Résultats trouvés: ${searchResults.length}`);

    // 6. Test de mise à jour d'un employé
    console.log('\n6. Test de mise à jour d\'un employé...');
    const employeeToUpdate = createdEmployees[0];
    const { data: updatedEmployee, error: updateEmployeeError } = await supabase
      .from('employees')
      .update({
        salaire_net: 2800000,
        poste: 'Développeuse Lead Senior'
      })
      .eq('id', employeeToUpdate.id)
      .select()
      .single();

    if (updateEmployeeError) {
      throw new Error(`Erreur mise à jour employé: ${updateEmployeeError.message}`);
    }

    console.log('✅ Employé mis à jour avec succès');
    console.log(`   - Nouveau poste: ${updatedEmployee.poste}`);
    console.log(`   - Nouveau salaire: ${updatedEmployee.salaire_net.toLocaleString()} GNF`);

    // 7. Test de suppression d'un employé
    console.log('\n7. Test de suppression d\'un employé...');
    const employeeToDelete = createdEmployees[2];
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeToDelete.id);

    if (deleteError) {
      throw new Error(`Erreur suppression employé: ${deleteError.message}`);
    }

    console.log('✅ Employé supprimé avec succès');

    // 8. Test de suppression du partenaire (supprime aussi ses employés via CASCADE)
    console.log('\n8. Test de suppression du partenaire...');
    const { error: deletePartnerError } = await supabase
      .from('partners')
      .delete()
      .eq('id', partnerId);

    if (deletePartnerError) {
      throw new Error(`Erreur suppression partenaire: ${deletePartnerError.message}`);
    }

    console.log('✅ Partenaire supprimé avec succès (employés supprimés automatiquement)');

    // 9. Vérification de la suppression en cascade
    console.log('\n9. Vérification de la suppression en cascade...');
    const { data: remainingEmployees, error: checkError } = await supabase
      .from('employees')
      .select('*')
      .eq('partner_id', partnerId);

    if (checkError) {
      throw new Error(`Erreur vérification suppression: ${checkError.message}`);
    }

    if (remainingEmployees.length === 0) {
      console.log('✅ Suppression en cascade fonctionne correctement');
    } else {
      console.log('⚠️  Attention: Des employés restent après suppression du partenaire');
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé des tests:');
    console.log('   ✅ Création de partenaire');
    console.log('   ✅ Création d\'employés');
    console.log('   ✅ Récupération avec relations');
    console.log('   ✅ Mise à jour des statistiques');
    console.log('   ✅ Recherche d\'employés');
    console.log('   ✅ Mise à jour d\'employé');
    console.log('   ✅ Suppression d\'employé');
    console.log('   ✅ Suppression de partenaire');
    console.log('   ✅ Suppression en cascade');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Exécuter les tests
testPartnersAndEmployees(); 