import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // D'abord, essayer de récupérer depuis admin_users
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, display_name, role, created_at, updated_at')
      .eq('email', email)
      .single();

    if (adminUser) {
      // C'est un admin
      const [prenom, nom] = adminUser.display_name.split(' ');
      return NextResponse.json({
        data: {
          id: adminUser.id,
          nom: nom || '',
          prenom: prenom || '',
          email: adminUser.email,
          telephone: null,
          adresse: null,
          date_naissance: null,
          role: adminUser.role,
          created_at: adminUser.created_at,
          isAdmin: true
        }
      });
    }

    // Si ce n'est pas un admin, essayer employees
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, nom, prenom, email, telephone, adresse, poste, role, created_at')
      .eq('email', email)
      .single();

    if (employeeError) {
      console.error('Erreur lors de la récupération du profil:', employeeError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: employee.id,
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email,
        telephone: employee.telephone,
        adresse: employee.adresse,
        date_naissance: null, // Cette colonne n'existe pas dans employees
        role: employee.role || employee.poste,
        created_at: employee.created_at,
        isAdmin: false
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 