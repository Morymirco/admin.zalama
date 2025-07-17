import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Clés directes pour éviter les erreurs d'API key
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.QWaVPwIjJAJGr7fJfg8MMBUGyfTG0VoSP5cQzrZJQQU';

console.log('🔧 Configuration Supabase pour avis/[id]:', {
  url: supabaseUrl,
  keyPrefix: supabaseServiceKey.substring(0, 20) + '...'
});

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET - Récupérer un avis par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('avis')
      .select(`
        *,
        employee:employees(id, nom, prenom, email, poste),
        partner:partners(id, nom, type)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération de l\'avis:', error);
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ avis: data });
  } catch (error) {
    console.error('Erreur API avis GET by ID:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un avis
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { note, commentaire, type_retour, approuve } = body;

    // Validation des données
    if (note && (note < 1 || note > 5)) {
      return NextResponse.json(
        { error: 'La note doit être comprise entre 1 et 5' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (note !== undefined) updateData.note = note;
    if (commentaire !== undefined) updateData.commentaire = commentaire;
    if (type_retour !== undefined) updateData.type_retour = type_retour;
    if (approuve !== undefined) updateData.approuve = approuve;

    const { data, error } = await supabase
      .from('avis')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        employee:employees(id, nom, prenom, email, poste),
        partner:partners(id, nom, type)
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'avis:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'avis' },
        { status: 500 }
      );
    }

    return NextResponse.json({ avis: data });
  } catch (error) {
    console.error('Erreur API avis PUT:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un avis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('avis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'avis' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur API avis DELETE:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Approuver/Rejeter un avis
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { approuve } = body;

    if (typeof approuve !== 'boolean') {
      return NextResponse.json(
        { error: 'Le paramètre approuve doit être un booléen' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('avis')
      .update({ approuve })
      .eq('id', id)
      .select(`
        *,
        employee:employees(id, nom, prenom, email, poste),
        partner:partners(id, nom, type)
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la modification de l\'approbation:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la modification de l\'approbation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ avis: data });
  } catch (error) {
    console.error('Erreur API avis PATCH:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 