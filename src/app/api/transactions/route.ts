// API route untuk operasi transaksi
import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, addTransaction, getTransactionsByUserAndDateRange } from '@/lib/database';
import { TransactionFilter } from '@/types';
import { supabase } from '@/lib/supabase';

// GET /api/transactions - Mendapatkan daftar transaksi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is a request for date range (for reports)
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    if (startDate && endDate) {
      // Handle date range request for reports
      // Try to get user from authorization header first
      const authHeader = request.headers.get('authorization');
      let user = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
          if (!tokenError && tokenUser) {
            user = tokenUser;
          }
        } catch (e) {
          console.log('Token auth failed for date range, trying session auth');
        }
      }
      
      // Fallback to session-based auth with retry mechanism
      if (!user) {
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!user && attempts < maxAttempts) {
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          if (!userError && currentUser) {
            user = currentUser;
            break;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not authenticated' },
          { status: 401 }
        );
      }
      
      const transactions = await getTransactionsByUserAndDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      
      return NextResponse.json({
        success: true,
        transactions
      });
    }
    
    // Handle regular filter request
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
    
    // Try to get user from authorization header first
     const authHeader = request.headers.get('authorization');
     let user = null;
     
     if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        if (!tokenError && tokenUser) {
          user = tokenUser;
        }
      } catch (e) {
        console.log('Token auth failed, trying session auth');
      }
    }
    
    // Fallback to session-based auth with retry mechanism
    if (!user) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!user && attempts < maxAttempts) {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && currentUser) {
          user = currentUser;
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const transactions = await getTransactions(filter);
    
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
    const { type, amount, category, description } = body;
    
    // Check if this is a demo user request
    const isDemoUser = body.user_id === 'demo-user';
    console.log('Is demo user request:', isDemoUser);
    
    if (isDemoUser) {
      // For demo users, create a mock transaction response
      const mockTransaction = {
        id: `demo-${Date.now()}`,
        user_id: 'demo-user',
        type: body.type,
        amount: body.amount,
        description: body.description,
        category: body.category,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json(
        {
          success: true,
          data: mockTransaction,
          message: 'Transaksi demo berhasil ditambahkan'
        },
        { status: 201 }
      );
    }
    
    // Validasi input untuk real users
    if (!type || !amount || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak lengkap. Type, amount, dan category wajib diisi.'
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
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: new Date().toISOString()
    };
    
    // For real users, handle authentication
    const authHeader = request.headers.get('authorization');
    let user = null;
    let authenticatedSupabase = supabase;
    
    console.log('Authorization header:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Extracted token length:', token.length);
      
      if (token && token.length > 0) {
        try {
          // Get user directly with token
          const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
          if (!tokenError && tokenUser) {
            user = tokenUser;
            console.log('Authenticated user:', { id: user.id, email: user.email });
            
            // Create authenticated supabase client with token in headers
            const { createClient } = await import('@supabase/supabase-js');
            authenticatedSupabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              {
                global: {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              }
            );
          } else {
            console.log('Token auth error:', tokenError);
          }
        } catch (e) {
          console.log('Token auth failed:', e);
        }
      } else {
        console.log('Empty token received');
      }
    } else {
      console.log('No authorization header or invalid format');
    }
    
    // Fallback to session-based auth with retry mechanism
    if (!user) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!user && attempts < maxAttempts) {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && currentUser) {
          user = currentUser;
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Add transaction directly with authenticated supabase client
    // Get categories to find category_id
    const { data: categories, error: categoriesError } = await authenticatedSupabase
      .from('categories')
      .select('*')
      .eq('name', transactionData.category)
      .eq('type', transactionData.type)
      .single();

    if (categoriesError) {
      console.warn('Category not found, using null:', categoriesError);
    }

    // Insert transaction directly
    const insertData = {
      user_id: user.id,
      category_id: categories?.id || null,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      date: transactionData.date
    };
    
    console.log('Inserting transaction with data:', insertData);
    
    const { data, error } = await authenticatedSupabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    // Get all categories for conversion
    const { data: allCategories } = await authenticatedSupabase
      .from('categories')
      .select('*');

    const categoryMap = allCategories?.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>) || {};

    const newTransaction = {
      ...data,
      category: categoryMap[data.category_id] || 'Unknown'
    };
    
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