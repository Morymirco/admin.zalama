const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes !');
  console.log('📋 Assurez-vous d\'avoir configuré :');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addSamplePartners() {
  try {
    console.log('🚀 Ajout des partenaires de test...');
    
    const samplePartners = [
      {
        nom: 'TechCorp Solutions',
        type: 'Entreprise',
        secteur: 'Technologie',
        description: 'Entreprise spécialisée dans le développement logiciel et les solutions digitales innovantes',
        nom_representant: 'Mamadou Diallo',
        email_representant: 'mamadou.diallo@techcorp.com',
        telephone_representant: '+224 623 456 789',
        nom_rh: 'Fatoumata Camara',
        email_rh: 'fatoumata.camara@techcorp.com',
        telephone_rh: '+224 623 456 790',
        rccm: 'RC/2024/001',
        nif: 'NIF2024001',
        email: 'contact@techcorp.com',
        telephone: '+224 623 456 788',
        adresse: '123 Avenue de la République, Conakry',
        site_web: 'https://techcorp.com',
        logo_url: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=TC',
        actif: true,
        nombre_employes: 45,
        salaire_net_total: 12500000
      },
      {
        nom: 'EduPlus Institution',
        type: 'Institution',
        secteur: 'Éducation',
        description: 'Institution éducative de premier plan spécialisée dans la formation professionnelle',
        nom_representant: 'Aissatou Bah',
        email_representant: 'aissatou.bah@eduplus.edu',
        telephone_representant: '+224 623 456 791',
        nom_rh: 'Ousmane Barry',
        email_rh: 'ousmane.barry@eduplus.edu',
        telephone_rh: '+224 623 456 792',
        rccm: 'RC/2024/002',
        nif: 'NIF2024002',
        email: 'info@eduplus.edu',
        telephone: '+224 623 456 793',
        adresse: '456 Boulevard de l\'Education, Conakry',
        site_web: 'https://eduplus.edu',
        logo_url: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=EP',
        actif: true,
        nombre_employes: 28,
        salaire_net_total: 8500000
      },
      {
        nom: 'HealthCare Solutions',
        type: 'Organisation',
        secteur: 'Santé',
        description: 'Organisation de santé innovante dédiée à l\'amélioration des soins médicaux',
        nom_representant: 'Mariama Sow',
        email_representant: 'mariama.sow@healthcare.org',
        telephone_representant: '+224 623 456 794',
        nom_rh: 'Ibrahima Keita',
        email_rh: 'ibrahima.keita@healthcare.org',
        telephone_rh: '+224 623 456 795',
        rccm: 'RC/2024/003',
        nif: 'NIF2024003',
        email: 'contact@healthcare.org',
        telephone: '+224 623 456 796',
        adresse: '789 Rue de la Santé, Conakry',
        site_web: 'https://healthcare.org',
        logo_url: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=HC',
        actif: true,
        nombre_employes: 32,
        salaire_net_total: 9200000
      },
      {
        nom: 'FinancePlus Bank',
        type: 'Institution',
        secteur: 'Finance',
        description: 'Institution financière moderne offrant des services bancaires innovants',
        nom_representant: 'Kadiatou Diallo',
        email_representant: 'kadiatou.diallo@financeplus.bank',
        telephone_representant: '+224 623 456 797',
        nom_rh: 'Moussa Camara',
        email_rh: 'moussa.camara@financeplus.bank',
        telephone_rh: '+224 623 456 798',
        rccm: 'RC/2024/004',
        nif: 'NIF2024004',
        email: 'contact@financeplus.bank',
        telephone: '+224 623 456 799',
        adresse: '321 Avenue des Finances, Conakry',
        site_web: 'https://financeplus.bank',
        logo_url: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=FP',
        actif: true,
        nombre_employes: 67,
        salaire_net_total: 18500000
      },
      {
        nom: 'GreenTech Innovations',
        type: 'Entreprise',
        secteur: 'Environnement',
        description: 'Entreprise innovante spécialisée dans les technologies vertes et le développement durable',
        nom_representant: 'Fatou Bah',
        email_representant: 'fatou.bah@greentech.eco',
        telephone_representant: '+224 623 456 800',
        nom_rh: 'Alpha Barry',
        email_rh: 'alpha.barry@greentech.eco',
        telephone_rh: '+224 623 456 801',
        rccm: 'RC/2024/005',
        nif: 'NIF2024005',
        email: 'info@greentech.eco',
        telephone: '+224 623 456 802',
        adresse: '654 Rue de l\'Environnement, Conakry',
        site_web: 'https://greentech.eco',
        logo_url: 'https://via.placeholder.com/150x150/059669/FFFFFF?text=GT',
        actif: false,
        nombre_employes: 15,
        salaire_net_total: 4200000
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const partnerData of samplePartners) {
      try {
        const { data, error } = await supabase
          .from('partners')
          .insert([partnerData])
          .select()
          .single();

        if (error) {
          console.log(`❌ Erreur pour ${partnerData.nom}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ ${partnerData.nom} ajouté avec succès (ID: ${data.id})`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Erreur pour ${partnerData.nom}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Résumé de l\'ajout des partenaires :');
    console.log(`✅ Partenaires ajoutés avec succès : ${successCount}`);
    console.log(`❌ Erreurs : ${errorCount}`);
    console.log(`📋 Total traité : ${samplePartners.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Partenaires de test ajoutés avec succès !');
      console.log('📋 Vous pouvez maintenant tester les fonctionnalités CRUD des partenaires');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des partenaires:', error);
  }
}

// Exécuter le script
addSamplePartners(); 