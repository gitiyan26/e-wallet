'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Notification, { useNotification } from '@/components/Notification'

export default function SecurityPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [autoLockEnabled, setAutoLockEnabled] = useState(true)
  const [autoLockTime, setAutoLockTime] = useState('5')
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

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

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    showNotification(
      twoFactorEnabled ? 'Autentikasi dua faktor dinonaktifkan' : 'Autentikasi dua faktor diaktifkan',
      'success'
    )
  }

  const handleBiometricToggle = () => {
    setBiometricEnabled(!biometricEnabled)
    showNotification(
      biometricEnabled ? 'Login biometrik dinonaktifkan' : 'Login biometrik diaktifkan',
      'success'
    )
  }

  const handleAutoLockToggle = () => {
    setAutoLockEnabled(!autoLockEnabled)
    showNotification(
      autoLockEnabled ? 'Kunci otomatis dinonaktifkan' : 'Kunci otomatis diaktifkan',
      'success'
    )
  }

  const handleChangePassword = () => {
    showNotification('Fitur ubah password akan segera tersedia', 'info')
  }

  const handleViewLoginHistory = () => {
    showNotification('Fitur riwayat login akan segera tersedia', 'info')
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <Notification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="px-6 py-8">
          <div className="flex items-center mb-2">
            <Link href="/profile" className="mr-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Keamanan</h1>
          </div>
          <p className="text-gray-600">Kelola pengaturan keamanan akun Anda</p>
        </div>
      </div>

      {/* Security Settings */}
      <div className="p-6">
        {/* Password Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Password & Autentikasi</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleChangePassword}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Ubah Password</p>
                  <p className="text-sm text-gray-600">Perbarui password akun Anda</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Autentikasi Dua Faktor</p>
                  <p className="text-sm text-gray-600">Tambahan keamanan untuk akun Anda</p>
                </div>
              </div>
              <button
                onClick={handleTwoFactorToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Biometric Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Login Biometrik</h2>
          
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sidik Jari / Face ID</p>
                <p className="text-sm text-gray-600">Login cepat dengan biometrik</p>
              </div>
            </div>
            <button
              onClick={handleBiometricToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                biometricEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto Lock Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kunci Otomatis</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Aktifkan Kunci Otomatis</p>
                  <p className="text-sm text-gray-600">Kunci aplikasi saat tidak digunakan</p>
                </div>
              </div>
              <button
                onClick={handleAutoLockToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoLockEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoLockEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {autoLockEnabled && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Kunci Otomatis
                </label>
                <select
                  value={autoLockTime}
                  onChange={(e) => setAutoLockTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="1">1 menit</option>
                  <option value="5">5 menit</option>
                  <option value="10">10 menit</option>
                  <option value="30">30 menit</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Login History */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Login</h2>
          
          <button
            onClick={handleViewLoginHistory}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Riwayat Login</p>
                <p className="text-sm text-gray-600">Lihat aktivitas login terbaru</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}