'use client'

import Link from 'next/link'
import type { Member, BillType, MonthlyBill } from '@/types/database.types'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

interface Props {
  year: number
  month: number
  members: Member[]
  billTypes: BillType[]
  initialBills: MonthlyBill[]
}

type BillMap = Record<string, MonthlyBill> // key: `${memberId}:${billTypeId}`

function buildMap(bills: MonthlyBill[]): BillMap {
  const map: BillMap = {}
  for (const b of bills) {
    map[`${b.member_id}:${b.bill_type_id}`] = b
  }
  return map
}

export function BillingSheet({ year, month, members, billTypes, initialBills }: Props) {
  const billMap = buildMap(initialBills)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Tap a member name to record payments.</p>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-6 text-center text-sm text-gray-400">No active members. Add members first.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800">Billing Grid</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Member</th>
                  {billTypes.map(bt => (
                    <th key={bt.id} className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">
                      {bt.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/billing/${year}/${month}/${member.id}`}
                        className="group block"
                      >
                        <div className="font-medium text-gray-800 group-hover:text-blue-600">{member.full_name}</div>
                        <div className="text-xs text-gray-500">#{member.membership_number}</div>
                      </Link>
                    </td>
                    {billTypes.map(bt => {
                      const key = `${member.id}:${bt.id}`
                      const bill = billMap[key]

                      if (!bill) {
                        return (
                          <td key={bt.id} className="px-4 py-3 text-center">
                            <span className="text-xs text-gray-300">—</span>
                          </td>
                        )
                      }

                      return (
                        <td key={bt.id} className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs text-gray-700">
                              ₦{bill.amount.toLocaleString()}
                            </span>
                            {bill.paid_date && (
                              <span className="text-[10px] text-gray-400">{bill.paid_date}</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
