// API route untuk ringkasan transaksi
import { NextRequest, NextResponse } from 'next/server';
import { getTransactionSummary } from '@/lib/database';

// GET /api/summary - Mendapatkan ringkasan transaksi pengguna
export async function GET(request: NextRequest) {
  try {
    const summary = await getTransactionSummary();
    
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