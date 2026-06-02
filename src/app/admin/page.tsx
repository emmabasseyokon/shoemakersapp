import Link from 'next/link'
import { getDashboardSummary } from '@/lib/queries/billing'
import { getMembers } from '@/lib/queries/members'
import { Card, CardContent } from '@/components/ui/Card'
import { CollectedCard } from '@/components/admin/CollectedCard'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default async function AdminDashboard() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [summary, members] = await Promise.all([
    getDashboardSummary(year, month),
    getMembers(),
  ])

  const totalMembers = members.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview for {MONTH_NAMES[month - 1]} {year}
        </p>
      </div>

      {/* Current month summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/members">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">All Members</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalMembers}</p>
          </div>
        </Link>
        <CollectedCard
          total={`₦${summary.collected.toLocaleString()}`}
          byCategory={summary.byCategory}
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 py-5">
            <h2 className="font-semibold text-gray-800">Current Month Billing</h2>
            <p className="text-sm text-gray-500">
              Record payments and track dues for {MONTH_NAMES[month - 1]} {year}.
            </p>
            <Link
              href={`/admin/billing/${year}/${month}`}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
            >
              Open Billing Sheet →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 py-5">
            <h2 className="font-semibold text-gray-800">Members</h2>
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Members →
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
