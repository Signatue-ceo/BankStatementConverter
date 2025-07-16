import { NextRequest, NextResponse } from 'next/server'
import { BankStatementParser } from '@/utils/parser'
import { DataExporter } from '@/utils/exporters'
import { ExportFormat } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const format = formData.get('format') as ExportFormat

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!format || !['json', 'csv', 'excel'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format specified' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse the PDF
    const parser = new BankStatementParser()
    const text = await parser.extractTextFromPdf(buffer)
    const bankStatement = await parser.parseBankStatement(text)

    // Export to requested format
    const exportResult = await DataExporter.exportData(bankStatement, format)

    return NextResponse.json({
      success: true,
      data: bankStatement,
      export: {
        data: exportResult.data.toString('base64'),
        filename: exportResult.filename,
        mimeType: exportResult.mimeType
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 