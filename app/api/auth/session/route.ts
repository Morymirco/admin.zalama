import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  
  // Définir le cookie de session avec le token Firebase
  cookies().set({
    name: "session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 5, // 5 jours
    path: "/",
  });
  
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  // Supprimer le cookie de session
  cookies().delete("session");
  
  return NextResponse.json({ success: true });
} 