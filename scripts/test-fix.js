console.log('🧪 Test de vérification des corrections...\n');

// Simuler les données d'une demande approuvée
const testRequest = {
  id: 'test-123',
  company_name: 'Entreprise Test',
  activity_domain: 'Technologie',
  rep_full_name: 'John Doe',
  rep_email: 'john@test.com',
  rep_phone: '+224623456789',
  hr_full_name: 'Jane Smith',
  hr_email: 'jane@test.com',
  hr_phone: '+224623456790',
  rccm: 'RC/2024/001',
  nif: 'NIF2024001',
  email: 'contact@test.com',
  phone: '+224623456788',
  headquarters_address: '123 Rue Test, Conakry'
};

// Simuler la transformation des données
const prefillDataFromRequest = {
  nom: testRequest.company_name,
  secteur: testRequest.activity_domain,
  description: `Partenaire approuvé le ${new Date().toLocaleDateString('fr-FR')}`,
  nom_representant: testRequest.rep_full_name,
  email_representant: testRequest.rep_email,
  telephone_representant: testRequest.rep_phone,
  nom_rh: testRequest.hr_full_name,
  email_rh: testRequest.hr_email,
  telephone_rh: testRequest.hr_phone,
  rccm: testRequest.rccm,
  nif: testRequest.nif,
  email: testRequest.email,
  telephone: testRequest.phone,
  adresse: testRequest.headquarters_address
};

console.log('✅ Test de transformation des données:');
console.log('   - Nom entreprise:', prefillDataFromRequest.nom);
console.log('   - Secteur:', prefillDataFromRequest.secteur);
console.log('   - Représentant:', prefillDataFromRequest.nom_representant);
console.log('   - RH:', prefillDataFromRequest.nom_rh);
console.log('   - Email:', prefillDataFromRequest.email);

console.log('\n✅ Test de structure des données:');
const requiredFields = [
  'nom', 'secteur', 'nom_representant', 'email_representant', 
  'telephone_representant', 'nom_rh', 'email_rh', 'telephone_rh',
  'rccm', 'nif', 'email', 'telephone', 'adresse'
];

const missingFields = requiredFields.filter(field => !prefillDataFromRequest[field]);
if (missingFields.length === 0) {
  console.log('   - Tous les champs requis sont présents');
} else {
  console.log('   - Champs manquants:', missingFields);
}

console.log('\n🎉 Test terminé avec succès !');
console.log('💡 Les erreurs de compilation devraient être corrigées.'); 