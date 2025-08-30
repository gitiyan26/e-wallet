// API route untuk operasi transaksi individual
import { NextRequest, NextResponse } from 'next/server';
import { getTransactionById, updateTransaction, deleteTransaction } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/transactions/[id] - Mendapatkan transaksi berdasarkan ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID transaksi diperlukan'
        },
        { status: 400 }
      );
    }
    
    const transaction = getTransactionById(id);
    
    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaksi tidak ditemukan'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaksi berhasil diambil'
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data transaksi'
      },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update transaksi
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID transaksi diperlukan'
        },
        { status: 400 }
      );
    }
    
    // Validasi input jika ada
    if (body.type && !['income', 'expense'].includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type harus berupa income atau expense'
        },
        { status: 400 }
      );
    }
    
    if (body.amount && (isNaN(body.amount) || body.amount <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount harus berupa angka positif'
        },
        { status: 400 }
      );
    }
    
    const updatedTransaction = updateTransaction(id, body);
    
    if (!updatedTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaksi tidak ditemukan'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTransaction,
      message: 'Transaksi berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memperbarui transaksi'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Hapus transaksi
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID transaksi diperlukan'
        },
        { status: 400 }
      );
    }
    
    const deleted = deleteTransaction(id);
    
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaksi tidak ditemukan'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus transaksi'
      },
      { status: 500 }
    );
  }
}