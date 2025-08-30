'use client'

import { useState, useEffect } from 'react'
import { migrateFromLocalStorage, hasLocalStorageData, getLocalStorageStats } from '@/lib/migrate'

interface MigrationModalProps {
  isOpen: boolean
  onClose: () => void
  onMigrationComplete: () => void
}

export default function MigrationModal({ isOpen, onClose, onMigrationComplete }: MigrationModalProps) {
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [stats, setStats] = useState({ transactionCount: 0, hasUserData: false })

  useEffect(() => {
    if (isOpen) {
      setStats(getLocalStorageStats())
      setMigrationResult(null)
    }
  }, [isOpen])

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      const result = await migrateFromLocalStorage()
      setMigrationResult(result)
      
      if (result.success) {
        setTimeout(() => {
          onMigrationComplete()
          onClose()
        }, 3000)
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: `Terjadi kesalahan: ${error}`
      })
    } finally {
      setMigrating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Migrasi Data</h2>
          <p className="text-gray-600">Pindahkan data dari penyimpanan lokal ke Supabase</p>
        </div>

        {!migrationResult ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Data yang akan dimigrasi:</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Transaksi:</span>
                  <span className="font-medium">{stats.transactionCount} item</span>
                </div>
                <div className="flex justify-between">
                  <span>Data User:</span>
                  <span className="font-medium">{stats.hasUserData ? 'Ya' : 'Tidak'}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Penting:</p>
                  <p>Proses ini akan memindahkan semua data lokal ke database Supabase. Pastikan Anda sudah login dengan akun yang benar.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleMigrate}
                disabled={migrating || stats.transactionCount === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {migrating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Migrasi...</span>
                  </div>
                ) : (
                  'Mulai Migrasi'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`rounded-2xl p-6 mb-6 ${
              migrationResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                <svg 
                  className={`w-6 h-6 mt-0.5 flex-shrink-0 ${
                    migrationResult.success ? 'text-green-600' : 'text-red-600'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {migrationResult.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                <div>
                  <h3 className={`font-semibold mb-2 ${
                    migrationResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {migrationResult.success ? 'Migrasi Berhasil!' : 'Migrasi Gagal'}
                  </h3>
                  <p className={`text-sm ${
                    migrationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {migrationResult.message}
                  </p>
                  
                  {migrationResult.details?.errors && migrationResult.details.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-900 mb-2">Error Details:</p>
                      <ul className="text-xs text-red-800 space-y-1">
                        {migrationResult.details.errors.map((error: string, index: number) => (
                          <li key={index} className="list-disc list-inside">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all font-medium"
            >
              {migrationResult.success ? 'Selesai' : 'Tutup'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Hook untuk mengecek apakah perlu menampilkan modal migrasi
export function useMigrationCheck() {
  const [shouldShowMigration, setShouldShowMigration] = useState(false)

  useEffect(() => {
    // Cek apakah ada data localStorage yang perlu dimigrasi
    if (typeof window !== 'undefined') {
      const hasData = hasLocalStorageData()
      const migrationDone = localStorage.getItem('migration-completed')
      
      setShouldShowMigration(hasData && !migrationDone)
    }
  }, [])

  const markMigrationComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('migration-completed', 'true')
    }
    setShouldShowMigration(false)
  }

  return {
    shouldShowMigration,
    setShouldShowMigration,
    markMigrationComplete
  }
}