const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Données d'utilisateurs de test
const sampleUsers = [
  {
    email: 'mariam.diallo@student.univ.com',
    nom: 'Diallo',
    prenom: 'Mariam',
    telephone: '+224 623 456 789',
    adresse: 'Conakry, Kaloum',
    type: 'Étudiant',
    statut: 'Actif',
    actif: true,
    etablissement: 'Université de Conakry',
    niveau_etudes: 'Licence 2',
    date_inscription: new Date().toISOString()
  },
  {
    email: 'ahmed.toure@student.univ.com',
    nom: 'Touré',
    prenom: 'Ahmed',
    telephone: '+224 624 567 890',
    adresse: 'Conakry, Ratoma',
    type: 'Étudiant',
    statut: 'Actif',
    actif: true,
    etablissement: 'Université Gamal Abdel Nasser',
    niveau_etudes: 'Master 1',
    date_inscription: new Date().toISOString()
  },
  {
    email: 'fatou.camara@student.univ.com',
    nom: 'Camara',
    prenom: 'Fatou',
    telephone: '+224 625 678 901',
    adresse: 'Conakry, Dixinn',
    type: 'Étudiant',
    statut: 'En attente',
    actif: true,
    etablissement: 'Institut Supérieur de Technologie',
    niveau_etudes: 'Licence 3',
    date_inscription: new Date().toISOString()
  },
  {
    email: 'moussa.barry@entreprise.com',
    nom: 'Barry',
    prenom: 'Moussa',
    telephone: '+224 626 789 012',
    adresse: 'Conakry, Almamya',
    type: 'Salarié',
    statut: 'Actif',
    actif: true,
    organisation: 'Société Minière de Guinée',
    poste: 'Ingénieur Géologue',
    date_inscription: new Date().toISOString()
  },
  {
    email: 'aissatou.balde@entreprise.com',
    nom: 'Baldé',
    prenom: 'Aissatou',
    telephone: '+224 627 890 123',
    adresse: 'Conakry, Matam',
    type: 'Salarié',
    statut: 'Actif',
    actif: true,
    organisation: 'Banque Internationale pour le Commerce',
    poste: 'Analyste Financier',
    date_inscription: new Date().toISOString()
  },
  {
    email: 'contact@techguinee.com',
    nom: 'Tech Guinée',
    prenom: 'SARL',
    telephone: '+224 628 901 234',
    adresse: 'Conakry, Kaloum, Rue du Commerce',
    type: 'Entreprise',
    statut: 'Actif',
    actif: true,
    organisation: 'Tech Guinée SARL',
    poste: 'Entreprise',
    date_inscription: new Date().toISOString()
  },
  {
    email: 'info@agroplus.com',
    nom: 'Agro Plus',
    prenom: 'SA',
    telephone: '+224 629 012 345',
    adresse: 'Kankan, Route Nationale',
    type: 'Entreprise',
    statut: 'Actif',
    actif: true,
    organisation: 'Agro Plus SA',
    poste: 'Entreprise',
    date_inscription: new Date().toISOString()
  }
];

async function addSampleUsers() {
  console.log('🚀 Ajout d\'utilisateurs de test...\n');

  try {
    // Vérifier d'abord s'il y a déjà des utilisateurs
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Erreur lors de la vérification des utilisateurs existants:', checkError);
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️  Des utilisateurs existent déjà dans la base de données.');
      console.log('   Pour ajouter de nouveaux utilisateurs de test, supprimez d\'abord les existants.');
      return;
    }

    // Ajouter les utilisateurs de test
    console.log(`📝 Ajout de ${sampleUsers.length} utilisateurs de test...`);
    
    const { data: insertedUsers, error: insertError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de l\'ajout des utilisateurs:', insertError);
      return;
    }

    console.log('✅ Utilisateurs ajoutés avec succès!');
    console.log(`📊 ${insertedUsers.length} utilisateurs créés:`);

    insertedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.prenom} ${user.nom} (${user.type}) - ${user.email}`);
    });

    // Afficher les statistiques
    const stats = {
      total: insertedUsers.length,
      etudiants: insertedUsers.filter(u => u.type === 'Étudiant').length,
      salaries: insertedUsers.filter(u => u.type === 'Salarié').length,
      entreprises: insertedUsers.filter(u => u.type === 'Entreprise').length,
      actifs: insertedUsers.filter(u => u.actif).length
    };

    console.log('\n📈 Statistiques:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Étudiants: ${stats.etudiants}`);
    console.log(`   Salariés: ${stats.salaries}`);
    console.log(`   Entreprises: ${stats.entreprises}`);
    console.log(`   Actifs: ${stats.actifs}`);

    console.log('\n🎉 Utilisateurs de test ajoutés avec succès!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
addSampleUsers(); 