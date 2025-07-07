import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleLengoPayCallback } from '@/services/lengoPayService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // body doit contenir: pay_id, status, amount, message, account
    if (!body.pay_id || !body.status) {
      return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 });
    }
    await handleLengoPayCallback(body, supabase);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
} 