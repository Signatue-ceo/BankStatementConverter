import { BankStatement, Transaction, ExportFormat } from '@/types'
import { format } from 'date-fns'

export class DataExporter {
  /**
   * Export bank statement data to specified format
   */
  static async exportData(
    bankStatement: BankStatement,
    format: ExportFormat
  ): Promise<{ data: string | Buffer; filename: string; mimeType: string }> {
    switch (format) {
      case 'json':
        return this.exportToJson(bankStatement)
      case 'csv':
        return this.exportToCsv(bankStatement)
      case 'excel':
        return this.exportToExcel(bankStatement)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Export to JSON format
   */
  private static exportToJson(bankStatement: BankStatement): {
    data: string
    filename: string
    mimeType: string
  } {
    const data = JSON.stringify(bankStatement, null, 2)
    const filename = `bank-statement-${format(new Date(), 'yyyy-MM-dd')}.json`
    
    return {
      data,
      filename,
      mimeType: 'application/json'
    }
  }

  /**
   * Export to CSV format
   */
  private static exportToCsv(bankStatement: BankStatement): {
    data: string
    filename: string
    mimeType: string
  } {
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Type',
      'Balance',
      'Reference'
    ]

    const rows = bankStatement.transactions.map(transaction => [
      format(transaction.date, 'yyyy-MM-dd'),
      `"${transaction.description.replace(/"/g, '""')}"`,
      transaction.amount.toFixed(2),
      transaction.type,
      transaction.balance ? transaction.balance.toFixed(2) : '',
      transaction.reference || ''
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const filename = `bank-statement-${format(new Date(), 'yyyy-MM-dd')}.csv`

    return {
      data: csvContent,
      filename,
      mimeType: 'text/csv'
    }
  }

  /**
   * Export to Excel format
   */
  private static async exportToExcel(bankStatement: BankStatement): Promise<{
    data: Buffer
    filename: string
    mimeType: string
  }> {
    try {
      // Dynamic import to avoid SSR issues
      const XLSX = await import('xlsx')
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      
      // Prepare transaction data
      const transactionData = bankStatement.transactions.map(transaction => ({
        Date: format(transaction.date, 'yyyy-MM-dd'),
        Description: transaction.description,
        Amount: transaction.amount,
        Type: transaction.type,
        Balance: transaction.balance || '',
        Reference: transaction.reference || ''
      }))

      // Create transaction worksheet
      const transactionWorksheet = XLSX.utils.json_to_sheet(transactionData)
      XLSX.utils.book_append_sheet(workbook, transactionWorksheet, 'Transactions')

      // Create summary worksheet
      const summaryData = [
        { Field: 'Bank Name', Value: bankStatement.bankName || 'N/A' },
        { Field: 'Account Number', Value: bankStatement.accountNumber || 'N/A' },
        { Field: 'Statement Period Start', Value: format(bankStatement.statementPeriod.start, 'yyyy-MM-dd') },
        { Field: 'Statement Period End', Value: format(bankStatement.statementPeriod.end, 'yyyy-MM-dd') },
        { Field: 'Opening Balance', Value: bankStatement.openingBalance },
        { Field: 'Closing Balance', Value: bankStatement.closingBalance },
        { Field: 'Total Transactions', Value: bankStatement.transactions.length },
        { Field: 'Processing Confidence', Value: `${bankStatement.metadata.confidence}%` },
        { Field: 'Processing Time', Value: `${bankStatement.metadata.processingTime}ms` }
      ]

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      const filename = `bank-statement-${format(new Date(), 'yyyy-MM-dd')}.xlsx`

      return {
        data: excelBuffer,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    } catch (error) {
      throw new Error(`Failed to export to Excel: ${error}`)
    }
  }

  /**
   * Generate download URL for exported data
   */
  static generateDownloadUrl(
    data: string | Buffer,
    filename: string,
    mimeType: string
  ): string {
    const blob = new Blob([data], { type: mimeType })
    return URL.createObjectURL(blob)
  }

  /**
   * Download file to user's device
   */
  static downloadFile(
    data: string | Buffer,
    filename: string,
    mimeType: string
  ): void {
    const url = this.generateDownloadUrl(data, filename, mimeType)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
} 