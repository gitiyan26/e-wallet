import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/database';
import { Transaction } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') as 'income' | 'expense' | undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get transactions with filters
    const transactions = getTransactions({
      user_id: userId,
      type,
      category,
      start_date: startDate,
      end_date: endDate
    });

    if (format === 'csv') {
      const csvContent = generateCSV(transactions);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify(transactions, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use csv or json' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    );
  }
}

function generateCSV(transactions: Transaction[]): string {
  const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah'];
  const csvRows = [headers.join(',')];

  transactions.forEach(transaction => {
    const row = [
      transaction.id,
      transaction.date,
      transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      transaction.category,
      `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes
      transaction.amount.toString()
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}