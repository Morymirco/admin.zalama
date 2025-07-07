const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPartnershipNotifications() {
  console.log('🧪 Test des notifications de partenariat...\n');

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
        rep_full_name: 'John Doe',
        hr_full_name: 'Jane Smith',
        email: 'test@example.com',
        phone: '+224123456789',
        activity_domain: 'Technologie',
        status: 'pending',
        description: 'Demande de test pour les notifications'
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
      .select('nom, prenom, email, telephone, role')
      .in('role', ['rh', 'responsable', 'manager'])
      .eq('active', true);

    if (contactsError) {
      console.error('❌ Erreur lors de la récupération des contacts:', contactsError);
    } else {
      console.log(`✅ ${adminContacts?.length || 0} contacts RH/Responsables trouvés`);
      if (adminContacts && adminContacts.length > 0) {
        adminContacts.forEach(contact => {
          console.log(`   - ${contact.prenom} ${contact.nom} (${contact.role}) - ${contact.email}`);
        });
      }
    }
    console.log('');

    // 4. Simuler l'approbation et les notifications
    console.log('4️⃣ Simulation de l\'approbation et des notifications...');
    
    // Importer le service de notification
    const partnershipNotificationService = require('../services/partnershipNotificationService.ts');
    
    try {
      const notificationResult = await partnershipNotificationService.sendApprovalNotifications(testRequest.id);
      
      console.log('📊 Résultats des notifications:');
      console.log('   Succès global:', notificationResult.success ? '✅' : '❌');
      
      if (notificationResult.details) {
        console.log('   SMS:', notificationResult.details.sms?.success ? '✅' : '❌');
        if (notificationResult.details.sms?.error) {
          console.log('      Erreur SMS:', notificationResult.details.sms.error);
        }
        
        console.log('   Email:', notificationResult.details.email?.success ? '✅' : '❌');
        if (notificationResult.details.email?.error) {
          console.log('      Erreur Email:', notificationResult.details.email.error);
        }
      }
      
      if (notificationResult.error) {
        console.log('   Erreur générale:', notificationResult.error);
      }
      
    } catch (notificationError) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', notificationError);
    }

    // 5. Vérifier les variables d'environnement
    console.log('\n5️⃣ Vérification des variables d\'environnement...');
    const requiredEnvVars = [
      'RESEND_API_KEY',
      'NIMBA_SMS_API_KEY',
      'NIMBA_SMS_SENDER_NAME'
    ];

    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`   ✅ ${envVar}: Configuré`);
      } else {
        console.log(`   ❌ ${envVar}: Non configuré`);
      }
    });

    // 6. Test du service de partenariat
    console.log('\n6️⃣ Test du service de partenariat...');
    const partnershipRequestService = require('../services/partnershipRequestService.ts');
    
    try {
      // Remettre le statut en pending pour le test
      await supabase
        .from('partnership_requests')
        .update({ status: 'pending' })
        .eq('id', testRequest.id);

      console.log('🔄 Test d\'approbation avec notifications...');
      const approvedRequest = await partnershipRequestService.approve(testRequest.id);
      
      console.log('✅ Demande approuvée avec succès');
      console.log('   Statut:', approvedRequest.status);
      console.log('   Entreprise:', approvedRequest.company_name);
      
    } catch (approvalError) {
      console.error('❌ Erreur lors de l\'approbation:', approvalError);
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testPartnershipNotifications(); 