import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Vérifier le token et récupérer l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    console.log('🔍 Recherche des informations utilisateur pour:', user.email);

    // Chercher l'utilisateur dans admin_users
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (adminUser) {
      console.log('✅ Utilisateur trouvé dans admin_users');
      return NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          display_name: adminUser.display_name,
          role: adminUser.role,
          partenaire_id: adminUser.partenaire_id,
          active: adminUser.active,
          type: 'admin'
        }
      });
    }

    // Si pas dans admin_users, chercher dans employees avec le nouveau champ user_id
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        *,
        partners (
          id,
          nom,
          type,
          secteur
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (employee) {
      console.log('✅ Employé trouvé avec user_id');
      return NextResponse.json({
        success: true,
        user: {
          id: employee.id,
          email: employee.email,
          display_name: `${employee.prenom} ${employee.nom}`,
          role: employee.role || 'user',
          partenaire_id: employee.partner_id,
          partner_info: employee.partners,
          poste: employee.poste,
          type: 'employee',
          active: employee.actif
        }
      });
    }

    // Si pas trouvé, chercher par email (méthode legacy)
    const { data: legacyEmployee, error: legacyError } = await supabase
      .from('employees')
      .select(`
        *,
        partners (
          id,
          nom,
          type,
          secteur
        )
      `)
      .eq('email', user.email)
      .single();

    if (legacyEmployee) {
      console.log('⚠️ Employé trouvé par email (méthode legacy)');
      
      // Mettre à jour l'employé avec le user_id
      const { error: updateError } = await supabase
        .from('employees')
        .update({ user_id: user.id })
        .eq('id', legacyEmployee.id);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour du user_id:', updateError);
      } else {
        console.log('✅ user_id mis à jour pour l\'employé');
      }

      return NextResponse.json({
        success: true,
        user: {
          id: legacyEmployee.id,
          email: legacyEmployee.email,
          display_name: `${legacyEmployee.prenom} ${legacyEmployee.nom}`,
          role: legacyEmployee.role || 'user',
          partenaire_id: legacyEmployee.partner_id,
          partner_info: legacyEmployee.partners,
          poste: legacyEmployee.poste,
          type: 'employee',
          active: legacyEmployee.actif
        }
      });
    }

    // Si aucun utilisateur trouvé
    console.log('❌ Aucun utilisateur trouvé pour:', user.email);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Utilisateur non trouvé dans la base de données',
        auth_user: {
          id: user.id,
          email: user.email
        }
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('❌ Erreur API /auth/me:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('error' in error) {
        errorMessage = String(error.error);
      } else {
        errorMessage = JSON.stringify(error);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur serveur: ${errorMessage}`
      },
      { status: 500 }
    );
  }
} 