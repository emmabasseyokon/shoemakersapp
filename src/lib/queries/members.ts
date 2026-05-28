import { createClient } from '@/lib/supabase/server'
import type { Member } from '@/types/database.types'

export async function getMembers(activeOnly = false): Promise<Member[]> {
  const supabase = await createClient()
  let query = supabase.from('members').select('*').order('full_name')
  if (activeOnly) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getMember(id: string): Promise<Member | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}
