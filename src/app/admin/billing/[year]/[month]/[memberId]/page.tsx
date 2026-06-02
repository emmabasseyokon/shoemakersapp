import { notFound } from 'next/navigation'
import { getBillTypes, getMonthlyBills } from '@/lib/queries/billing'
import { getMembers } from '@/lib/queries/members'
import { ensureMonthBills } from '@/app/admin/actions'
import { MemberBillingDetail } from '@/components/admin/MemberBillingDetail'

interface Props {
  params: Promise<{ year: string; month: string; memberId: string }>
}

export default async function MemberBillingPage({ params }: Props) {
  const { year: yearStr, month: monthStr, memberId } = await params
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < 2020) {
    notFound()
  }

  await ensureMonthBills(year, month)

  const [members, billTypes, allBills] = await Promise.all([
    getMembers(),
    getBillTypes(),
    getMonthlyBills(year, month),
  ])

  const member = members.find(m => m.id === memberId)
  if (!member) notFound()

  const memberBills = allBills.filter(b => b.member_id === memberId)

  return (
    <MemberBillingDetail
      memberName={member.full_name}
      billTypes={billTypes}
      bills={memberBills}
      backHref={`/admin/billing/${year}/${month}`}
    />
  )
}
