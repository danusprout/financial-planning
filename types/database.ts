// Generated types based on supabase/migrations/001_initial_schema.sql
// Regenerate: supabase gen types typescript --project-id <ref> > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      banks: {
        Row: {
          id: string
          user_id: string | null
          name: string
          type: 'bank' | 'ewallet' | 'cash' | 'credit'
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          type: 'bank' | 'ewallet' | 'cash' | 'credit'
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          type?: 'bank' | 'ewallet' | 'cash' | 'credit'
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          color: string | null
          group: 'needs' | 'wants' | 'obligations'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          color?: string | null
          group: 'needs' | 'wants' | 'obligations'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          color?: string | null
          group?: 'needs' | 'wants' | 'obligations'
          created_at?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          month: string
          source: string
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          source: string
          amount: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          source?: string
          amount?: number
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          date: string
          category_id: string | null
          bank_id: string | null
          amount: number
          description: string
          status: 'planned' | 'paid' | 'pending'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          category_id?: string | null
          bank_id?: string | null
          amount: number
          description: string
          status?: 'planned' | 'paid' | 'pending'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          category_id?: string | null
          bank_id?: string | null
          amount?: number
          description?: string
          status?: 'planned' | 'paid' | 'pending'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'expenses_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'expense_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'expenses_bank_id_fkey'
            columns: ['bank_id']
            isOneToOne: false
            referencedRelation: 'banks'
            referencedColumns: ['id']
          },
        ]
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          month: string
          category_id: string | null
          bank_id: string | null
          estimated_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          category_id?: string | null
          bank_id?: string | null
          estimated_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          category_id?: string | null
          bank_id?: string | null
          estimated_amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'budgets_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'expense_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'budgets_bank_id_fkey'
            columns: ['bank_id']
            isOneToOne: false
            referencedRelation: 'banks'
            referencedColumns: ['id']
          },
        ]
      }
      saving_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number | null
          target_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount?: number | null
          target_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number | null
          target_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      saving_transactions: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          date: string
          type: 'in' | 'out'
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          date: string
          type: 'in' | 'out'
          amount: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          date?: string
          type?: 'in' | 'out'
          amount?: number
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saving_transactions_goal_id_fkey'
            columns: ['goal_id']
            isOneToOne: false
            referencedRelation: 'saving_goals'
            referencedColumns: ['id']
          },
        ]
      }
      installments: {
        Row: {
          id: string
          user_id: string
          name: string
          total_amount: number
          monthly_amount: number
          tenor: number | null
          start_date: string
          bank_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          total_amount: number
          monthly_amount: number
          tenor?: number | null
          start_date: string
          bank_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          total_amount?: number
          monthly_amount?: number
          tenor?: number | null
          start_date?: string
          bank_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'installments_bank_id_fkey'
            columns: ['bank_id']
            isOneToOne: false
            referencedRelation: 'banks'
            referencedColumns: ['id']
          },
        ]
      }
      installment_schedules: {
        Row: {
          id: string
          user_id: string
          installment_id: string
          due_date: string
          expected_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          installment_id: string
          due_date: string
          expected_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          installment_id?: string
          due_date?: string
          expected_amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'installment_schedules_installment_id_fkey'
            columns: ['installment_id']
            isOneToOne: false
            referencedRelation: 'installments'
            referencedColumns: ['id']
          },
        ]
      }
      installment_payments: {
        Row: {
          id: string
          user_id: string
          installment_id: string
          schedule_id: string | null
          paid_date: string
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          installment_id: string
          schedule_id?: string | null
          paid_date: string
          amount: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          installment_id?: string
          schedule_id?: string | null
          paid_date?: string
          amount?: number
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'installment_payments_installment_id_fkey'
            columns: ['installment_id']
            isOneToOne: false
            referencedRelation: 'installments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'installment_payments_schedule_id_fkey'
            columns: ['schedule_id']
            isOneToOne: false
            referencedRelation: 'installment_schedules'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
