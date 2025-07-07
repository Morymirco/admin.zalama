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

// Simuler une demande de partenariat de test
const testRequest = {
  id: 'test-request-123',
  company_name: 'Entreprise Test SMS',
  rep_full_name: 'John Doe',
  hr_full_name: 'Jane Smith',
  email: 'test@example.com',
  phone: '+224623456789',
  activity_domain: 'Technologie',
  status: 'approved',
  created_at: new Date().toISOString()
};

async function testPartnershipNotifications() {
  console.log('🧪 Test des notifications partenariat (SMS + Email)...\n');

  try {
    // 1. Vérifier les contacts RH disponibles
    console.log('1️⃣ Vérification des contacts RH...');
    const { data: contacts, error: contactsError } = await supabase
      .from('admin_users')
      .select('display_name, email, role, active')
      .in('role', ['rh', 'responsable'])
      .eq('active', true);

    if (contactsError) {
      console.error('❌ Erreur lors de la récupération des contacts:', contactsError);
      return;
    }

    console.log(`✅ ${contacts.length} contacts RH/Responsables trouvés:`);
    contacts.forEach(contact => {
      const displayName = contact.display_name || '';
      const nameParts = displayName.split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';
      console.log(`   - ${prenom} ${nom} (${contact.role}): ${contact.email} - +224623456789`);
    });

    // 2. Tester l'envoi de SMS
    console.log('\n2️⃣ Test de l\'envoi de SMS...');
    // Utiliser un numéro de téléphone par défaut pour tous les contacts
    const phoneNumbers = contacts.map(() => '+224623456789');
    
    if (phoneNumbers.length > 0) {
      console.log(`📱 Envoi de SMS à ${phoneNumbers.length} contacts:`, phoneNumbers);
      
      // Simuler l'envoi de SMS via l'API route
      const smsData = {
        to: phoneNumbers,
        message: `🧪 TEST SMS: Demande de partenariat approuvée: ${testRequest.company_name} (${testRequest.activity_domain}). Contact: ${testRequest.rep_full_name} - ${testRequest.phone}. Email: ${testRequest.email}`,
        sender_name: 'ZaLaMa'
      };

      try {
        const response = await fetch('http://localhost:3000/api/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(smsData),
        });

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ SMS envoyé avec succès:', result);
      } catch (smsError) {
        console.error('❌ Erreur lors de l\'envoi de SMS:', smsError.message);
      }
    } else {
      console.log('⚠️ Aucun numéro de téléphone valide trouvé pour l\'envoi de SMS');
    }

    // 3. Tester l'envoi d'email
    console.log('\n3️⃣ Test de l\'envoi d\'email...');
    const emailData = {
      to: testRequest.email,
      subject: `🧪 TEST - Demande de partenariat approuvée - ${testRequest.company_name}`,
      html: `
        <h1>🧪 Test Email - Partenariat Approuvé</h1>
        <p>Ceci est un test d'envoi d'email pour la demande de partenariat :</p>
        <ul>
          <li><strong>Entreprise :</strong> ${testRequest.company_name}</li>
          <li><strong>Représentant :</strong> ${testRequest.rep_full_name}</li>
          <li><strong>Responsable RH :</strong> ${testRequest.hr_full_name}</li>
          <li><strong>Email :</strong> ${testRequest.email}</li>
          <li><strong>Téléphone :</strong> ${testRequest.phone}</li>
          <li><strong>Domaine d'activité :</strong> ${testRequest.activity_domain}</li>
        </ul>
        <p>Date du test : ${new Date().toLocaleString('fr-FR')}</p>
      `
    };

    try {
      const response = await fetch('http://localhost:3000/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Email envoyé avec succès:', result);
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi d\'email:', emailError.message);
    }

    // 4. Résumé du test
    console.log('\n📊 Résumé du test:');
    console.log(`   - Contacts RH/Responsables: ${contacts.length}`);
    console.log(`   - Numéros de téléphone valides: ${phoneNumbers.length}`);
    console.log(`   - Email de test: ${testRequest.email}`);
    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur générale lors du test:', error);
  }
}

// Exécuter le test
testPartnershipNotifications(); 