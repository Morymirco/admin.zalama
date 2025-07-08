const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPartnerCreation() {
  console.log('🧪 Test de création de partenaire');
  
  try {
    // 1. Compter les partenaires avant création
    console.log('\n📊 1. Nombre de partenaires avant création...');
    const { data: partenairesAvant, error: errorAvant } = await supabase
      .from('partenaires')
      .select('id, nom, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (errorAvant) {
      console.error('❌ Erreur lors du comptage:', errorAvant);
      return;
    }
    
    console.log(`✅ ${partenairesAvant.length} partenaires trouvés`);
    console.log('📋 Derniers partenaires:', partenairesAvant.map(p => ({ id: p.id, nom: p.nom, date: p.created_at })));
    
    // 2. Créer un partenaire de test
    console.log('\n🚀 2. Création d\'un partenaire de test...');
    const testPartnerData = {
      nom: `Test Partner ${Date.now()}`,
      type: 'Entreprise',
      secteur: 'Technologie',
      description: 'Partenaire de test pour vérification',
      email: 'test@example.com',
      telephone: '+224623456789',
      adresse: '123 Test Street',
      site_web: 'https://test.com',
      actif: true,
      nom_representant: 'John Test',
      email_representant: 'john@test.com',
      telephone_representant: '+224623456790',
      nom_rh: 'Jane Test',
      email_rh: 'jane@test.com',
      telephone_rh: '+224623456791',
      rccm: 'RC/TEST/001',
      nif: 'NIFTEST001',
      nombre_employes: 10,
      salaire_net_total: 5000000,
      date_adhesion: new Date().toISOString().split('T')[0]
    };
    
    const { data: nouveauPartenaire, error: errorCreation } = await supabase
      .from('partenaires')
      .insert([testPartnerData])
      .select()
      .single();
    
    if (errorCreation) {
      console.error('❌ Erreur lors de la création:', errorCreation);
      return;
    }
    
    console.log('✅ Partenaire créé avec succès:', {
      id: nouveauPartenaire.id,
      nom: nouveauPartenaire.nom,
      date: nouveauPartenaire.created_at
    });
    
    // 3. Vérifier que le partenaire apparaît dans la liste
    console.log('\n🔍 3. Vérification de l\'apparition dans la liste...');
    const { data: partenairesApres, error: errorApres } = await supabase
      .from('partenaires')
      .select('id, nom, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (errorApres) {
      console.error('❌ Erreur lors de la vérification:', errorApres);
      return;
    }
    
    console.log(`✅ ${partenairesApres.length} partenaires trouvés après création`);
    console.log('📋 Derniers partenaires:', partenairesApres.map(p => ({ id: p.id, nom: p.nom, date: p.created_at })));
    
    // 4. Vérifier que le nouveau partenaire est en premier
    const nouveauPartenaireDansListe = partenairesApres.find(p => p.id === nouveauPartenaire.id);
    if (nouveauPartenaireDansListe) {
      console.log('✅ Le nouveau partenaire apparaît bien dans la liste');
      if (partenairesApres[0].id === nouveauPartenaire.id) {
        console.log('✅ Le nouveau partenaire est bien en première position');
      } else {
        console.log('⚠️ Le nouveau partenaire n\'est pas en première position');
      }
    } else {
      console.log('❌ Le nouveau partenaire n\'apparaît pas dans la liste');
    }
    
    // 5. Nettoyer - Supprimer le partenaire de test
    console.log('\n🧹 4. Nettoyage - Suppression du partenaire de test...');
    const { error: errorSuppression } = await supabase
      .from('partenaires')
      .delete()
      .eq('id', nouveauPartenaire.id);
    
    if (errorSuppression) {
      console.error('❌ Erreur lors de la suppression:', errorSuppression);
    } else {
      console.log('✅ Partenaire de test supprimé');
    }
    
    console.log('\n🎉 Test terminé avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Exécuter le test
testPartnerCreation(); 