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
      
      const response = await fetch(`/api/transactions?${params}`);
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
        <div className="flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
            <p className="text-gray-600">Riwayat keuangan Anda</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <Link
              href="/add-transaction"
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Add Transaction Button */}
      <div className="p-4">
        <Link
          href="/add-transaction"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">➕</span>
          Tambah Transaksi
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Semua
          </button>
          <button 
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'income' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Pemasukan
          </button>
          <button 
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'expense' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Filter Lanjutan</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Reset
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="px-4">
        {loadingTransactions ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat transaksi...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <p className="text-gray-600 font-medium">Belum ada transaksi</p>
            <p className="text-sm text-gray-500 mt-2">Transaksi yang Anda buat akan muncul di sini</p>
            <Link
              href="/add-transaction"
              className="inline-block mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Tambah Transaksi Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-lg">
                        {transaction.type === 'income' ? '💰' : '💸'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
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