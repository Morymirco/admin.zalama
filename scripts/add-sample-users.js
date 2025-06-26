const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Données d'utilisateurs de test
const sampleUsers = [
  {
    display_name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone_number: '+224123456789',
    role: 'user',
    poste: 'Développeur',
    departement: 'IT',
    active: true,
    type: 'salaries',
    partenaire_id: 'partenaire-1',
    photo_url: '',
    etablissement: '',
    niveau_etudes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    display_name: 'Marie Martin',
    email: 'marie.martin@example.com',
    phone_number: '+224987654321',
    role: 'admin',
    poste: 'Chef de projet',
    departement: 'Management',
    active: true,
    type: 'salaries',
    partenaire_id: 'partenaire-1',
    photo_url: '',
    etablissement: '',
    niveau_etudes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    display_name: 'Pierre Durand',
    email: 'pierre.durand@universite.edu',
    phone_number: '+224555666777',
    role: 'user',
    poste: 'Étudiant',
    departement: '',
    active: true,
    type: 'etudiant',
    partenaire_id: '',
    photo_url: '',
    etablissement: 'Université de Conakry',
    niveau_etudes: 'Master',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    display_name: 'Sophie Bernard',
    email: 'sophie.bernard@universite.edu',
    phone_number: '+224111222333',
    role: 'user',
    poste: 'Étudiante',
    departement: '',
    active: true,
    type: 'etudiant',
    partenaire_id: '',
    photo_url: '',
    etablissement: 'Université de Conakry',
    niveau_etudes: 'Licence',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    display_name: 'Robert Petit',
    email: 'robert.petit@retraite.com',
    phone_number: '+224444555666',
    role: 'user',
    poste: 'Retraité',
    departement: '',
    active: true,
    type: 'pension',
    partenaire_id: '',
    photo_url: '',
    etablissement: '',
    niveau_etudes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    display_name: 'Claire Moreau',
    email: 'claire.moreau@retraite.com',
    phone_number: '+224777888999',
    role: 'user',
    poste: 'Retraitée',
    departement: '',
    active: false,
    type: 'pension',
    partenaire_id: '',
    photo_url: '',
    etablissement: '',
    niveau_etudes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    display_name: 'Thomas Leroy',
    email: 'thomas.leroy@entreprise.com',
    phone_number: '+224000111222',
    role: 'rh',
    poste: 'Responsable RH',
    departement: 'RH',
    active: true,
    type: 'salaries',
    partenaire_id: 'partenaire-2',
    photo_url: '',
    etablissement: '',
    niveau_etudes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    display_name: 'Nathalie Roux',
    email: 'nathalie.roux@entreprise.com',
    phone_number: '+224333444555',
    role: 'responsable',
    poste: 'Directrice Générale',
    departement: 'Direction',
    active: true,
    type: 'salaries',
    partenaire_id: 'partenaire-2',
    photo_url: '',
    etablissement: '',
    niveau_etudes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function addSampleUsers() {
  console.log('🚀 Ajout d\'utilisateurs de test dans Supabase\n');

  try {
    // Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion Supabase...');
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Erreur de connexion:', checkError.message);
      return;
    }

    console.log('✅ Connexion Supabase réussie\n');

    // Ajouter les utilisateurs
    console.log('2️⃣ Ajout des utilisateurs de test...');
    
    for (const user of sampleUsers) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([user])
          .select();

        if (error) {
          console.error(`❌ Erreur lors de l'ajout de ${user.display_name}:`, error.message);
        } else {
          console.log(`✅ Utilisateur ajouté: ${user.display_name} (${user.email})`);
        }
      } catch (insertError) {
        console.error(`❌ Erreur lors de l'ajout de ${user.display_name}:`, insertError.message);
      }
    }

    // Vérifier le résultat
    console.log('\n3️⃣ Vérification du résultat...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Erreur lors de la vérification:', finalError.message);
    } else {
      console.log(`✅ Total d'utilisateurs dans la base: ${finalUsers.length}`);
      
      // Afficher les statistiques
      const actifs = finalUsers.filter(u => u.active).length;
      const inactifs = finalUsers.length - actifs;
      const parType = finalUsers.reduce((acc, user) => {
        const type = user.type || 'Non défini';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      console.log(`   - Actifs: ${actifs}`);
      console.log(`   - Inactifs: ${inactifs}`);
      console.log('   - Par type:');
      Object.entries(parType).forEach(([type, count]) => {
        console.log(`     * ${type}: ${count}`);
      });
    }

    console.log('\n🎉 Ajout d\'utilisateurs terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le script
addSampleUsers(); 