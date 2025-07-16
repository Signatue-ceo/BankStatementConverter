// Transaction types
export interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  type: 'credit' | 'debit'
  balance?: number
  reference?: string
  category?: string
}

// Bank statement types
export interface BankStatement {
  id: string
  bankName?: string
  accountNumber?: string
  statementPeriod: {
    start: Date
    end: Date
  }
  openingBalance: number
  closingBalance: number
  transactions: Transaction[]
  metadata: {
    processingTime: number
    confidence: number
    sourceFormat: string
    totalTransactions: number
  }
}

// File processing types
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  result?: BankStatement
  error?: string
  createdAt: Date
  updatedAt: Date
}

// Export format types
export type ExportFormat = 'json' | 'csv' | 'excel'

// Processing status types
export interface ProcessingStatus {
  fileId: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  message?: string
  downloadUrl?: string
}

// User types
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Parsing configuration
export interface ParsingConfig {
  dateFormats: string[]
  amountPatterns: RegExp[]
  descriptionPatterns: RegExp[]
  balancePatterns: RegExp[]
  skipLines: RegExp[]
} 