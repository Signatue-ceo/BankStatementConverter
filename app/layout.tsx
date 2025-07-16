import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bank Statement Converter - Convert PDF to Structured Data',
  description: 'Transform any bank statement PDF into structured JSON, CSV, or Excel format. No OCR required, works with any bank format.',
  keywords: 'bank statement, PDF converter, financial data, CSV, Excel, JSON, fintech',
  authors: [{ name: 'Bank Statement Converter' }],
  creator: 'Bank Statement Converter',
  publisher: 'Bank Statement Converter',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Bank Statement Converter - Convert PDF to Structured Data',
    description: 'Transform any bank statement PDF into structured JSON, CSV, or Excel format. No OCR required, works with any bank format.',
    url: '/',
    siteName: 'Bank Statement Converter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bank Statement Converter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bank Statement Converter - Convert PDF to Structured Data',
    description: 'Transform any bank statement PDF into structured JSON, CSV, or Excel format. No OCR required, works with any bank format.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
} 