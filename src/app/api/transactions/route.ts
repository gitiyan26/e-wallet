// API route untuk operasi transaksi
import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/database';
import { TransactionFilter } from '@/types';

// GET /api/transactions - Mendapatkan daftar transaksi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filter: TransactionFilter = {
      type: searchParams.get('type') as 'income' | 'expense' | 'all' || undefined,
      category: searchParams.get('category') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    };
    
    // Remove undefined values
    Object.keys(filter).forEach(key => {
      if (filter[key as keyof TransactionFilter] === undefined) {
        delete filter[key as keyof TransactionFilter];
      }
    });
    
    const transactions = getTransactions(filter);
    
    return NextResponse.json({
      success: true,
      data: transactions,
      message: 'Transaksi berhasil diambil'
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data transaksi'
      },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Menambah transaksi baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, category, description, user_id } = body;
    
    // Validasi input
    if (!type || !amount || !category || !user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak lengkap. Type, amount, category, dan user_id wajib diisi.'
        },
        { status: 400 }
      );
    }
    
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type harus berupa income atau expense'
        },
        { status: 400 }
      );
    }
    
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount harus berupa angka positif'
        },
        { status: 400 }
      );
    }
    
    const transactionData = {
      user_id,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: new Date().toISOString()
    };
    
    const newTransaction = addTransaction(transactionData);
    
    return NextResponse.json(
      {
        success: true,
        data: newTransaction,
        message: 'Transaksi berhasil ditambahkan'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menambahkan transaksi'
      },
      { status: 500 }
    );
  }
}