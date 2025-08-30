'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BottomNavigation from '@/components/BottomNavigation';
import { TransactionSummary, Transaction } from '@/types';
import Notification, { useNotification } from '@/components/Notification';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadSummary();
      loadRecentTransactions();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Check demo login
        const demoLoggedIn = localStorage.getItem('demo-logged-in');
        if (!demoLoggedIn) {
          router.push('/login');
          return;
        }
        setUser({ id: 'demo-user', email: 'demo@example.com' });
      } else {
        setUser(user);
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
      const response = await fetch(`/api/summary?user_id=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setSummary(result.data);
      } else {
        console.error('Error loading summary:', result.error);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      showNotification('Gagal memuat ringkasan keuangan', 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await fetch('/api/transactions?limit=5');
      const result = await response.json();
      
      if (result.success) {
        setRecentTransactions(result.data);
      } else {
        console.error('Error loading recent transactions:', result.error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.email}</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-medium mb-2">Saldo Total</h2>
          {loadingSummary ? (
            <div className="animate-pulse">
              <div className="h-8 bg-blue-500 rounded w-32 mb-2"></div>
              <div className="h-4 bg-blue-500 rounded w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold">
                {summary ? formatCurrency(summary.balance) : 'Rp 0'}
              </p>
              <div className="flex justify-between mt-4 text-sm">
                <div>
                  <p className="text-blue-100">Pemasukan</p>
                  <p className="font-medium">
                    {summary ? formatCurrency(summary.totalIncome) : 'Rp 0'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-100">Pengeluaran</p>
                  <p className="font-medium">
                    {summary ? formatCurrency(summary.totalExpense) : 'Rp 0'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/add-transaction?type=income" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow block">
            <div className="text-green-600 text-2xl mb-2">💰</div>
            <p className="font-medium text-gray-900">Tambah Pemasukan</p>
          </Link>
          <Link href="/add-transaction?type=expense" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow block">
            <div className="text-red-600 text-2xl mb-2">💸</div>
            <p className="font-medium text-gray-900">Tambah Pengeluaran</p>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
          <Link href="/transactions" className="text-blue-600 text-sm font-medium">
            Lihat Semua
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-600">Belum ada transaksi</p>
            <p className="text-sm text-gray-500 mt-2">Mulai catat keuangan Anda sekarang</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
      
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  )
}