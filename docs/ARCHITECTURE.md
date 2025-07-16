# 🏗️ System Architecture Documentation

## 📋 Overview

The Bank Statement Converter SaaS is built as a modern, serverless web application using Next.js 14 with a microservices-like architecture. The system is designed for scalability, maintainability, and cost-effectiveness.

## 🎯 Architecture Principles

- **Serverless First**: Leverage Vercel's serverless functions for scalability
- **Type Safety**: Full TypeScript implementation for reliability
- **Component-Based**: Modular React components for maintainability
- **Database-First**: Supabase PostgreSQL for data persistence
- **Security-First**: Row-level security and input validation
- **Performance-Optimized**: Minimal bundle size and fast processing

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router                                      │
│  ├── app/page.tsx (Homepage)                                │
│  ├── app/layout.tsx (Root Layout)                           │
│  ├── app/api/convert/route.ts (API Endpoint)               │
│  └── components/FileUpload.tsx (Upload Component)          │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ├── utils/parser.ts (PDF Parsing Engine)                  │
│  ├── utils/exporters.ts (Data Export Logic)                │
│  └── lib/supabase.ts (Database Client)                     │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)                                      │
│  ├── users (User Management)                                │
│  ├── files (File Processing History)                        │
│  └── storage (File Storage)                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React hooks (useState, useEffect)
- **File Upload**: react-dropzone

### **Backend**
- **Runtime**: Node.js (Vercel Functions)
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **PDF Processing**: pdf-parse

### **Infrastructure**
- **Hosting**: Vercel (Serverless)
- **CDN**: Vercel Edge Network
- **Database**: Supabase (Managed PostgreSQL)
- **Monitoring**: Vercel Analytics

## 📁 Project Structure

```
bank-statement-converter/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   └── convert/              # PDF conversion endpoint
│   │       └── route.ts
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   └── FileUpload.tsx           # File upload component
├── lib/                         # Library configurations
│   └── supabase.ts              # Supabase client
├── types/                       # TypeScript definitions
│   └── index.ts                 # Main type definitions
├── utils/                       # Utility functions
│   ├── parser.ts                # PDF parsing logic
│   └── exporters.ts             # Data export functions
├── docs/                        # Documentation
├── test/                        # Test files
└── public/                      # Static assets
```

## 🔄 Data Flow

### **1. File Upload Flow**
```
User Upload → File Validation → Supabase Storage → Processing Queue → Parser → Database → Export → Download
```

### **2. PDF Processing Flow**
```
PDF File → Text Extraction → Pattern Matching → Transaction Parsing → Data Validation → Structured Output
```

### **3. Export Flow**
```
Structured Data → Format Selection → Data Transformation → File Generation → Download Link → User Download
```

## 🗄️ Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Files Table**
```sql
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'error')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Security Architecture

### **Authentication**
- Supabase Auth with JWT tokens
- Row-level security (RLS) policies
- Session management

### **Data Protection**
- Input validation and sanitization
- File type and size restrictions
- Temporary file processing (no permanent storage)
- CORS protection

### **Database Security**
- Encrypted connections
- Row-level security policies
- Prepared statements
- Input sanitization

## 📊 Performance Considerations

### **Frontend Optimization**
- Code splitting with Next.js
- Image optimization
- CSS purging with Tailwind
- Lazy loading of components

### **Backend Optimization**
- Serverless function optimization
- Database query optimization
- Caching strategies
- Memory management

### **Processing Optimization**
- Efficient regex patterns
- Batch processing capabilities
- Progress tracking
- Error handling

## 🔄 State Management

### **Local State**
- File upload status
- Processing progress
- UI interactions
- Form data

### **Server State**
- User authentication
- File processing history
- Database records
- Export results

## 🚀 Deployment Architecture

### **Development**
- Local Next.js development server
- Local Supabase instance (optional)
- Hot reloading
- Debug tools

### **Production**
- Vercel serverless deployment
- Supabase production database
- CDN for static assets
- Environment-specific configurations

## 🔧 Configuration Management

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Bank Statement Converter"
```

### **Build Configuration**
- Next.js configuration
- TypeScript configuration
- Tailwind CSS configuration
- ESLint and Prettier setup

## 📈 Scalability Considerations

### **Horizontal Scaling**
- Serverless functions auto-scale
- Database connection pooling
- CDN for static assets
- Load balancing (handled by Vercel)

### **Vertical Scaling**
- Database performance optimization
- Function memory allocation
- Processing time limits
- File size restrictions

## 🔍 Monitoring and Logging

### **Application Monitoring**
- Vercel Analytics
- Error tracking
- Performance monitoring
- User analytics

### **Database Monitoring**
- Supabase dashboard
- Query performance
- Connection monitoring
- Storage usage

## 🛠️ Maintenance Considerations

### **Code Maintenance**
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component documentation

### **Database Maintenance**
- Regular backups
- Index optimization
- Query optimization
- Storage cleanup

### **Infrastructure Maintenance**
- Dependency updates
- Security patches
- Performance monitoring
- Cost optimization 