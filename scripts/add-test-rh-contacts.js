require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Contacts RH de test
const testRHContacts = [
  {
    email: 'rh.principal@zalama.com',
    display_name: 'Marie Dupont',
    role: 'rh',
    active: true
  },
  {
    email: 'responsable.hr@zalama.com',
    display_name: 'Jean Martin',
    role: 'responsable',
    active: true
  },
  {
    email: 'rh.assistant@zalama.com',
    display_name: 'Sophie Bernard',
    role: 'rh',
    active: true
  }
];

async function addTestRHContacts() {
  console.log('👥 Ajout de contacts RH de test...\n');

  try {
    console.log('1️⃣ Vérification de la connexion Supabase...');
    const { data: testConnection } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    console.log('✅ Connexion Supabase OK');

    console.log('\n2️⃣ Vérification des contacts RH existants...');
    const { data: existingContacts, error: listError } = await supabase
      .from('admin_users')
      .select('email, display_name, role, active')
      .in('role', ['rh', 'responsable']);

    if (listError) {
      console.error('❌ Erreur lors de la récupération des contacts:', listError);
    } else {
      console.log(`✅ ${existingContacts.length} contacts RH/Responsables existants`);
      existingContacts.forEach(contact => {
        console.log(`   - ${contact.display_name} (${contact.role}) - ${contact.email}`);
      });
    }

    console.log('\n3️⃣ Ajout de contacts RH de test...');
    let processedCount = 0;

    for (const contact of testRHContacts) {
      try {
        // Vérifier si le contact existe déjà
        const { data: existingContact } = await supabase
          .from('admin_users')
          .select('id, email')
          .eq('email', contact.email)
          .single();

        if (existingContact) {
          console.log(`⚠️ Contact ${contact.email} existe déjà, mise à jour...`);
          
          // Mettre à jour le contact existant
          const { data: updatedContact, error: updateError } = await supabase
            .from('admin_users')
            .update({
              display_name: contact.display_name,
              role: contact.role,
              active: contact.active
            })
            .eq('email', contact.email)
            .select();

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour de ${contact.email}:`, updateError);
          } else {
            console.log(`✅ Contact mis à jour: ${contact.display_name} (${contact.role})`);
            processedCount++;
          }
        } else {
          console.log(`➕ Ajout du contact ${contact.email}...`);
          
          // Ajouter le nouveau contact
          const { data: newContact, error: insertError } = await supabase
            .from('admin_users')
            .insert([contact])
            .select();

          if (insertError) {
            console.error(`❌ Erreur lors de l'ajout de ${contact.email}:`, insertError);
          } else {
            console.log(`✅ Contact ajouté: ${contact.display_name} (${contact.role})`);
            processedCount++;
          }
        }
      } catch (contactError) {
        console.error(`❌ Erreur pour le contact ${contact.email}:`, contactError);
      }
    }

    console.log('\n4️⃣ Vérification finale...');
    const { data: finalContacts, error: finalError } = await supabase
      .from('admin_users')
      .select('display_name, email, role, active')
      .in('role', ['rh', 'responsable'])
      .eq('active', true);

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log(`✅ ${finalContacts.length} contacts RH/Responsables actifs au total`);
      finalContacts.forEach(contact => {
        console.log(`   - ${contact.display_name} (${contact.role}) - ${contact.email}`);
      });
    }

    console.log(`\n🎉 Opération terminée ! ${processedCount} contacts traités.`);
    console.log('\n💡 Ces contacts recevront les notifications lors de l\'approbation de partenariats.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
addTestRHContacts(); 