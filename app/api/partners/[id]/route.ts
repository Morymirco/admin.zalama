import { NextRequest, NextResponse } from 'next/server';
import partenaireService from '@/services/partenaireService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Récupérer le partenaire avec ses employés
    const partenaire = await partenaireService.getByIdWithEmployees(id);
    
    if (!partenaire) {
      return NextResponse.json(
        { success: false, error: 'Partenaire non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      partenaire
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du partenaire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du partenaire' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Mettre à jour le partenaire
    const partenaire = await partenaireService.update(id, body);

    return NextResponse.json({
      success: true,
      partenaire,
      message: 'Partenaire mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du partenaire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du partenaire' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Supprimer le partenaire
    await partenaireService.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Partenaire supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du partenaire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du partenaire' },
      { status: 500 }
    );
  }
} 