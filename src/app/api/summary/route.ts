// API route untuk ringkasan transaksi
import { NextRequest, NextResponse } from 'next/server';
import { getTransactionSummary } from '@/lib/database';

// GET /api/summary - Mendapatkan ringkasan transaksi pengguna
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID diperlukan'
        },
        { status: 400 }
      );
    }
    
    const summary = getTransactionSummary(userId);
    
    return NextResponse.json({
      success: true,
      data: summary,
      message: 'Ringkasan berhasil diambil'
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil ringkasan'
      },
      { status: 500 }
    );
  }
}