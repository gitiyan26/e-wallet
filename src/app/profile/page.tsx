'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

export default function ProfilePage() {
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
        setUser({ id: 'demo-user', email: 'demo@example.com', created_at: new Date().toISOString() })
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    // Check if demo user
    const demoLoggedIn = localStorage.getItem('demo-logged-in')
    if (demoLoggedIn) {
      localStorage.removeItem('demo-logged-in')
    } else {
      await signOut()
    }
    router.push('/login')
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pb-20">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil</h1>
          <p className="text-gray-600">Kelola akun dan preferensi Anda</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-elegant">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Pengguna</h2>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200/50 pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Email</span>
                <span className="font-semibold text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Status</span>
                <span className="text-success-600 font-semibold bg-success-50 px-3 py-1 rounded-full text-sm">Aktif</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Bergabung</span>
                <span className="font-semibold text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'Tidak diketahui'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-elegant overflow-hidden">
            <button 
              onClick={() => router.push('/notifications')}
              className="w-full p-5 flex items-center justify-between hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Notifikasi</span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-elegant overflow-hidden">
            <button 
              onClick={() => router.push('/security')}
              className="w-full p-5 flex items-center justify-between hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Keamanan</span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-elegant overflow-hidden">
            <button 
              onClick={() => router.push('/help')}
              className="w-full p-5 flex items-center justify-between hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Bantuan</span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-elegant overflow-hidden">
            <button 
              onClick={() => router.push('/about')}
              className="w-full p-5 flex items-center justify-between hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Tentang Aplikasi</span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-error-500 to-error-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar dari Akun
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}