'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  createMember,
  updateMember,
  deleteMember,
} from '@/app/admin/actions'
import type { Member } from '@/types/database.types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface Props {
  initialMembers: Member[]
}

export function MembersManager({ initialMembers }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    if (!openDropdown) return
    function handleClick() { setOpenDropdown(null) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openDropdown])

  function closeModals() {
    setCreateOpen(false)
    setEditMember(null)
    setDeletingMember(null)
    setError(null)
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter(m => {
      if (q && !m.full_name.toLowerCase().includes(q) && !m.membership_number.toLowerCase().includes(q)) return false
      return true
    })
  }, [members, search])

  async function handleDelete() {
    if (!deletingMember) return
    setLoading(true)
    const result = await deleteMember(deletingMember.id)
    if ('error' in result) { setError(result.error); setLoading(false); return }
    setMembers(prev => prev.filter(m => m.id !== deletingMember.id))
    setLoading(false)
    setDeletingMember(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage association members and their billing status.
          </p>
        </div>
        <Button onClick={() => { setError(null); setCreateOpen(true) }} className="w-full sm:w-auto">
          Add Member
        </Button>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or membership number…"
              className={inputCls}
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-800">
            Members ({visible.length}{visible.length !== members.length ? ` of ${members.length}` : ''})
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              {members.length === 0 ? 'No members yet. Add the first one.' : 'No members match your search.'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {visible.map(m => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-800">{m.full_name}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      #{m.membership_number} · {m.phone}
                      {m.address ? ` · ${m.address}` : ''}
                    </div>
                  </div>

                  {/* Desktop actions */}
                  <div className="hidden items-center gap-3 sm:flex">
                    <button
                      onClick={() => { setError(null); setEditMember(m) }}
                      className="text-xs text-gray-500 hover:text-amber-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingMember(m)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Mobile menu */}
                  <div className="relative sm:hidden">
                    <button
                      onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown === m.id ? null : m.id) }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Options"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {openDropdown === m.id && (
                      <div className="absolute right-0 top-9 z-10 min-w-[160px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                        <button onClick={() => { setOpenDropdown(null); setError(null); setEditMember(m) }} className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">Edit</button>
                        <button onClick={() => { setOpenDropdown(null); setDeletingMember(m) }} className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Create modal */}
      {createOpen && (
        <MemberFormModal
          title="Add Member"
          submitLabel="Add Member"
          onClose={closeModals}
          error={error}
          setError={setError}
          onSubmitted={newMember => {
            setMembers(prev => [...prev, newMember].sort((a, b) => a.full_name.localeCompare(b.full_name)))
            closeModals()
          }}
        />
      )}

      {/* Edit modal */}
      {editMember && (
        <MemberFormModal
          title="Edit Member"
          submitLabel="Save Changes"
          member={editMember}
          onClose={closeModals}
          error={error}
          setError={setError}
          onSubmitted={updated => {
            setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
            closeModals()
          }}
        />
      )}

      {/* Delete confirm */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <ModalHeader title="Delete Member" onClose={() => setDeletingMember(null)} />
            {error && <ErrorBanner msg={error} />}
            <p className="mb-1 text-sm text-gray-700">
              Are you sure you want to permanently delete <span className="font-semibold">{deletingMember.full_name}</span>?
            </p>
            <p className="mb-6 text-xs text-red-600">All billing history for this member will also be deleted. Consider deactivating instead.</p>
            <div className="flex gap-3">
              <Button onClick={handleDelete} loading={loading} variant="danger" className="flex-1">Delete</Button>
              <button type="button" onClick={() => setDeletingMember(null)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Form modal ────────────────────────────────────────────────────────────────

interface FormModalProps {
  title: string
  submitLabel: string
  member?: Member
  onClose: () => void
  onSubmitted: (member: Member) => void
  error: string | null
  setError: (msg: string | null) => void
}

function MemberFormModal({ title, submitLabel, member, onClose, onSubmitted, error, setError }: FormModalProps) {
  const isEdit = !!member
  const [fullName, setFullName] = useState(member?.full_name ?? '')
  const [phone, setPhone] = useState(member?.phone ?? '')
  const [address, setAddress] = useState(member?.address ?? '')
  const [membershipNumber, setMembershipNumber] = useState(member?.membership_number ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData()
    fd.set('full_name', fullName)
    fd.set('phone', phone)
    fd.set('address', address)
    fd.set('membership_number', membershipNumber)
    if (isEdit) fd.set('member_id', member!.id)

    if (isEdit) {
      const result = await updateMember(fd)
      setSubmitting(false)
      if ('error' in result) { setError(result.error); return }
      onSubmitted({ ...member!, full_name: fullName, phone, address: address || null, membership_number: membershipNumber })
    } else {
      const result = await createMember(fd)
      setSubmitting(false)
      if ('error' in result) { setError(result.error); return }
      onSubmitted({
        id: result.memberId,
        full_name: fullName,
        phone,
        address: address || null,
        membership_number: membershipNumber,
        created_at: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <ModalHeader title={title} onClose={onClose} />
        {error && <ErrorBanner msg={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name *">
            <input required value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="e.g. Emeka Okafor" />
          </Field>

          <Field label="Membership number *">
            <input required value={membershipNumber} onChange={e => setMembershipNumber(e.target.value)} className={inputCls} placeholder="e.g. SA-001" />
          </Field>

          <Field label="Phone number *">
            <input required value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="e.g. 08012345678" />
          </Field>

          <Field label="Address">
            <input value={address} onChange={e => setAddress(e.target.value)} className={inputCls} placeholder="Optional" />
          </Field>

          <ModalActions
            primary={<Button type="submit" loading={submitting} className="flex-1">{submitLabel}</Button>}
            onCancel={onClose}
          />
        </form>
      </div>
    </div>
  )
}

// ── Tiny shared sub-components ────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none'

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{msg}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

function ModalActions({ primary, onCancel }: { primary: React.ReactNode; onCancel: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      {primary}
      <button type="button" onClick={onCancel}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Cancel
      </button>
    </div>
  )
}
