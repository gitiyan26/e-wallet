// API route untuk kategori transaksi
import { NextRequest, NextResponse } from 'next/server';
import { getCategories, getCategoriesByType } from '@/lib/database';

// GET /api/categories - Mendapatkan daftar kategori
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'income' | 'expense' | null;
    
    let categories;
    
    if (type && ['income', 'expense'].includes(type)) {
      categories = getCategoriesByType(type);
    } else {
      categories = getCategories();
    }
    
    return NextResponse.json({
      success: true,
      data: categories,
      message: 'Kategori berhasil diambil'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data kategori'
      },
      { status: 500 }
    );
  }
}