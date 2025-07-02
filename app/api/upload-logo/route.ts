import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mspmrzlqhwpdkkburjiw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw'
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const partnerId = formData.get('partnerId') as string;
    const type = formData.get('type') as string; // 'partner' ou 'service'

    if (!file || !partnerId || !type) {
      return NextResponse.json(
        { error: 'Fichier, ID du partenaire et type sont requis' },
        { status: 400 }
      );
    }

    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.' },
        { status: 400 }
      );
    }

    // Valider la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum : 5MB.' },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}/${partnerId}/logo.${fileExtension}`;

    console.log('📤 Tentative d\'upload vers Supabase...');
    console.log('📁 Bucket: logos');
    console.log('📄 Nom du fichier:', fileName);
    console.log('📏 Taille du fichier:', file.size);
    console.log('🎨 Type du fichier:', file.type);

    // Upload du fichier vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('❌ Erreur upload Supabase:', error);
      console.error('❌ Détails de l\'erreur:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
      return NextResponse.json(
        { error: `Erreur lors de l'upload du fichier: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Upload réussi !');
    console.log('📊 Données retournées:', data);

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Erreur upload logo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    );
  }
} 