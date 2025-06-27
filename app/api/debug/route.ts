import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Route de debug accessible',
    timestamp: new Date().toISOString(),
    routes: {
      health: '/api/health',
      test: '/api/test',
      testSms: '/api/test/sms',
      smsSend: '/api/sms/send',
      debug: '/api/debug'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Debug POST réussi',
      receivedData: body,
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du parsing JSON',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
} 