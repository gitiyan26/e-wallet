'use client';

import { useState } from 'react';
import { useNotification } from './Notification';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [type, setType] = useState<'all' | 'income' | 'expense'>('all');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const { showNotification } = useNotification();

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const params = new URLSearchParams({
        user_id: 'demo-user',
        format
      });
      
      if (type !== 'all') {
        params.append('type', type);
      }
      
      if (category) {
        params.append('category', category);
      }
      
      if (startDate) {
        params.append('start_date', startDate);
      }
      
      if (endDate) {
        params.append('end_date', endDate);
      }

      const response = await fetch(`/api/export?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Data berhasil diexport!', 'success');
        onClose();
      } else {
        const error = await response.json();
        showNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Terjadi kesalahan saat export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 transform animate-scale-in">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Export Data Transaksi</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Format File
              </label>
              <div className="flex space-x-3">
                <label className="flex-1 flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md" 
                       style={{borderColor: format === 'csv' ? '#3B82F6' : '#E5E7EB', backgroundColor: format === 'csv' ? '#EFF6FF' : 'transparent'}}>
                  <input
                    type="radio"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value as 'csv')}
                    className="sr-only"
                  />
                  <span className={`font-semibold ${format === 'csv' ? 'text-primary-600' : 'text-gray-600'}`}>CSV</span>
                </label>
                <label className="flex-1 flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md"
                       style={{borderColor: format === 'json' ? '#3B82F6' : '#E5E7EB', backgroundColor: format === 'json' ? '#EFF6FF' : 'transparent'}}>
                  <input
                    type="radio"
                    value="json"
                    checked={format === 'json'}
                    onChange={(e) => setFormat(e.target.value as 'json')}
                    className="sr-only"
                  />
                  <span className={`font-semibold ${format === 'json' ? 'text-primary-600' : 'text-gray-600'}`}>JSON</span>
                </label>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Tipe Transaksi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'all' | 'income' | 'expense')}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
              >
                <option value="all">Semua Transaksi</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Kategori (Opsional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Masukkan kategori"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
            >
              {exporting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengexport...</span>
                </div>
              ) : (
                'Export'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}