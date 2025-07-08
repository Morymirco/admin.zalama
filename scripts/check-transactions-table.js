const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTransactionsTable() {
  console.log('🔍 Vérification de la structure de la table transactions');
  
  try {
    // 1. Vérifier la structure de la table
    console.log('\n📊 1. Structure de la table transactions:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'transactions' });
    
    if (columnsError) {
      console.log('⚠️ Impossible de récupérer la structure via RPC, utilisation d\'une requête directe...');
      
      // Requête alternative pour récupérer les colonnes
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'transactions')
        .eq('table_schema', 'public')
        .order('ordinal_position');
      
      if (tableError) {
        console.error('❌ Erreur lors de la récupération de la structure:', tableError);
        return;
      }
      
      console.log('✅ Colonnes de la table transactions:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'} ${col.column_default ? `[default: ${col.column_default}]` : ''}`);
      });
      
      // Vérifier les champs requis pour LengoPay
      const requiredFields = ['description', 'message_callback', 'numero_transaction', 'montant', 'statut'];
      const missingFields = requiredFields.filter(field => 
        !tableInfo.some(col => col.column_name === field)
      );
      
      if (missingFields.length > 0) {
        console.log('\n❌ Champs manquants pour LengoPay:', missingFields);
        console.log('💡 Exécutez la migration: supabase/03_update_transactions_table.sql');
      } else {
        console.log('\n✅ Tous les champs requis pour LengoPay sont présents');
      }
      
    } else {
      console.log('✅ Structure récupérée via RPC:', columns);
    }
    
    // 2. Vérifier les données existantes
    console.log('\n📋 2. Données existantes dans la table:');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (transactionsError) {
      console.error('❌ Erreur lors de la récupération des transactions:', transactionsError);
      return;
    }
    
    console.log(`✅ ${transactions.length} transactions trouvées (5 dernières):`);
    transactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ID: ${tx.id}`);
      console.log(`     Numéro: ${tx.numero_transaction}`);
      console.log(`     Montant: ${tx.montant}`);
      console.log(`     Statut: ${tx.statut}`);
      console.log(`     Description: ${tx.description || 'N/A'}`);
      console.log(`     Date: ${tx.date_creation}`);
      console.log('');
    });
    
    // 3. Vérifier les contraintes
    console.log('\n🔒 3. Vérification des contraintes:');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'transactions')
      .eq('table_schema', 'public');
    
    if (constraintsError) {
      console.error('❌ Erreur lors de la récupération des contraintes:', constraintsError);
    } else {
      console.log('✅ Contraintes de la table:');
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }
    
    // 4. Vérifier les index
    console.log('\n📈 4. Vérification des index:');
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .eq('tablename', 'transactions')
      .eq('schemaname', 'public');
    
    if (indexesError) {
      console.error('❌ Erreur lors de la récupération des index:', indexesError);
    } else {
      console.log('✅ Index de la table:');
      indexes.forEach(index => {
        console.log(`  - ${index.indexname}: ${index.indexdef}`);
      });
    }
    
    console.log('\n🎉 Vérification terminée !');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Exécuter la vérification
checkTransactionsTable(); 