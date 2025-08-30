'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, supabase } from '@/lib/supabase';
import { getUserData } from '@/lib/database';
import BottomNavigation from '@/components/BottomNavigation';
import { TransactionSummary, Transaction } from '@/types';
import Notification, { useNotification } from '@/components/Notification';
import MigrationModal, { useMigrationCheck } from '@/components/MigrationModal';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const transactionsPerPage = 5;
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();
  const { shouldShowMigration, setShouldShowMigration, markMigrationComplete } = useMigrationCheck();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadSummary();
      loadRecentTransactions(currentPage);
    }
  }, [user, currentPage]);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // Check demo login
        const demoLoggedIn = localStorage.getItem('demo-logged-in');
        if (!demoLoggedIn) {
          router.push('/login');
          return;
        }
        setUser({ id: 'demo-user', email: 'demo@example.com', full_name: 'Demo User' });
      } else {
        // Get full user data including profile
        const userData = await getUserData();
        setUser(userData || currentUser);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      // Check if user is demo user
      const isDemoUser = user?.id === 'demo-user';
      
      let headers: Record<string, string> = {};
      
      if (!isDemoUser) {
        // Get session token for authorization for real users
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        } else {
          console.warn('No access token available for summary, user might need to re-login');
          router.push('/login');
          return;
        }
      }
      
      const response = await fetch('/api/summary', {
        headers,
      });
      const result = await response.json();
      
      if (result.success) {
        setSummary(result.data);
      } else {
        console.error('Error loading summary:', result.error);
        if (result.error === 'User not authenticated' && !isDemoUser) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      showNotification('Gagal memuat ringkasan keuangan', 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadRecentTransactions = async (page = 1) => {
    try {
      // Check if user is demo user
      const isDemoUser = user?.id === 'demo-user';
      
      let headers: Record<string, string> = {};
      
      if (!isDemoUser) {
        // Get session token for authorization for real users
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        } else {
          console.warn('No access token available for recent transactions, user might need to re-login');
          router.push('/login');
          return;
        }
      }
      
      const offset = (page - 1) * transactionsPerPage;
      const response = await fetch(`/api/transactions?limit=${transactionsPerPage}&offset=${offset}`, {
        headers,
      });
      const result = await response.json();
      
      if (result.success) {
        setRecentTransactions(result.data);
        setTotalTransactions(result.total);
      } else {
        console.error('Error loading recent transactions:', result.error);
        if (result.error === 'User not authenticated' && !isDemoUser) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error loading recent transactions:', error);
      showNotification('Gagal memuat transaksi terbaru', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pb-20">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.full_name || user?.email?.split('@')[0] || 'Pengguna'}</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-semibold mb-3 text-primary-100">Saldo Total</h2>
            {loadingSummary ? (
              <div className="animate-pulse">
                <div className="h-10 bg-primary-500/50 rounded-lg w-40 mb-4"></div>
                <div className="h-5 bg-primary-500/50 rounded w-32"></div>
              </div>
            ) : (
              <>
                <p className="text-4xl font-bold mb-6">
                  {summary ? formatCurrency(summary.balance) : 'Rp 0'}
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-primary-100 text-sm mb-1">Pemasukan</p>
                    <p className="font-bold text-lg">
                      {summary ? formatCurrency(summary.totalIncome) : 'Rp 0'}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-primary-100 text-sm mb-1">Pengeluaran</p>
                    <p className="font-bold text-lg">
                      {summary ? formatCurrency(summary.totalExpense) : 'Rp 0'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/add-transaction?type=income" className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-elegant border border-gray-200/50 hover:shadow-xl transition-all duration-200 block group hover:scale-105 active:scale-95">
            <div className="w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-success-200 transition-colors">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-success-700 transition-colors">Tambah Pemasukan</p>
            <p className="text-sm text-gray-500 mt-1">Catat pendapatan</p>
          </Link>
          <Link href="/add-transaction?type=expense" className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-elegant border border-gray-200/50 hover:shadow-xl transition-all duration-200 block group hover:scale-105 active:scale-95">
            <div className="w-12 h-12 bg-error-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-error-200 transition-colors">
              <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-error-700 transition-colors">Tambah Pengeluaran</p>
            <p className="text-sm text-gray-500 mt-1">Catat pengeluaran</p>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Transaksi Terbaru</h3>
          <Link href="/transactions" className="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors">
            Lihat Semua
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-elegant">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-2">Belum ada transaksi</p>
            <p className="text-sm text-gray-500">Mulai catat keuangan Anda sekarang</p>
          </div>
        ) : (
          <>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-elegant">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className={`p-5 ${index !== recentTransactions.length - 1 ? 'border-b border-gray-100/50' : ''} hover:bg-gray-50/50 transition-colors`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{transaction.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {transaction.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'income' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalTransactions > transactionsPerPage && (
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-white/95 backdrop-blur-md border border-gray-200/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-lg border border-gray-200/50 text-sm font-medium text-gray-700">
                  {currentPage} / {Math.ceil(totalTransactions / transactionsPerPage)}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalTransactions / transactionsPerPage)))}
                  disabled={currentPage >= Math.ceil(totalTransactions / transactionsPerPage)}
                  className="px-3 py-2 rounded-lg bg-white/95 backdrop-blur-md border border-gray-200/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
      
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      <MigrationModal
        isOpen={shouldShowMigration}
        onClose={() => setShouldShowMigration(false)}
        onMigrationComplete={() => {
          markMigrationComplete()
          loadSummary()
          loadRecentTransactions()
          showNotification('Data berhasil dimigrasi ke Supabase!', 'success')
        }}
      />
    </div>
  )
}