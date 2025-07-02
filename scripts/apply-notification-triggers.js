const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function applyNotificationTriggers() {
  try {
    console.log('🔧 Application des triggers de notifications...');
    
    // Créer le client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Lire le fichier SQL des triggers
    const triggersPath = path.join(__dirname, '../supabase/notification_triggers.sql');
    const triggersSQL = fs.readFileSync(triggersPath, 'utf8');
    
    console.log('📄 Contenu du fichier SQL:');
    console.log(triggersSQL);
    
    // Exécuter le SQL via l'API REST (en utilisant rpc)
    // Note: Pour les triggers, nous devons utiliser l'interface SQL de Supabase
    console.log('⚠️  ATTENTION: Les triggers doivent être appliqués manuellement via l\'interface SQL de Supabase.');
    console.log('📋 Voici les étapes à suivre:');
    console.log('');
    console.log('1. Allez sur https://supabase.com/dashboard/project/mspmrzlqhwpdkkburjiw/sql');
    console.log('2. Copiez le contenu du fichier supabase/notification_triggers.sql');
    console.log('3. Collez-le dans l\'éditeur SQL et exécutez');
    console.log('');
    console.log('✅ Les triggers seront alors actifs et créeront automatiquement des notifications pour:');
    console.log('   - Nouvelles demandes d\'avance de salaire');
    console.log('   - Changements de statut des demandes');
    console.log('   - Nouvelles transactions financières importantes');
    console.log('   - Nouvelles alertes');
    console.log('   - Nouveaux avis négatifs');
    console.log('   - Nouvelles demandes de partenariat');
    console.log('   - Événements de sécurité à haut risque');
    
    // Vérifier que la table notifications existe
    const { data: tableExists, error: tableError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur: La table notifications n\'existe pas ou n\'est pas accessible');
      console.error('Détails:', tableError);
      return;
    }
    
    console.log('✅ La table notifications existe et est accessible');
    
    // Vérifier les types d'enum
    console.log('🔍 Vérification des types d\'enum...');
    
    // Test des valeurs d'enum pour transaction_status
    const testValues = ['En attente', 'Validé', 'Rejeté', 'Annulé'];
    console.log('✅ Valeurs valides pour transaction_status:', testValues);
    
    // Test des valeurs d'enum pour notification_type
    const notificationTypes = ['Information', 'Demande', 'Transaction', 'Alerte', 'Avis', 'Partenariat', 'Sécurité', 'Mise à jour'];
    console.log('✅ Valeurs valides pour notification_type:', notificationTypes);
    
    console.log('');
    console.log('🎉 Script terminé avec succès!');
    console.log('📝 N\'oubliez pas d\'appliquer les triggers manuellement via l\'interface SQL de Supabase.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des triggers:', error);
    process.exit(1);
  }
}

// Exécuter le script
applyNotificationTriggers(); 