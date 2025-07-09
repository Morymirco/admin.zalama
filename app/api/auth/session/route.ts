import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 400 });
    }
    
    // Définir le cookie de session avec le token Supabase
    const cookieStore = await cookies();
    cookieStore.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5, // 5 jours
      path: "/",
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la création de la session' 
    }, { status: 500 });
  }
}

export async function DELETE() {
  // Supprimer le cookie de session
  const cookieStore = await cookies();
  cookieStore.delete("session");
  
  return NextResponse.json({ success: true });
} 