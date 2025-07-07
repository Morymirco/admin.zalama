const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPartnershipNotificationsSimple() {
  console.log('🧪 Test simplifié des notifications de partenariat...\n');

  try {
    // 1. Vérifier la connexion Supabase
    console.log('1️⃣ Vérification de la connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('partnership_requests')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError);
      return;
    }
    console.log('✅ Connexion Supabase OK\n');

    // 2. Récupérer une demande de partenariat existante
    console.log('2️⃣ Récupération d\'une demande de partenariat...');
    const { data: requests, error: requestsError } = await supabase
      .from('partnership_requests')
      .select('*')
      .limit(5);

    if (requestsError) {
      console.error('❌ Erreur lors de la récupération des demandes:', requestsError);
      return;
    }

    if (!requests || requests.length === 0) {
      console.log('⚠️ Aucune demande de partenariat trouvée');
      console.log('💡 Créons une demande de test...');
      
      // Créer une demande de test
      const testRequest = {
        company_name: 'Entreprise Test Notifications',
        legal_status: 'SARL',
        rccm: 'RC123456789',
        nif: 'NIF123456789',
        activity_domain: 'Technologie',
        headquarters_address: '123 Rue Test, Conakry',
        phone: '+224123456789',
        email: 'test@example.com',
        employees_count: 50,
        payroll: '50000000',
        cdi_count: 30,
        cdd_count: 20,
        payment_date: '2024-01-15',
        rep_full_name: 'John Doe',
        rep_position: 'Directeur',
        rep_email: 'john.doe@example.com',
        rep_phone: '+224123456789',
        hr_full_name: 'Jane Smith',
        hr_email: 'jane.smith@example.com',
        hr_phone: '+224987654321',
        agreement: true,
        status: 'pending'
      };

      const { data: newRequest, error: createError } = await supabase
        .from('partnership_requests')
        .insert([testRequest])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur lors de la création de la demande de test:', createError);
        return;
      }

      console.log('✅ Demande de test créée:', newRequest.id);
      requests.push(newRequest);
    }

    const testRequest = requests[0];
    console.log('✅ Demande trouvée:', testRequest.company_name, `(ID: ${testRequest.id})\n`);

    // 3. Vérifier les contacts RH et responsables
    console.log('3️⃣ Vérification des contacts RH et responsables...');
    const { data: adminContacts, error: contactsError } = await supabase
      .from('admin_users')
      .select('display_name, email, role')
      .in('role', ['rh', 'responsable', 'manager'])
      .eq('active', true);

    if (contactsError) {
      console.error('❌ Erreur lors de la récupération des contacts:', contactsError);
    } else {
      console.log(`✅ ${adminContacts?.length || 0} contacts RH/Responsables trouvés`);
      if (adminContacts && adminContacts.length > 0) {
        adminContacts.forEach(contact => {
          console.log(`   - ${contact.display_name} (${contact.role}) - ${contact.email}`);
        });
      } else {
        console.log('⚠️ Aucun contact RH/Responsable trouvé');
        console.log('💡 Créons un contact de test...');
        
        // Créer un contact de test
        const testContact = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'rh.test@zalama.com',
          display_name: 'RH Test',
          role: 'rh',
          active: true
        };

        const { data: newContact, error: createContactError } = await supabase
          .from('admin_users')
          .insert([testContact])
          .select()
          .single();

        if (createContactError) {
          console.error('❌ Erreur lors de la création du contact de test:', createContactError);
        } else {
          console.log('✅ Contact de test créé:', newContact.display_name);
          adminContacts.push(newContact);
        }
      }
    }
    console.log('');

    // 4. Vérifier les variables d'environnement
    console.log('4️⃣ Vérification des variables d\'environnement...');
    const requiredEnvVars = [
      'RESEND_API_KEY',
      'NIMBA_SMS_API_KEY',
      'NIMBA_SMS_SENDER_NAME'
    ];

    let envVarsOk = true;
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`   ✅ ${envVar}: Configuré`);
      } else {
        console.log(`   ❌ ${envVar}: Non configuré`);
        envVarsOk = false;
      }
    });

    if (!envVarsOk) {
      console.log('\n⚠️ Certaines variables d\'environnement ne sont pas configurées');
      console.log('💡 Les notifications peuvent ne pas fonctionner correctement');
    }
    console.log('');

    // 5. Simuler l'approbation
    console.log('5️⃣ Simulation de l\'approbation...');
    
    // Remettre le statut en pending pour le test
    await supabase
      .from('partnership_requests')
      .update({ status: 'pending' })
      .eq('id', testRequest.id);

    console.log('🔄 Test d\'approbation...');
    const { data: approvedRequest, error: approvalError } = await supabase
      .from('partnership_requests')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', testRequest.id)
      .select()
      .single();

    if (approvalError) {
      console.error('❌ Erreur lors de l\'approbation:', approvalError);
    } else {
      console.log('✅ Demande approuvée avec succès');
      console.log('   Statut:', approvedRequest.status);
      console.log('   Entreprise:', approvedRequest.company_name);
      console.log('   Représentant:', approvedRequest.rep_full_name);
      console.log('   Email:', approvedRequest.email);
    }

    // 6. Afficher les informations pour les tests manuels
    console.log('\n6️⃣ Informations pour les tests manuels :');
    console.log('📧 Email du partenaire:', testRequest.email);
    console.log('📱 Téléphone du partenaire:', testRequest.phone);
    console.log('🏢 Entreprise:', testRequest.company_name);
    console.log('👤 Représentant:', testRequest.rep_full_name);
    console.log('👥 Responsable RH:', testRequest.hr_full_name);
    
    if (adminContacts && adminContacts.length > 0) {
      console.log('\n📧 Contacts admin à notifier :');
      adminContacts.forEach(contact => {
        console.log(`   - ${contact.display_name} (${contact.role}): ${contact.email}`);
      });
    }

    console.log('\n🎉 Test terminé !');
    console.log('\n💡 Pour tester les notifications complètes :');
    console.log('   1. Aller sur /dashboard/partenaires');
    console.log('   2. Approuver une demande de partenariat');
    console.log('   3. Vérifier les logs dans la console');
    console.log('   4. Vérifier les emails et SMS reçus');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testPartnershipNotificationsSimple(); 