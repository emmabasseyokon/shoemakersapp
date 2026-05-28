'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveMemberBills } from '@/app/admin/actions'
import type { BillType, MonthlyBill } from '@/types/database.types'

interface Props {
  memberName: string
  billTypes: BillType[]
  bills: MonthlyBill[]
  backHref: string
}

export function MemberBillingDetail({ memberName, billTypes, bills, backHref }: Props) {
  const router = useRouter()

  const [state, setState] = useState<Record<string, { amount: string }>>(() => {
    const s: Record<string, { amount: string }> = {}
    for (const b of bills) {
      s[b.id] = { amount: String(b.amount) }
    }
    return s
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const billById = Object.fromEntries(bills.map(b => [b.id, b]))

  function billForType(billTypeId: string): MonthlyBill | undefined {
    return bills.find(b => b.bill_type_id === billTypeId)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const updates = Object.entries(state).map(([billId, { amount }]) => {
      const parsed = parseFloat(amount) || 0
      return { billId, amount: parsed, paid: parsed > 0 }
    })

    const result = await saveMemberBills(updates)
    setSaving(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    setSaved(true)
    setTimeout(() => router.push(backHref), 800)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => router.push(backHref)}
          className="text-gray-600 hover:text-gray-900 p-1 -ml-1 rounded-lg hover:bg-gray-100"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">{memberName}</h1>
      </div>

      {/* Bill inputs */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {billTypes.map(bt => {
          const bill = billForType(bt.id)
          if (!bill) return null
          const s = state[bill.id]
          if (!s) return null

          return (
            <div key={bt.id}>
              <div className="mb-2">
                <label className="text-sm font-semibold text-gray-800">{bt.name}</label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={s.amount}
                  onChange={e =>
                    setState(prev => ({
                      ...prev,
                      [bill.id]: { amount: e.target.value },
                    }))
                  }
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-7 pr-4 py-3 text-sm text-gray-800 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )
        })}

        {billTypes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No bill types configured.</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-8 pt-2 space-y-3">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {saved && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Saved successfully!</div>
        )}
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full rounded-xl bg-amber-700 py-3.5 text-sm font-semibold text-white hover:bg-amber-800 active:bg-amber-900 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  )
}
