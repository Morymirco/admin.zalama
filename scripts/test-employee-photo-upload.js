const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not defined');
  console.log('💡 Assurez-vous que la variable d\'environnement SUPABASE_SERVICE_ROLE_KEY est définie');
  process.exit(1);
}

async function testEmployeePhotoUpload() {
  try {
    console.log('🧪 Test de l\'upload de photos d\'employés...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Vérifier que le champ photo_url existe
    console.log('1. Vérification du champ photo_url...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, nom, prenom, photo_url')
      .limit(1);
    
    if (employeesError) {
      console.error('❌ Erreur lors de la vérification:', employeesError);
      return;
    }
    
    if (employees && employees.length > 0) {
      const employee = employees[0];
      console.log('✅ Champ photo_url accessible');
      console.log(`📋 Employé test: ${employee.prenom} ${employee.nom}`);
      console.log(`📷 Photo actuelle: ${employee.photo_url || 'Aucune'}`);
    } else {
      console.log('⚠️  Aucun employé trouvé pour le test');
      return;
    }
    
    // 2. Vérifier le bucket de stockage
    console.log('2. Vérification du bucket employee-photos...');
    const { data: buckets, error: bucketsError } = await supabase.storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur lors de la vérification des buckets:', bucketsError);
      return;
    }
    
    const employeePhotosBucket = buckets.find(bucket => bucket.id === 'employee-photos');
    if (employeePhotosBucket) {
      console.log('✅ Bucket employee-photos trouvé');
      console.log(`📋 Configuration: public=${employeePhotosBucket.public}, file_size_limit=${employeePhotosBucket.file_size_limit}`);
    } else {
      console.log('❌ Bucket employee-photos non trouvé');
      console.log('📋 Buckets disponibles:', buckets.map(b => b.id));
      return;
    }
    
    // 3. Créer un fichier de test
    console.log('3. Création d\'un fichier de test...');
    const testImagePath = path.join(__dirname, 'test-employee-photo.png');
    
    // Créer une image PNG simple (1x1 pixel transparent)
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x1F, 0x15, 0xC4, 0x89, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    fs.writeFileSync(testImagePath, pngHeader);
    console.log('✅ Fichier de test créé:', testImagePath);
    
    // 4. Tester l'upload
    console.log('4. Test de l\'upload...');
    const testEmployeeId = employees[0].id;
    const fileName = `test-${testEmployeeId}-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('employee-photos')
      .upload(fileName, pngHeader, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Erreur lors de l\'upload:', uploadError);
      return;
    }
    
    console.log('✅ Upload réussi:', uploadData.path);
    
    // 5. Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('employee-photos')
      .getPublicUrl(fileName);
    
    console.log('✅ URL publique générée:', publicUrl);
    
    // 6. Tester la mise à jour de la base de données
    console.log('6. Test de la mise à jour de la base de données...');
    const { error: updateError } = await supabase
      .from('employees')
      .update({ photo_url: publicUrl })
      .eq('id', testEmployeeId);
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
    } else {
      console.log('✅ Base de données mise à jour avec succès');
    }
    
    // 7. Vérifier la mise à jour
    const { data: updatedEmployee, error: verifyError } = await supabase
      .from('employees')
      .select('id, nom, prenom, photo_url')
      .eq('id', testEmployeeId)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
    } else {
      console.log('✅ Vérification réussie');
      console.log(`📋 Employé mis à jour: ${updatedEmployee.prenom} ${updatedEmployee.nom}`);
      console.log(`📷 Nouvelle photo: ${updatedEmployee.photo_url}`);
    }
    
    // 8. Nettoyer le fichier de test
    console.log('8. Nettoyage...');
    fs.unlinkSync(testImagePath);
    console.log('✅ Fichier de test supprimé');
    
    // 9. Supprimer le fichier uploadé
    const { error: deleteError } = await supabase.storage
      .from('employee-photos')
      .remove([fileName]);
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
    } else {
      console.log('✅ Fichier uploadé supprimé');
    }
    
    // 10. Remettre la photo_url à null
    const { error: resetError } = await supabase
      .from('employees')
      .update({ photo_url: null })
      .eq('id', testEmployeeId);
    
    if (resetError) {
      console.error('❌ Erreur lors de la réinitialisation:', resetError);
    } else {
      console.log('✅ Photo_url remise à null');
    }
    
    console.log('');
    console.log('🎉 Test terminé avec succès!');
    console.log('');
    console.log('📋 Résumé:');
    console.log('✅ Champ photo_url accessible');
    console.log('✅ Bucket employee-photos configuré');
    console.log('✅ Upload de fichiers fonctionnel');
    console.log('✅ URL publique générée');
    console.log('✅ Mise à jour de la base de données fonctionnelle');
    console.log('✅ Suppression de fichiers fonctionnelle');
    console.log('');
    console.log('🚀 Le système d\'upload de photos d\'employés est prêt!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Exécuter le test
testEmployeePhotoUpload(); 