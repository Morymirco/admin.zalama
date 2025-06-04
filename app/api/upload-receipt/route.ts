import { getApps, initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { NextRequest, NextResponse } from 'next/server';

const firebaseConfig = {
    apiKey: "AIzaSyBSnHZeHH0DMRxe8_ldsS9Mh1gwNp0fa-k",
    authDomain: "zalamagn-1f057.firebaseapp.com",
    projectId: "zalamagn-1f057",
    storageBucket: "zalamagn-1f057.firebasestorage.app",
    messagingSenderId: "753763623478",
    appId: "1:753763623478:web:a11f093c649593b2d02e97"
  };
// Initialiser Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const transactionId = formData.get('transactionId') as string;

    // Validation
    if (!file || !transactionId) {
      return NextResponse.json(
        { error: 'Fichier et ID de transaction requis' },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Seuls JPG, PNG et PDF sont acceptés.' },
        { status: 400 }
      );
    }

    // Validation de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier ne doit pas dépasser 5MB' },
        { status: 400 }
      );
    }

    // Générer le nom du fichier
    const fileExtension = file.name.split('.').pop();
    const fileName = `recu_${Date.now()}.${fileExtension}`;
    const filePath = `transactions/${transactionId}/${fileName}`;

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer la référence dans Firebase Storage
    const storageRef = ref(storage, filePath);

    // Définir les métadonnées
    const metadata = {
      contentType: file.type,
      customMetadata: {
        transactionId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    };

    // Upload le fichier
    const snapshot = await uploadBytes(storageRef, buffer, metadata);
    console.log('✅ Fichier uploadé:', snapshot.metadata.fullPath);

    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json({
      success: true,
      url: downloadURL,
      path: filePath,
      fileName,
      message: 'Fichier uploadé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload du fichier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 