'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Transaksi Berhasil',
      message: 'Transaksi pengeluaran sebesar Rp 50.000 telah berhasil disimpan',
      time: '2 jam yang lalu',
      read: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'Pengingat Budget',
      message: 'Anda telah menggunakan 80% dari budget bulanan Anda',
      time: '1 hari yang lalu',
      read: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Laporan Bulanan',
      message: 'Laporan keuangan bulan ini telah tersedia',
      time: '3 hari yang lalu',
      read: true,
      type: 'info'
    }
  ])
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

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
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

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Link href="/profile" className="mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Notifikasi</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-6">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-elegant transition-all duration-200 hover:shadow-lg ${
                !notification.read ? 'border-l-4 border-primary-500' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start">
                {getNotificationIcon(notification.type)}
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className={`font-semibold text-gray-900 mb-1 ${
                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-2"></div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                  <p className="text-gray-400 text-xs">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Notifikasi</h3>
            <p className="text-gray-600">Notifikasi akan muncul di sini ketika ada aktivitas baru</p>
          </div>
        )}
      </div>
    </div>
  )
}