const fs = require('fs');
const path = require('path');

// Créer un fichier de test simple
const testImagePath = path.join(__dirname, 'test-logo.png');

// Créer un fichier PNG minimal (1x1 pixel transparent)
const pngData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width: 1
  0x00, 0x00, 0x00, 0x01, // height: 1
  0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  0x90, 0x77, 0x53, 0xDE, // CRC
  0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
  0xE2, 0x21, 0xBC, 0x33, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

fs.writeFileSync(testImagePath, pngData);

console.log('✅ Fichier de test créé:', testImagePath);

// Test de l'API route
async function testUpload() {
  try {
    console.log('🧪 Test de l\'upload via API route...');
    
    const formData = new FormData();
    formData.append('file', new Blob([pngData], { type: 'image/png' }), 'test-logo.png');
    formData.append('partnerId', 'test-partner-123');
    formData.append('type', 'partner');

    const response = await fetch('http://localhost:3000/api/upload-logo', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload réussi !');
      console.log('📁 URL:', result.url);
      console.log('📄 Nom du fichier:', result.fileName);
    } else {
      console.log('❌ Erreur upload:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // Nettoyer le fichier de test
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Fichier de test supprimé');
    }
  }
}

// Exécuter le test
testUpload(); 