const fetch = require('node-fetch');

// Configuration
const SERVER_URL = 'http://localhost:3003';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ Erreur: RESEND_API_KEY n\'est pas définie dans les variables d\'environnement');
  console.log('💡 Ajoutez RESEND_API_KEY=your_api_key à votre fichier .env');
  process.exit(1);
}

if (!TEST_EMAIL || TEST_EMAIL === 'test@example.com') {
  console.error('❌ Erreur: TEST_EMAIL n\'est pas définie ou utilise la valeur par défaut');
  console.log('💡 Ajoutez TEST_EMAIL=your_email@example.com à votre fichier .env');
  process.exit(1);
}

console.log('🚀 Test des emails marketing avec template ZaLaMa');
console.log(`📧 Email de test: ${TEST_EMAIL}`);
console.log(`🌐 Serveur: ${SERVER_URL}`);
console.log('');

// Test 1: Email marketing personnalisé
async function testCustomMarketingEmail() {
  console.log('📧 Test 1: Email marketing personnalisé');
  
  try {
    const response = await fetch(`${SERVER_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [TEST_EMAIL],
        subject: 'Test Email Marketing ZaLaMa - Message Personnalisé',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Email Marketing ZaLaMa</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header ZaLaMa -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <div style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px;">
                  ZaLaMa
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 16px;">
                  Votre partenaire de confiance
                </div>
              </div>
              
              <!-- Contenu principal -->
              <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">📧</div>
                  <h1 style="color: #6366F1; margin: 0; font-size: 24px; font-weight: 600;">
                    Message ZaLaMa
                  </h1>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <div style="color: #374151; line-height: 1.6; font-size: 16px;">
                    Ceci est un test d'email marketing avec le template ZaLaMa professionnel.<br><br>
                    <strong>Fonctionnalités testées:</strong><br>
                    ✅ Template responsive<br>
                    ✅ Design professionnel<br>
                    ✅ Couleurs ZaLaMa<br>
                    ✅ Formatage automatique<br><br>
                    L'email a été envoyé avec succès via le système de marketing ZaLaMa.
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Ce message a été envoyé par le système de marketing ZaLaMa.<br>
                    Pour toute question, contactez notre équipe support.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                  © 2024 ZaLaMa. Tous droits réservés.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: 'Test Email Marketing ZaLaMa - Message Personnalisé\n\nCeci est un test d\'email marketing avec le template ZaLaMa professionnel.'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email marketing personnalisé envoyé avec succès');
      console.log(`📊 ID: ${result.id || 'N/A'}`);
    } else {
      console.log('❌ Erreur lors de l\'envoi:', result.error);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  console.log('');
}

// Test 2: Email newsletter
async function testNewsletterEmail() {
  console.log('📰 Test 2: Email newsletter');
  
  try {
    const response = await fetch(`${SERVER_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [TEST_EMAIL],
        subject: 'Newsletter ZaLaMa - Janvier 2024',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Newsletter ZaLaMa</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header ZaLaMa -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <div style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px;">
                  ZaLaMa
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 16px;">
                  Votre partenaire de confiance
                </div>
              </div>
              
              <!-- Contenu principal -->
              <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">📰</div>
                  <h1 style="color: #3B82F6; margin: 0; font-size: 24px; font-weight: 600;">
                    Newsletter ZaLaMa
                  </h1>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <div style="color: #374151; line-height: 1.6; font-size: 16px;">
                    <h2 style="color: #1f2937; margin-top: 0;">📈 Nouvelles fonctionnalités</h2>
                    <p>Nous sommes ravis de vous présenter les dernières améliorations de notre plateforme ZaLaMa :</p>
                    <ul>
                      <li>🎯 Interface utilisateur améliorée</li>
                      <li>📱 Application mobile optimisée</li>
                      <li>🔒 Sécurité renforcée</li>
                      <li>⚡ Performance accrue</li>
                    </ul>
                    <p><strong>Restez connectés pour plus d'actualités !</strong></p>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Ce message a été envoyé par le système de marketing ZaLaMa.<br>
                    Pour toute question, contactez notre équipe support.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                  © 2024 ZaLaMa. Tous droits réservés.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: 'Newsletter ZaLaMa - Janvier 2024\n\nNouvelles fonctionnalités:\n- Interface utilisateur améliorée\n- Application mobile optimisée\n- Sécurité renforcée\n- Performance accrue'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email newsletter envoyé avec succès');
      console.log(`📊 ID: ${result.id || 'N/A'}`);
    } else {
      console.log('❌ Erreur lors de l\'envoi:', result.error);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  console.log('');
}

// Test 3: Email promotion
async function testPromotionEmail() {
  console.log('🎉 Test 3: Email promotion');
  
  try {
    const response = await fetch(`${SERVER_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [TEST_EMAIL],
        subject: '🎉 Offre Spéciale ZaLaMa - 20% de réduction !',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offre Spéciale ZaLaMa</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header ZaLaMa -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <div style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px;">
                  ZaLaMa
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 16px;">
                  Votre partenaire de confiance
                </div>
              </div>
              
              <!-- Contenu principal -->
              <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                  <h1 style="color: #10B981; margin: 0; font-size: 24px; font-weight: 600;">
                    Offre Spéciale ZaLaMa
                  </h1>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <div style="color: #374151; line-height: 1.6; font-size: 16px; text-align: center;">
                    <h2 style="color: #10B981; margin-top: 0;">🎯 OFFRE LIMITÉE</h2>
                    <div style="background: #10B981; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <div style="font-size: 32px; font-weight: bold;">20% DE RÉDUCTION</div>
                      <div style="font-size: 16px;">sur tous nos services premium</div>
                    </div>
                    <p><strong>Valable jusqu'au 31 janvier 2024</strong></p>
                    <p>Profitez de cette offre exceptionnelle pour optimiser votre gestion d'entreprise avec ZaLaMa !</p>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Ce message a été envoyé par le système de marketing ZaLaMa.<br>
                    Pour toute question, contactez notre équipe support.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                  © 2024 ZaLaMa. Tous droits réservés.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: '🎉 Offre Spéciale ZaLaMa - 20% de réduction !\n\nOFFRE LIMITÉE\n20% DE RÉDUCTION sur tous nos services premium\nValable jusqu\'au 31 janvier 2024'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email promotion envoyé avec succès');
      console.log(`📊 ID: ${result.id || 'N/A'}`);
    } else {
      console.log('❌ Erreur lors de l\'envoi:', result.error);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  console.log('');
}

// Exécution des tests
async function runTests() {
  console.log('🔄 Démarrage des tests...\n');
  
  await testCustomMarketingEmail();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
  
  await testNewsletterEmail();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
  
  await testPromotionEmail();
  
  console.log('✅ Tous les tests terminés !');
  console.log(`📧 Vérifiez votre boîte email: ${TEST_EMAIL}`);
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await fetch(`${SERVER_URL}/api/health`);
    const result = await response.json();
    
    if (result.status === 'ok') {
      console.log('✅ Serveur accessible');
      return true;
    } else {
      console.log('❌ Serveur non accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log(`💡 Assurez-vous que le serveur tourne sur ${SERVER_URL}`);
    return false;
  }
}

// Point d'entrée
async function main() {
  const serverOk = await checkServer();
  if (!serverOk) {
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error); 