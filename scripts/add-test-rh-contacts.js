const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestRHContacts() {
  console.log('👥 Ajout de contacts RH de test...\n');

  try {
    // Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError);
      return;
    }
    console.log('✅ Connexion Supabase OK\n');

    // Vérifier les contacts existants
    console.log('2️⃣ Vérification des contacts RH existants...');
    const { data: existingContacts, error: contactsError } = await supabase
      .from('admin_users')
      .select('display_name, email, role')
      .in('role', ['rh', 'responsable']);

    if (contactsError) {
      console.error('❌ Erreur lors de la vérification des contacts:', contactsError);
      return;
    }

    console.log(`✅ ${existingContacts?.length || 0} contacts RH/Responsables existants`);
    if (existingContacts && existingContacts.length > 0) {
      existingContacts.forEach(contact => {
        console.log(`   - ${contact.display_name} (${contact.role}) - ${contact.email}`);
      });
    }

    // Ajouter des contacts de test
    console.log('\n3️⃣ Ajout de contacts RH de test...');
    
    const testContacts = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'rh.principal@zalama.com',
        display_name: 'Marie Dupont',
        role: 'rh',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'responsable.hr@zalama.com',
        display_name: 'Jean Martin',
        role: 'responsable',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'rh.assistant@zalama.com',
        display_name: 'Sophie Bernard',
        role: 'rh',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    let addedCount = 0;
    for (const contact of testContacts) {
      try {
        // Vérifier si le contact existe déjà
        const { data: existingContact } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', contact.email)
          .single();

        if (existingContact) {
          console.log(`⚠️ Contact ${contact.email} existe déjà, mise à jour...`);
          
          const { data: updatedContact, error: updateError } = await supabase
            .from('admin_users')
            .update({
              display_name: contact.display_name,
              role: contact.role,
              active: contact.active,
              updated_at: new Date().toISOString()
            })
            .eq('email', contact.email)
            .select()
            .single();

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour de ${contact.email}:`, updateError);
          } else {
            console.log(`✅ Contact mis à jour: ${updatedContact.display_name} (${updatedContact.role})`);
            addedCount++;
          }
        } else {
          console.log(`➕ Ajout du contact: ${contact.display_name} (${contact.role})`);
          
          const { data: newContact, error: insertError } = await supabase
            .from('admin_users')
            .insert([contact])
            .select()
            .single();

          if (insertError) {
            console.error(`❌ Erreur lors de l'ajout de ${contact.email}:`, insertError);
          } else {
            console.log(`✅ Contact ajouté: ${newContact.display_name} (${newContact.role})`);
            addedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Erreur pour le contact ${contact.email}:`, error);
      }
    }

    // Vérifier le résultat final
    console.log('\n4️⃣ Vérification finale...');
    const { data: finalContacts, error: finalError } = await supabase
      .from('admin_users')
      .select('display_name, email, role, active')
      .in('role', ['rh', 'responsable'])
      .eq('active', true);

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log(`✅ ${finalContacts?.length || 0} contacts RH/Responsables actifs au total`);
      if (finalContacts && finalContacts.length > 0) {
        finalContacts.forEach(contact => {
          console.log(`   - ${contact.display_name} (${contact.role}) - ${contact.email}`);
        });
      }
    }

    console.log(`\n🎉 Opération terminée ! ${addedCount} contacts traités.`);
    console.log('\n💡 Ces contacts recevront les notifications lors de l\'approbation de partenariats.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
addTestRHContacts(); 