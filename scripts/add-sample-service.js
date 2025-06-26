const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Configuration Firebase (à adapter selon votre configuration)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleService() {
  try {
    const serviceData = {
      nom: "Avance sur salaire",
      description: "Service permettant aux employés de recevoir une partie de leur salaire avant la date de paiement officielle, en cas de besoin urgent. L'avance est remboursée automatiquement lors du versement du salaire.",
      categorie: "Finances / Services aux employés",
      fraisAttribues: 15000, // 15 000 FG
      pourcentageMax: 30, // 30% du salaire
      duree: "24-48 heures",
      disponible: true,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'services'), serviceData);
    console.log('✅ Service "Avance sur salaire" ajouté avec succès !');
    console.log('📄 ID du document:', docRef.id);
    console.log('📋 Détails du service:');
    console.log('   - Nom:', serviceData.nom);
    console.log('   - Catégorie:', serviceData.categorie);
    console.log('   - Frais:', serviceData.fraisAttribues.toLocaleString(), 'FG');
    console.log('   - Statut:', serviceData.disponible ? 'Disponible' : 'Indisponible');
    console.log('   - Date de création:', serviceData.createdAt.toDate().toLocaleDateString('fr-FR'));
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du service:', error);
  }
}

// Exécuter le script
addSampleService(); 