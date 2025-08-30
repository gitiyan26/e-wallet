// API route untuk ringkasan transaksi
import { NextRequest, NextResponse } from 'next/server';
import { getTransactionSummary } from '@/lib/database';
import { supabase } from '@/lib/supabase';

// GET /api/summary - Mendapatkan ringkasan transaksi pengguna
export async function GET(request: NextRequest) {
  try {
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
        console.log('Token auth failed for summary, trying session auth');
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
    
    // Extract userToken from authorization header
    const userToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    
    const summary = await getTransactionSummary(user, userToken);
    
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