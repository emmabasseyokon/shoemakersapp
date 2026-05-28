import { redirect } from 'next/navigation'

export default function BillingIndexPage() {
  const now = new Date()
  redirect(`/admin/billing/${now.getFullYear()}/${now.getMonth() + 1}`)
}
