'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BottomNavigation from '@/components/BottomNavigation';
import { Transaction } from '@/types';
import Notification, { useNotification } from '@/components/Notification';
import ExportModal from '@/components/ExportModal';

export default function TransactionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadCategories();
    }
  }, [user, activeTab, selectedCategory, selectedMonth]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        const allCategories = [...result.data.income, ...result.data.expense];
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showNotification('Gagal memuat kategori', 'error');
    }
  };

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

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('type', activeTab);
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      // Add month filter
      if (selectedMonth !== 'all') {
        const currentYear = new Date().getFullYear();
        const monthIndex = parseInt(selectedMonth) - 1; // Convert to 0-based index
        const startDate = new Date(currentYear, monthIndex, 1);
        const endDate = new Date(currentYear, monthIndex + 1, 0); // Last day of month
        
        params.append('dateFrom', startDate.toISOString().split('T')[0]);
        params.append('dateTo', endDate.toISOString().split('T')[0]);
      }
      
      params.append('limit', '50');
      
      // Get session token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.data);
      } else {
        console.error('Error loading transactions:', result.error);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      showNotification('Gagal memuat daftar transaksi', 'error');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const clearFilters = () => {
    setActiveTab('all');
    setSelectedCategory('all');
    setSelectedMonth('all');
    setShowFilters(false);
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
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium">Memuat transaksi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pb-20">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="flex items-center justify-between px-6 py-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaksi</h1>
            <p className="text-gray-600">Riwayat keuangan Anda</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-primary-100 text-primary-700 shadow-md' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all duration-200"
              title="Export Data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <Link
              href="/add-transaction"
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Add Transaction Button */}
      <div className="p-6">
        <Link
          href="/add-transaction"
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-2xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Transaksi
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 mb-8">
        <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-md">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            Semua
          </button>
          <button 
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'income' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            Pemasukan
          </button>
          <button 
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'expense' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-6 mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-elegant border border-primary-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Filter Lanjutan</h3>
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-all duration-200"
              >
                Reset
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 font-medium"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bulan
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 font-medium"
                >
                  <option value="all">Semua Bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="px-6">
        {loadingTransactions ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-elegant">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
            <p className="text-gray-700 font-medium">Memuat transaksi...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-elegant">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-2">Belum ada transaksi</p>
            <p className="text-gray-500 mb-6">Transaksi yang Anda buat akan muncul di sini</p>
            <Link
              href="/add-transaction"
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Tambah Transaksi Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-elegant hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-gradient-to-br from-green-100 to-green-200' 
                        : 'bg-gradient-to-br from-red-100 to-red-200'
                    }`}>
                      {transaction.type === 'income' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{transaction.description}</p>
                      <p className="text-sm text-gray-600 font-medium">{transaction.category}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}