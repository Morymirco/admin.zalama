import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Upload du fichier vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Erreur upload Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload du fichier' },
        { status: 500 }
      );
    }

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