import { createClient } from '@/lib/supabase/server'
import type { BillType, MonthlyBill } from '@/types/database.types'

export async function getBillTypes(): Promise<BillType[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bill_types')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getMonthlyBills(year: number, month: number): Promise<MonthlyBill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_bills')
    .select('*')
    .eq('year', year)
    .eq('month', month)
  if (error) throw error
  return data ?? []
}

export async function getMemberBillHistory(memberId: string): Promise<MonthlyBill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_bills')
    .select('*')
    .eq('member_id', memberId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getDashboardSummary(year: number, month: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_bills')
    .select('amount, paid')
    .eq('year', year)
    .eq('month', month)
  if (error) throw error
  const bills = data ?? []
  const total = bills.reduce((sum, b) => sum + b.amount, 0)
  const collected = bills.filter(b => b.paid).reduce((sum, b) => sum + b.amount, 0)
  const outstanding = total - collected
  const paidCount = bills.filter(b => b.paid).length
  return { total, collected, outstanding, paidCount, totalCount: bills.length }
}
