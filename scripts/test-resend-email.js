#!/usr/bin/env node

const { getZalamaEmailTemplate } = require('../lib/email-template');
const { Resend } = require('resend');

// À personnaliser :
const TO_EMAIL = process.env.TEST_EMAIL || 'votre.email@exemple.com';
const FROM_EMAIL = 'ZaLaMa <noreply@zalamagn.com>';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY manquant dans les variables d\'environnement');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

async function sendTestEmail() {
  const subject = 'ZaLaMa - Test du template email professionnel';
  const html = getZalamaEmailTemplate({
    title: 'Test du template ZaLaMa',
    username: 'Fassou Haba',
    content: `
      <tr>
        <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
          Ceci est un <strong>email de test</strong> envoyé via <span style='color: #3b82f6; font-weight: bold;'>Resend</span> avec le design ZaLaMa.<br><br>
          Vous pouvez vérifier le rendu, les couleurs et la structure.<br>
          <strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}
        </td>
      </tr>
    `
  });

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html
    });
    console.log('✅ Email envoyé avec succès !');
    console.log('ID:', result.data?.id);
    console.log('Détail:', result);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email :', error);
  }
}

sendTestEmail(); 