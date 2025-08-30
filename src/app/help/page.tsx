'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HelpPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const router = useRouter()

  const faqs = [
    {
      id: 1,
      question: 'Bagaimana cara menambahkan transaksi baru?',
      answer: 'Untuk menambahkan transaksi baru, klik tombol "+" di halaman dashboard atau navigasi ke halaman "Tambah Transaksi". Pilih jenis transaksi (pemasukan/pengeluaran), masukkan jumlah, kategori, dan deskripsi, lalu klik "Simpan Transaksi".'
    },
    {
      id: 2,
      question: 'Bagaimana cara melihat laporan keuangan?',
      answer: 'Anda dapat melihat laporan keuangan dengan mengakses halaman "Laporan" melalui navigasi bawah. Di sana Anda dapat melihat ringkasan bulanan dan tahunan dari transaksi Anda.'
    },
    {
      id: 3,
      question: 'Bagaimana cara mengubah kategori transaksi?',
      answer: 'Saat ini fitur edit transaksi belum tersedia. Namun Anda dapat menghapus transaksi yang salah dan membuat transaksi baru dengan kategori yang benar.'
    },
    {
      id: 4,
      question: 'Apakah data saya aman?',
      answer: 'Ya, data Anda disimpan dengan aman menggunakan enkripsi dan sistem keamanan terkini. Kami tidak membagikan data pribadi Anda kepada pihak ketiga.'
    },
    {
      id: 5,
      question: 'Bagaimana cara mengatur budget bulanan?',
      answer: 'Fitur pengaturan budget akan segera tersedia dalam update mendatang. Saat ini Anda dapat memantau pengeluaran melalui halaman laporan.'
    },
    {
      id: 6,
      question: 'Bagaimana cara backup data?',
      answer: 'Data Anda secara otomatis tersimpan di cloud. Fitur export data akan tersedia dalam update mendatang untuk backup manual.'
    }
  ]

  const helpTopics = [
    {
      title: 'Memulai',
      description: 'Panduan dasar menggunakan aplikasi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: 'Transaksi',
      description: 'Cara mengelola transaksi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: 'Laporan',
      description: 'Memahami laporan keuangan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: 'Keamanan',
      description: 'Pengaturan keamanan akun',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
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
        setUser({ id: 'demo-user', email: 'demo@example.com' })
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [])

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
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
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-elegant">
        <div className="px-6 py-8">
          <div className="flex items-center mb-2">
            <Link href="/profile" className="mr-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Bantuan</h1>
          </div>
          <p className="text-gray-600">Temukan jawaban untuk pertanyaan Anda</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Quick Help Topics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Topik Bantuan</h2>
          <div className="grid grid-cols-2 gap-4">
            {helpTopics.map((topic, index) => (
              <div key={index} className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-elegant hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3 text-primary-600">
                  {topic.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pertanyaan yang Sering Diajukan</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white/95 backdrop-blur-md rounded-2xl shadow-elegant overflow-hidden">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-5 pb-5">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Butuh Bantuan Lebih Lanjut?</h2>
          <p className="text-gray-600 mb-6">
            Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim dukungan kami.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-primary-50 rounded-xl">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-sm text-gray-600">support@ewallet.com</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-success-50 rounded-xl">
              <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Live Chat</p>
                <p className="text-sm text-gray-600">Tersedia 24/7</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-warning-50 rounded-xl">
              <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Telepon</p>
                <p className="text-sm text-gray-600">+62 21 1234 5678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}