import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_name: string
          file_size: number
          status: 'uploading' | 'processing' | 'completed' | 'error'
          result: any | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          original_name: string
          file_size: number
          status?: 'uploading' | 'processing' | 'completed' | 'error'
          result?: any | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          original_name?: string
          file_size?: number
          status?: 'uploading' | 'processing' | 'completed' | 'error'
          result?: any | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 