import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBillTypes, getMonthlyBills } from '@/lib/queries/billing'
import { getMembers } from '@/lib/queries/members'
import { ensureMonthBills } from '@/app/admin/actions'
import { BillingSheet } from '@/components/admin/BillingSheet'

interface Props {
  params: Promise<{ year: string; month: string }>
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function BillingMonthPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = await params
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < 2020) {
    notFound()
  }

  // Ensure bill rows exist for all active members × bill types
  await ensureMonthBills(year, month)

  const [members, billTypes, bills] = await Promise.all([
    getMembers(true), // active only
    getBillTypes(),
    getMonthlyBills(year, month),
  ])

  // Month navigation
  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)
  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/admin/billing/${prevDate.getFullYear()}/${prevDate.getMonth() + 1}`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          ← {MONTH_NAMES[prevDate.getMonth()]} {prevDate.getFullYear()}
        </Link>

        <Link
          href={`/admin/billing/${nextDate.getFullYear()}/${nextDate.getMonth() + 1}`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          {MONTH_NAMES[nextDate.getMonth()]} {nextDate.getFullYear()} →
        </Link>
      </div>

      <BillingSheet
        year={year}
        month={month}
        members={members}
        billTypes={billTypes}
        initialBills={bills}
      />
    </div>
  )
}
