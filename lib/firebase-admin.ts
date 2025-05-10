import * as admin from 'firebase-admin';

// Vérifier si Firebase Admin est déjà initialisé
if (!admin.apps.length) {
  try {
    // Initialiser avec les variables d'environnement
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
    
    console.log('Firebase Admin initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
  }
}

// Exporter les services Firebase Admin
export const auth = admin.auth();
// Utiliser une initialisation conditionnelle pour éviter les erreurs
let adminDb;
let adminStorage;

try {
  adminDb = admin.firestore();
  adminStorage = admin.storage();
} catch (error) {
  console.error('Erreur lors de l\'initialisation des services Firebase Admin:', error);
}

export { adminDb, adminStorage };
export default admin; 