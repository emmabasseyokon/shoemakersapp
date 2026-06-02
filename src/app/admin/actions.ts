'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ActionClient = Awaited<ReturnType<typeof createClient>>
type AdminAuth = { ok: true; supabase: ActionClient; userId: string } | { ok: false; error: string }

async function verifyAdmin(): Promise<AdminAuth> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()
  if (profile?.role !== 'admin') return { ok: false, error: 'Not authorized' }
  return { ok: true, supabase, userId: user.id }
}

// ── Member actions ─────────────────────────────────────────────────────────────

export async function createMember(
  formData: FormData,
): Promise<{ error: string } | { success: true; memberId: string }> {
  const auth = await verifyAdmin()
  if (!auth.ok) return { error: auth.error }

  const full_name = ((formData.get('full_name') as string) ?? '').trim()
  const phone = ((formData.get('phone') as string) ?? '').trim()
  const address = ((formData.get('address') as string) ?? '').trim()
  const membership_number = ((formData.get('membership_number') as string) ?? '').trim()

  if (!full_name) return { error: 'Full name is required.' }
  if (!phone) return { error: 'Phone number is required.' }
  if (!membership_number) return { error: 'Membership number is required.' }

  const { data: inserted, error } = await auth.supabase
    .from('members')
    .insert({
      full_name,
      phone,
      address: address.length > 0 ? address : null,
      membership_number,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Membership number already exists.' }
    return { error: error.message }
  }

  revalidatePath('/admin/members')
  return { success: true, memberId: inserted.id }
}

export async function updateMember(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const auth = await verifyAdmin()
  if (!auth.ok) return { error: auth.error }

  const member_id = ((formData.get('member_id') as string) ?? '').trim()
  if (!UUID_RE.test(member_id)) return { error: 'Invalid member ID.' }

  const full_name = ((formData.get('full_name') as string) ?? '').trim()
  const phone = ((formData.get('phone') as string) ?? '').trim()
  const address = ((formData.get('address') as string) ?? '').trim()
  const membership_number = ((formData.get('membership_number') as string) ?? '').trim()

  if (!full_name) return { error: 'Full name is required.' }
  if (!phone) return { error: 'Phone number is required.' }
  if (!membership_number) return { error: 'Membership number is required.' }

  const { error } = await auth.supabase
    .from('members')
    .update({
      full_name,
      phone,
      address: address.length > 0 ? address : null,
      membership_number,
    })
    .eq('id', member_id)

  if (error) {
    if (error.code === '23505') return { error: 'Membership number already exists.' }
    return { error: error.message }
  }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function deleteMember(
  memberId: string,
): Promise<{ error: string } | { success: true }> {
  const auth = await verifyAdmin()
  if (!auth.ok) return { error: auth.error }
  if (!UUID_RE.test(memberId)) return { error: 'Invalid member ID.' }

  const { error } = await auth.supabase
    .from('members')
    .delete()
    .eq('id', memberId)

  if (error) return { error: error.message }
  revalidatePath('/admin/members')
  return { success: true }
}

// ── Billing actions ────────────────────────────────────────────────────────────

export async function ensureMonthBills(
  year: number,
  month: number,
): Promise<{ error: string } | { success: true }> {
  const auth = await verifyAdmin()
  if (!auth.ok) return { error: auth.error }

  // Fetch all members and all bill types
  const [membersRes, billTypesRes] = await Promise.all([
    auth.supabase.from('members').select('id'),
    auth.supabase.from('bill_types').select('id, default_amount'),
  ])

  if (membersRes.error) return { error: membersRes.error.message }
  if (billTypesRes.error) return { error: billTypesRes.error.message }

  const members = membersRes.data ?? []
  const billTypes = billTypesRes.data ?? []

  if (members.length === 0 || billTypes.length === 0) return { success: true }

  // Build the rows to upsert (on conflict do nothing)
  const rows = members.flatMap(m =>
    billTypes.map(bt => ({
      member_id: m.id,
      bill_type_id: bt.id,
      year,
      month,
      amount: bt.default_amount ?? 0,
      paid: false,
    }))
  )

  const { error } = await auth.supabase
    .from('monthly_bills')
    .upsert(rows, { onConflict: 'member_id,bill_type_id,year,month', ignoreDuplicates: true })

  if (error) return { error: error.message }
  return { success: true }
}

export async function toggleBillPaid(
  billId: string,
  paid: boolean,
): Promise<{ error: string } | { success: true }> {
  const auth = await verifyAdmin()
  if (!auth.ok) return { error: auth.error }
  if (!UUID_RE.test(billId)) return { error: 'Invalid bill ID.' }

  const { error } = await auth.supabase
    .from('monthly_bills')
    .update({
      paid,
      paid_date: paid ? new Date().toISOString().slice(0, 10) : null,
      recorded_by: auth.userId,
    })
    .eq('id', billId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateBillAmount(
  billId: string,
  amount: number,
): Promise<{ error: string } | { success: true }> {
  const auth = await verifyAdmin()
  if (!auth.ok) return { error: auth.error }
  if (!UUID_RE.test(billId)) return { error: 'Invalid bill ID.' }
  if (amount < 0 || !isFinite(amount)) return { error: 'Invalid amount.' }

  const { error } = await auth.supabase
    .from('monthly_bills')
    .update({ amount })
    .eq('id', billId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function saveMemberBills(
  updates: { billId: string; amount: number; paid: boolean }[],
): Promise<{ error: string } | { success: true }> {
  const auth = await verifyAdmin()
  if (!auth.ok) return { error: auth.error }

  for (const u of updates) {
    if (!UUID_RE.test(u.billId)) return { error: 'Invalid bill ID.' }
    if (u.amount < 0 || !isFinite(u.amount)) return { error: 'Invalid amount.' }
  }

  const today = new Date().toISOString().slice(0, 10)

  const results = await Promise.all(
    updates.map(u =>
      auth.supabase
        .from('monthly_bills')
        .update({
          amount: u.amount,
          paid: u.paid,
          paid_date: u.paid ? today : null,
          recorded_by: auth.userId,
        })
        .eq('id', u.billId)
    )
  )

  const failed = results.find(r => r.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath('/admin/billing', 'layout')
  return { success: true }
}
