'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ExportFormat } from '@/types'

interface FileUploadProps {
  onFileSelect: (file: File, format: ExportFormat) => void
  isProcessing: boolean
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      toast.success('File selected successfully')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  })

  const handleConvert = () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    onFileSelect(selectedFile, selectedFormat)
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const formatOptions: { value: ExportFormat; label: string; description: string }[] = [
    {
      value: 'json',
      label: 'JSON',
      description: 'Structured data format for developers'
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Comma-separated values for spreadsheets'
    },
    {
      value: 'excel',
      label: 'Excel',
      description: 'Microsoft Excel format with formatting'
    }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Convert Bank Statement PDF</h1>
          <p className="card-description">
            Upload your bank statement PDF and convert it to structured data format
          </p>
        </div>

        <div className="card-content space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File
            </label>
            <div
              {...getRootProps()}
              className={`file-upload-area ${
                isDragActive ? 'dragover' : ''
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop the PDF here' : 'Drag & drop your PDF here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Supports PDF files up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-green-600 hover:text-green-800"
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formatOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 ${
                    selectedFormat === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={selectedFormat === option.value}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    className="sr-only"
                    disabled={isProcessing}
                  />
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {option.description}
                    </span>
                  </div>
                  {selectedFormat === option.value && (
                    <CheckCircle className="h-5 w-5 text-primary absolute top-2 right-2" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Convert Button */}
          <div className="flex justify-center">
            <button
              onClick={handleConvert}
              disabled={!selectedFile || isProcessing}
              className="btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <File className="h-4 w-4 mr-2" />
                  Convert to {selectedFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Processing your PDF...
                  </p>
                  <p className="text-xs text-blue-600">
                    This may take a few moments depending on file size
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No OCR Required</h3>
          <p className="text-xs text-gray-500">
            Works with text-based PDFs without expensive OCR processing
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <File className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Any Bank Format</h3>
          <p className="text-xs text-gray-500">
            Universal parser works with statements from any bank
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Multiple Formats</h3>
          <p className="text-xs text-gray-500">
            Export to JSON, CSV, or Excel based on your needs
          </p>
        </div>
      </div>
    </div>
  )
} 