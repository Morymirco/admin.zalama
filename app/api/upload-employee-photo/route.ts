import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for file uploads');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const employeeId = formData.get('employeeId') as string;
    const updateDatabase = formData.get('updateDatabase') === 'true'; // Nouveau paramètre

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!employeeId) {
      return NextResponse.json(
        { error: 'ID de l\'employé requis' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale: 5MB' },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}-${Date.now()}.${fileExt}`;

    console.log('📤 Tentative d\'upload de photo employé vers Supabase...');
    console.log('📁 Bucket: employee-photos');
    console.log('📄 Nom du fichier:', fileName);
    console.log('📏 Taille du fichier:', file.size);
    console.log('🎨 Type du fichier:', file.type);

    // Upload vers Supabase Storage (direct, pas de buffer)
    const { data, error } = await supabase.storage
      .from('employee-photos')
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
    const { data: { publicUrl } } = supabase.storage
      .from('employee-photos')
      .getPublicUrl(fileName);

    // Mettre à jour la base de données seulement si demandé et si l'employé existe
    if (updateDatabase) {
      // Vérifier d'abord si l'employé existe
      const { data: existingEmployee, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('id', employeeId)
        .single();

      if (checkError || !existingEmployee) {
        console.log('⚠️ Employé non trouvé, pas de mise à jour de la base de données');
        // On retourne quand même l'URL de la photo
        return NextResponse.json({
          success: true,
          photoUrl: publicUrl,
          fileName: fileName,
          message: 'Photo uploadée avec succès (employé non trouvé dans la base de données)'
        });
      }

      // Mettre à jour la base de données
      const { error: updateError } = await supabase
        .from('employees')
        .update({ photo_url: publicUrl })
        .eq('id', employeeId);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour de la base de données:', updateError);
        // Supprimer le fichier uploadé en cas d'erreur
        await supabase.storage
          .from('employee-photos')
          .remove([fileName]);
        
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour de la base de données' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      photoUrl: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Erreur dans l\'API upload-employee-photo:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get('photoUrl');
    const employeeId = searchParams.get('employeeId');

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'URL de la photo requise' },
        { status: 400 }
      );
    }

    // Extraire le nom du fichier de l'URL
    const fileName = photoUrl.split('/').pop();
    if (!fileName) {
      return NextResponse.json(
        { error: 'URL de photo invalide' },
        { status: 400 }
      );
    }

    // Supprimer le fichier du storage
    const { error: storageError } = await supabase.storage
      .from('employee-photos')
      .remove([fileName]);

    if (storageError) {
      console.error('Erreur lors de la suppression du fichier:', storageError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du fichier' },
        { status: 500 }
      );
    }

    // Mettre à jour la base de données pour supprimer l'URL de la photo
    if (employeeId) {
      const { error: updateError } = await supabase
        .from('employees')
        .update({ photo_url: null })
        .eq('id', employeeId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la base de données:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur dans l\'API delete-employee-photo:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 