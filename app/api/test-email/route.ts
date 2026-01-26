import { NextResponse } from 'next/server';
import { testEmailConnection } from '@/lib/test-email';

export const dynamic = 'force-dynamic';

/**
 * API endpoint emaili testimiseks
 * GET /api/test-email - Testib SMTP ühendust ja saadab test emaili
 */
export async function GET() {
  try {
    const result = await testEmailConnection();
    return NextResponse.json({
      success: true,
      message: 'Test email saadetud edukalt!',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Emaili test ebaõnnestus',
      },
      { status: 500 }
    );
  }
}



