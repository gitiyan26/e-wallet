'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '🏠',
      active: pathname === '/dashboard'
    },
    {
      name: 'Transaksi',
      href: '/transactions',
      icon: '📊',
      active: pathname === '/transactions'
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: '👤',
      active: pathname === '/profile'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              item.active
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
        
        <button
          onClick={handleLogout}
          className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-600 hover:text-red-600"
        >
          <span className="text-xl mb-1">🚪</span>
          <span className="text-xs font-medium">Keluar</span>
        </button>
      </div>
    </div>
  )
}