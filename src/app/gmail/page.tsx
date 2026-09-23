import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { GmailForm } from './gmail-form'

export default async function GmailPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <div className="gmail-page-wrapper">
      <GmailForm />
    </div>
  )
}
