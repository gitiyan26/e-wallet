'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AboutPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
        setUser({ id: 'demo-user', email: 'demo@example.com' })
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="px-6 py-8">
          <div className="flex items-center mb-2">
            <Link href="/profile" className="mr-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Tentang Aplikasi</h1>
          </div>
          <p className="text-gray-600">Informasi tentang E-Wallet App</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* App Info */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-elegant">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">E-Wallet App</h2>
            <p className="text-gray-600 mb-4">Aplikasi manajemen keuangan pribadi yang mudah dan aman</p>
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full">
              <span className="text-primary-700 font-semibold">Versi 1.0.0</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Mudah Digunakan</h3>
                <p className="text-gray-600 text-sm">Interface yang intuitif dan user-friendly untuk semua kalangan</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Aman & Terpercaya</h3>
                <p className="text-gray-600 text-sm">Data Anda dilindungi dengan enkripsi tingkat bank</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Laporan Lengkap</h3>
                <p className="text-gray-600 text-sm">Analisis keuangan mendalam dengan visualisasi yang menarik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fitur Utama</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium">Pencatatan Transaksi</span>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium">Kategorisasi Otomatis</span>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium">Laporan Keuangan</span>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium">Notifikasi Pintar</span>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Developer</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dikembangkan oleh</span>
              <span className="font-semibold text-gray-900">E-Wallet Team</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tanggal Rilis</span>
              <span className="font-semibold text-gray-900">Januari 2024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Platform</span>
              <span className="font-semibold text-gray-900">Web Application</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Teknologi</span>
              <span className="font-semibold text-gray-900">Next.js, React, TypeScript</span>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Legal & Privasi</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">Syarat & Ketentuan</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">Kebijakan Privasi</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">Lisensi Open Source</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            © 2024 E-Wallet App. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Made with ❤️ for better financial management
          </p>
        </div>
      </div>
    </div>
  )
}