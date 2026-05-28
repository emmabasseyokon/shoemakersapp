export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'admin'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'admin'
          avatar_url?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          id: string
          full_name: string
          phone: string
          address: string | null
          membership_number: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          address?: string | null
          membership_number: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          address?: string | null
          membership_number?: string
          active?: boolean
        }
        Relationships: []
      }
      bill_types: {
        Row: {
          id: string
          name: string
          default_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          default_amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          default_amount?: number | null
        }
        Relationships: []
      }
      monthly_bills: {
        Row: {
          id: string
          member_id: string
          bill_type_id: string
          year: number
          month: number
          amount: number
          paid: boolean
          paid_date: string | null
          notes: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          bill_type_id: string
          year: number
          month: number
          amount?: number
          paid?: boolean
          paid_date?: string | null
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          bill_type_id?: string
          year?: number
          month?: number
          amount?: number
          paid?: boolean
          paid_date?: string | null
          notes?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          { foreignKeyName: 'monthly_bills_member_id_fkey'; columns: ['member_id']; referencedRelation: 'members'; referencedColumns: ['id'] },
          { foreignKeyName: 'monthly_bills_bill_type_id_fkey'; columns: ['bill_type_id']; referencedRelation: 'bill_types'; referencedColumns: ['id'] },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile    = Database['public']['Tables']['profiles']['Row']
export type Member     = Database['public']['Tables']['members']['Row']
export type BillType   = Database['public']['Tables']['bill_types']['Row']
export type MonthlyBill = Database['public']['Tables']['monthly_bills']['Row']
