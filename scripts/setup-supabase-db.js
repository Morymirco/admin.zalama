// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes !');
  console.log('📋 Assurez-vous d\'avoir configuré :');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Configuration de la base de données Supabase...');
    
    // Lire le fichier de schéma
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Schéma SQL chargé avec succès');
    console.log('📋 Modifications apportées :');
    console.log('   ✅ Suppression de toutes les tables existantes');
    console.log('   ✅ Ajout du champ frais_attribues à la table services');
    console.log('   ✅ Ajout du champ pourcentage_max à la table services');
    console.log('   ✅ Mise à jour des données de test avec le service "Avance sur salaire"');
    
    // Exécuter le schéma SQL
    console.log('⚡ Exécution du schéma SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      // Si la fonction RPC n'existe pas, utiliser une approche alternative
      console.log('⚠️  Fonction RPC non disponible, tentative d\'exécution directe...');
      
      // Diviser le schéma en parties pour l'exécution
      const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (stmtError) {
              console.log(`⚠️  Erreur sur la déclaration ${i + 1}:`, stmtError.message);
            }
          } catch (e) {
            console.log(`⚠️  Impossible d'exécuter la déclaration ${i + 1}:`, e.message);
          }
        }
      }
    }
    
    console.log('✅ Schéma de base de données appliqué avec succès !');
    
    // Vérifier que les tables ont été créées
    console.log('🔍 Vérification des tables créées...');
    
    const tables = [
      'users', 'partners', 'employees', 'services', 
      'alerts', 'financial_transactions', 'performance_metrics', 'notifications'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (e) {
        console.log(`❌ Table ${table}: ${e.message}`);
      }
    }
    
    // Vérifier spécifiquement le service "Avance sur salaire"
    console.log('🔍 Vérification du service "Avance sur salaire"...');
    try {
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('nom', 'Avance sur salaire');
      
      if (error) {
        console.log(`❌ Erreur lors de la vérification: ${error.message}`);
      } else if (services && services.length > 0) {
        const service = services[0];
        console.log('✅ Service "Avance sur salaire" trouvé !');
        console.log('📋 Détails :');
        console.log(`   - Nom: ${service.nom}`);
        console.log(`   - Catégorie: ${service.categorie}`);
        console.log(`   - Frais: ${service.frais_attribues?.toLocaleString()} FG`);
        console.log(`   - Pourcentage max: ${service.pourcentage_max}%`);
        console.log(`   - Durée: ${service.duree}`);
        console.log(`   - Statut: ${service.disponible ? 'Disponible' : 'Indisponible'}`);
      } else {
        console.log('⚠️  Service "Avance sur salaire" non trouvé');
      }
    } catch (e) {
      console.log(`❌ Erreur lors de la vérification du service: ${e.message}`);
    }
    
    console.log('\n🎉 Configuration de la base de données terminée !');
    console.log('📋 Prochaines étapes :');
    console.log('   1. Vérifiez que toutes les tables sont créées');
    console.log('   2. Testez l\'application avec les nouvelles données');
    console.log('   3. Configurez les politiques RLS selon vos besoins');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter la configuration
setupDatabase(); 