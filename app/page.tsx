'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import { BankStatement, ExportFormat } from '@/types'
import { DataExporter } from '@/utils/exporters'
import { toast } from 'react-hot-toast'

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<BankStatement | null>(null)

  const handleFileSelect = async (file: File, format: ExportFormat) => {
    setIsProcessing(true)

    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Send to API for processing
      const formData = new FormData()
      formData.append('file', file)
      formData.append('format', format)

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process file')
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        toast.success('File processed successfully!')

        // Auto-download the result
        const exportResult = await DataExporter.exportData(data.data, format)
        DataExporter.downloadFile(exportResult.data, exportResult.filename, exportResult.mimeType)
      } else {
        throw new Error(data.error || 'Processing failed')
      }
    } catch (error) {
      console.error('Processing error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Bank Statement Converter
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                Pricing
              </a>
              <a href="#contact" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                Contact
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Convert Bank Statements to
              <span className="text-indigo-600"> Structured Data</span>
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Transform any bank statement PDF into JSON, CSV, or Excel format. 
              No OCR required, works with any bank format.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <a
                href="#upload"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Upload Section */}
      <section id="upload" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          </div>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                Processing Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Bank</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.bankName || 'Unknown'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Transactions</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.transactions.length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Confidence</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.metadata.confidence}% 
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Processing Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.metadata.processingTime}ms
                  </p>
                </div>
              </div>

              {/* Sample Transactions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Sample Transactions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.transactions.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                          <td className="py-2 text-gray-600 max-w-xs truncate">
                            {transaction.description}
                          </td>
                          <td className="py-2 font-medium">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              transaction.type === 'credit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-2">
                            {result.transactions.length > 5 && (
                              <p className="text-sm text-gray-500 mt-2">
                                Showing first 5 of {result.transactions.length} transactions
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Our Converter?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Built for accountants, analysts, and developers who need reliable data extraction
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Lightning Fast</h3>
                <p className="mt-2 text-base text-gray-500">
                  Process PDFs in seconds, not minutes. No waiting for OCR processing.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Universal Compatibility</h3>
                <p className="mt-2 text-base text-gray-500">
                  Works with statements from any bank, credit union, or financial institution.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Multiple Formats</h3>
                <p className="mt-2 text-base text-gray-500">
                  Export to JSON for developers, CSV for spreadsheets, or Excel with formatting.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Processing</h3>
                <p className="mt-2 text-base text-gray-500">
                  Your financial data is processed securely and never stored permanently.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">High Accuracy</h3>
                <p className="mt-2 text-base text-gray-500">
                  Advanced parsing algorithms ensure 95%+ accuracy in data extraction.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">No Setup Required</h3>
                <p className="mt-2 text-base text-gray-500">
                  Start converting immediately. No registration, no templates, no configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">
                Bank Statement Converter
              </h3>
              <p className="text-gray-300 text-sm">
                Transform bank statement PDFs into structured data formats. 
                Built for professionals who need reliable, fast data extraction.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-300 text-sm text-center">
              © 2024 Bank Statement Converter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}