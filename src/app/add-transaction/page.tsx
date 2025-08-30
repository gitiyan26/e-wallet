'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCategoriesByType } from '@/lib/database'
import { TransactionFormData } from '@/types'
import Notification, { useNotification } from '@/components/Notification'

export default function AddTransactionPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Freelance', 'Lainnya']
  const expenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']

  useEffect(() => {
    const initializePage = async () => {
      const user = await getCurrentUser()
      
      if (!user) {
        // Check demo login
        const demoLoggedIn = localStorage.getItem('demo-logged-in')
        if (!demoLoggedIn) {
          router.push('/login')
          return
        }
        setUser({ id: 'demo-user', email: 'demo@example.com' })
      } else {
        setUser(user)
      }
      setLoading(false)
      
      await loadCategories()
    }

    initializePage()
    
    // Check URL params for transaction type
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get('type')
    if (typeParam && ['income', 'expense'].includes(typeParam)) {
      setType(typeParam as 'income' | 'expense')
    }
  }, [])

  useEffect(() => {
    const loadCategoriesAsync = async () => {
      await loadCategories()
    }
    loadCategoriesAsync()
  }, [type])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false)
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategoryDropdown])

  const loadCategories = async () => {
    try {
      const cats = await getCategoriesByType(type)
      setCategories(cats || [])
      // Reset category when type changes
      if (category && !cats?.find(c => c.name === category)) {
        setCategory('')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (!amount || !description || !category) {
      showNotification('Semua field harus diisi', 'error')
      setSubmitting(false)
      return
    }

    if (parseFloat(amount) <= 0) {
      showNotification('Jumlah harus lebih dari 0', 'error')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          category,
          description,
          user_id: user.id
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        showNotification('Transaksi berhasil ditambahkan!', 'success')
        setTimeout(() => {
          router.push('/transactions')
        }, 1500)
      } else {
        showNotification(result.error || 'Terjadi kesalahan saat menyimpan transaksi', 'error')
      }
    } catch (err) {
      showNotification('Terjadi kesalahan saat menyimpan transaksi', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="px-6 py-8 flex items-center">
          <Link href="/transactions" className="mr-6 p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tambah Transaksi</h1>
            <p className="text-gray-600">Catat pemasukan atau pengeluaran</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-elegant">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Jenis Transaksi
              </label>
              <div className="flex space-x-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-md">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    type === 'expense'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span>Pengeluaran</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    type === 'income'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Pemasukan</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-bold text-gray-700 mb-3">
                Jumlah (Rp)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-6 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 font-medium text-lg"
                placeholder="0"
              />
            </div>

            {/* Category */}
            <div className="relative category-dropdown">
              <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-3">
                Kategori
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-6 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 font-medium text-left flex items-center justify-between"
              >
                <span className={category ? 'text-gray-900' : 'text-gray-500'}>
                  {category ? (
                    categories.find(cat => cat.name === category) ? 
                    `${categories.find(cat => cat.name === category)?.icon} ${category}` : 
                    category
                  ) : 'Pilih kategori'}
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-primary-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.name)
                          setShowCategoryDropdown(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-primary-50 rounded-lg transition-colors duration-150 flex items-center space-x-3"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-3">
                Deskripsi
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-6 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none font-medium"
                placeholder="Masukkan deskripsi transaksi"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${
                type === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Simpan Transaksi</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  )
}