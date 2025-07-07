import { NextRequest, NextResponse } from 'next/server';
import { cleanEmployeeData, validateEmployeeData, generatePassword } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePhone = searchParams.get('includePhone') === 'true';
    const partnerId = searchParams.get('partner_id') || searchParams.get('partnerId');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    console.log('🔍 Paramètres de recherche:', { partnerId, active, search, includePhone });

    let query = supabase
      .from('employees')
      .select(`
        *,
        partners:partner_id (
          id,
          nom
        )
      `);

    // Filtrer par partenaire si spécifié
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    // Filtrer par statut actif si spécifié
    if (active !== null) {
      query = query.eq('actif', active === 'true');
    }

    // Recherche textuelle si spécifiée
    if (search) {
      query = query.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,poste.ilike.%${search}%`);
    }

    // Filtrer les employés avec téléphone si demandé
    if (includePhone) {
      query = query.not('telephone', 'is', null);
    }

    const { data: employees, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des employés' },
        { status: 500 }
      );
    }

    console.log(`📊 ${employees?.length || 0} employés trouvés`);

    // Si c'est pour la sélection (includePhone), formater différemment
    if (includePhone) {
      const formattedEmployees = employees?.map(employee => ({
        id: employee.id,
        label: `${employee.prenom} ${employee.nom} (${employee.partners?.nom || 'Partenaire inconnu'})`,
        value: employee.telephone,
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email,
        telephone: employee.telephone,
        poste: employee.poste,
        partenaire_nom: employee.partners?.nom || 'Partenaire inconnu'
      })) || [];

      return NextResponse.json({
        success: true,
        employees: formattedEmployees,
        count: formattedEmployees.length
      });
    }

    // Sinon, retourner les employés complets
    return NextResponse.json({
      success: true,
      employees: employees || [],
      count: employees?.length || 0
    });

  } catch (error) {
    console.error('Erreur générale lors de la récupération des employés:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Données reçues pour création employé:', body);

    // Nettoyer et valider les données
    const cleanedData = cleanEmployeeData(body);
    const validation = validateEmployeeData(cleanedData);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // NOUVELLE LOGIQUE: Créer directement avec la logique corrigée
    console.log('🔄 Création de l\'employé avec la logique corrigée...');

    let userId: string | null = null;
    let password: string | null = null;

    // Si email fourni, créer le compte Auth d'abord
    if (cleanedData.email) {
      try {
        console.log('🔐 Création du compte Auth...');
        
        // Générer un mot de passe sécurisé
        password = generatePassword();
        
        // Créer le compte dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: cleanedData.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            display_name: `${cleanedData.prenom} ${cleanedData.nom}`,
            role: 'user',
            partenaire_id: cleanedData.partner_id
          }
        });

        if (authError) {
          console.error('❌ Erreur création compte Auth:', authError);
          throw new Error(`Erreur création compte Auth: ${authError.message}`);
        }

        userId = authData.user.id;
        console.log('✅ Compte Auth créé:', userId);
        
        // Créer l'entrée dans admin_users
        console.log('🔐 Création de l\'entrée admin_users...');
        const accountData = {
          id: authData.user.id,
          email: cleanedData.email,
          display_name: `${cleanedData.prenom} ${cleanedData.nom}`,
          role: 'user',
          partenaire_id: cleanedData.partner_id,
          active: true
        };

        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([accountData]);

        if (adminError) {
          console.error('❌ Erreur création admin_users:', adminError);
          // Supprimer le compte Auth créé en cas d'erreur
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(`Erreur création admin_users: ${adminError.message}`);
        }

        console.log('✅ Entrée admin_users créée');
        
      } catch (authError) {
        console.error('❌ Erreur lors de la création du compte Auth:', authError);
        // Continuer sans compte Auth si erreur
        userId = null;
        password = null;
      }
    }

    // Préparer les données pour l'insertion
    const dbData = {
      ...cleanedData,
      actif: cleanedData.actif ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Ajouter le user_id si le compte Auth a été créé
    if (userId) {
      dbData.user_id = userId;
      console.log('✅ user_id défini pour l\'employé:', userId);
    } else {
      console.warn('⚠️ Aucun user_id défini - pas de compte Auth créé');
    }

    // Insérer l'employé dans la base de données
    const { data: employee, error: insertError } = await supabase
      .from('employees')
      .insert([dbData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur lors de la création de l\'employé:', insertError);
      
      // Si l'employé n'a pas pu être créé et qu'un compte Auth a été créé, le supprimer
      if (userId) {
        try {
          console.log('🧹 Nettoyage des comptes créés suite à l\'échec...');
          await supabase.auth.admin.deleteUser(userId);
          await supabase.from('admin_users').delete().eq('id', userId);
          console.log('✅ Comptes Auth et admin_users supprimés');
        } catch (deleteError) {
          console.error('⚠️ Erreur lors de la suppression des comptes:', deleteError);
        }
      }
      
      throw insertError;
    }

    console.log('✅ Employé créé avec succès:', employee.id);
    console.log('📊 Vérification finale:');
    console.log('  - Employé ID:', employee.id);
    console.log('  - User ID:', employee.user_id || 'NULL');
    console.log('  - Email:', employee.email);

    // Vérification critique que l'employé a bien un user_id si un compte Auth a été créé
    if (userId && !employee.user_id) {
      console.error('❌ ERREUR CRITIQUE: user_id manquant après création!');
      console.error('   - Compte Auth créé:', userId);
      console.error('   - Employé créé mais sans user_id');
      
      // Nettoyer et échouer
      try {
        await supabase.auth.admin.deleteUser(userId);
        await supabase.from('admin_users').delete().eq('id', userId);
        await supabase.from('employees').delete().eq('id', employee.id);
      } catch (cleanupError) {
        console.error('⚠️ Erreur lors du nettoyage:', cleanupError);
      }
      
      throw new Error('Erreur critique: user_id manquant après création de l\'employé');
    }

    console.log('🎉 Processus de création terminé avec succès!');

    return NextResponse.json({
      success: true,
      employee: employee,
      smsResults: {
        employe: { success: false, message: '', error: '' },
        admin: { success: false, message: '', error: '' }
      },
      emailResults: {
        employe: { success: false, message: '', error: '' }
      },
      accountResults: {
        employe: { 
          success: !!userId, 
          password: password || undefined, 
          error: userId ? '' : 'Aucun email fourni ou erreur création compte'
        }
      },
      message: 'Employé créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    
    // Détecter les erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'Un employé avec ces informations existe déjà' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'employé' },
      { status: 500 }
    );
  }
} 