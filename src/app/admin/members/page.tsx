import { getMembers } from '@/lib/queries/members'
import { MembersManager } from '@/components/admin/MembersManager'

export default async function MembersPage() {
  const members = await getMembers()
  return <MembersManager initialMembers={members} />
}
