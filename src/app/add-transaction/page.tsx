'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Freelance', 'Lainnya']
  const expenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
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
    }

    getUser()
    loadCategories()
    
    // Check URL params for transaction type
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get('type')
    if (typeParam && ['income', 'expense'].includes(typeParam)) {
      setType(typeParam as 'income' | 'expense')
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [type])

  const loadCategories = () => {
    const cats = getCategoriesByType(type)
    setCategories(cats)
    // Reset category when type changes
    if (category && !cats.find(c => c.name === category)) {
      setCategory('')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 flex items-center">
          <Link href="/transactions" className="mr-4 text-gray-600 hover:text-gray-900">
            ← Kembali
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Transaksi</h1>
            <p className="text-gray-600">Catat pemasukan atau pengeluaran</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Jenis Transaksi
              </label>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    type === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  💸 Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    type === 'income'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  💰 Pemasukan
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah (Rp)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="0"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Masukkan deskripsi transaksi"
              />
            </div>



            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'income'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
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