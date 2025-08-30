'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNavigation from '@/components/BottomNavigation'
import Notification, { useNotification } from '@/components/Notification'

interface MonthlyReport {
  month: string
  year: number
  income: number
  expense: number
  balance: number
}

interface DailyTransaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
}

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([])
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('monthly')
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      
      if (!user) {
        // Check demo login
        const demoLoggedIn = localStorage.getItem('demo-logged-in')
        if (!demoLoggedIn) {
          router.push('/login')
          return
        }
        setUser({ id: 'demo-user-id', email: 'demo@example.com' })
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [])

  useEffect(() => {
    if (user) {
      if (viewMode === 'yearly') {
        loadMonthlyReports()
      } else {
        loadMonthlyTransactions()
      }
    }
  }, [user, selectedYear, selectedMonth, viewMode])

  const loadMonthlyReports = async () => {
    try {
      const response = await fetch(`/api/reports/monthly?year=${selectedYear}&user_id=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setMonthlyReports(data.reports)
      } else {
        showNotification('Gagal memuat laporan', 'error')
      }
    } catch (error) {
      console.error('Error loading monthly reports:', error)
      showNotification('Terjadi kesalahan saat memuat laporan', 'error')
    }
  }

  const loadMonthlyTransactions = async () => {
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1)
      const endDate = new Date(selectedYear, selectedMonth, 0)
      
      const response = await fetch(`/api/transactions?user_id=${user.id}&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setDailyTransactions(data.transactions || [])
      } else {
        showNotification('Gagal memuat transaksi', 'error')
      }
    } catch (error) {
      console.error('Error loading monthly transactions:', error)
      showNotification('Terjadi kesalahan saat memuat transaksi', 'error')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i)
    }
    return years
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-elegant p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="p-2 hover:bg-primary-100 rounded-lg transition-colors">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {viewMode === 'yearly' ? 'Laporan Tahunan' : 'Laporan Bulanan'}
            </h1>
            <div className="w-10"></div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Per Bulan
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'yearly'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Per Tahun
              </button>
            </div>
          </div>
          
          {/* Date Selectors */}
          <div className="flex items-center justify-center space-x-4">
            {viewMode === 'monthly' && (
              <>
                <label className="text-sm font-medium text-gray-700">Bulan:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium text-sm"
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>{month}</option>
                  ))}
                </select>
              </>
            )}
            <label className="text-sm font-medium text-gray-700">Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium text-sm"
            >
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports */}
        <div className="px-6 space-y-4">
          {viewMode === 'yearly' ? (
            // Yearly View
            monthlyReports.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-md">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Belum ada data transaksi untuk tahun {selectedYear}</p>
                <p className="text-gray-500 text-sm mt-2">Mulai tambahkan transaksi untuk melihat laporan bulanan</p>
              </div>
            ) : (
              monthlyReports.map((report, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {months[parseInt(report.month) - 1]} {report.year}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.balance >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {report.balance >= 0 ? 'Surplus' : 'Defisit'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Income */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Pemasukan</p>
                        <p className="text-sm text-gray-600">Total masuk</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(report.income)}</p>
                  </div>
                  
                  {/* Expense */}
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Pengeluaran</p>
                        <p className="text-sm text-gray-600">Total keluar</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600">{formatCurrency(report.expense)}</p>
                  </div>
                  
                  {/* Balance */}
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    report.balance >= 0 ? 'bg-primary-50' : 'bg-orange-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        report.balance >= 0 ? 'bg-primary-500' : 'bg-orange-500'
                      }`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Saldo Akhir</p>
                        <p className="text-sm text-gray-600">Selisih bulan ini</p>
                      </div>
                    </div>
                    <p className={`font-bold ${
                      report.balance >= 0 ? 'text-primary-600' : 'text-orange-600'
                    }`}>
                      {formatCurrency(report.balance)}
                    </p>
                  </div>
                </div>
              </div>
              ))
            )
          ) : (
            // Monthly View
            <>
              {/* Monthly Summary */}
              {(() => {
                const income = dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
                const expense = dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                const balance = income - expense
                
                return (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Ringkasan {months[selectedMonth - 1]} {selectedYear}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Pemasukan</p>
                        <p className="font-bold text-green-600">{formatCurrency(income)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Pengeluaran</p>
                        <p className="font-bold text-red-600">{formatCurrency(expense)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Saldo</p>
                        <p className={`font-bold ${
                          balance >= 0 ? 'text-primary-600' : 'text-orange-600'
                        }`}>
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
              
              {/* Daily Transactions */}
              {dailyTransactions.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-md">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Belum ada transaksi untuk {months[selectedMonth - 1]} {selectedYear}</p>
                  <p className="text-gray-500 text-sm mt-2">Mulai tambahkan transaksi untuk melihat laporan</p>
                </div>
              ) : (
                dailyTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={transaction.type === 'income' ? 'M12 6v6m0 0v6m0-6h6m-6 0H6' : 'M20 12H4'} />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.category}</p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
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