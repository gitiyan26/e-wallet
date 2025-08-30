'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600">Kelola akun Anda</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Pengguna</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="text-green-600 font-medium">Aktif</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bergabung</span>
                <span className="font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'Tidak diketahui'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">🔔</span>
                <span className="font-medium">Notifikasi</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          <div className="bg-white rounded-xl">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">🔒</span>
                <span className="font-medium">Keamanan</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          <div className="bg-white rounded-xl">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">❓</span>
                <span className="font-medium">Bantuan</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          <div className="bg-white rounded-xl">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">ℹ️</span>
                <span className="font-medium">Tentang Aplikasi</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">🚪</span>
            Keluar dari Akun
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}