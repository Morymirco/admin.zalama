// lib/email-template.ts

interface ZalamaEmailTemplateOptions {
  title: string;
  content: string;
  username?: string;
}

export function getZalamaEmailTemplate({ title, content, username }: ZalamaEmailTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="background-color: #ffffff; font-family: 'Roboto', sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 100%; margin: 20px auto; background-color: #ffffff; border: 4px solid #1e40af; border-radius: 16px;">
    <tr>
      <td style="background: linear-gradient(135deg, #1e3b8a 0%, #3b82f6 100%); padding: 15px; text-align: center; border-radius: 12px 12px 0 0;">
        <span style="color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: inline-block; padding: 8px 16px; background-color: rgba(0,0,0,0.1); border-radius: 8px;">ZaLaMa</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px; background-color: #f9fafb;">
        <h2 style="color: #1e3a8a; font-size: 28px; font-weight: 700; margin: 0 25px; border-bottom: 6px solid #3b82f6; padding-bottom: 12px; text-align: center; letter-spacing: 1px;">${title}</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
              Bonjour${username ? ` <span style=\"font-weight: bold; color: #1e40af;\">${username}</span>,` : ','}
            </td>
          </tr>
          ${content}
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #1e40af; padding: 25px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 15px 0; font-weight: 500;">ZaLaMa SAS - Merci pour votre confiance</p>
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 12px 30px; border-radius: 10px; border: 1px solid #ffffff;">
              <a href="mailto:contact@zalamagn.com" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Contactez-nous</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
} 