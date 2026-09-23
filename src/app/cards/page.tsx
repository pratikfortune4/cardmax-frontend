import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MyCards } from '@/components/cards/my-cards'

export const metadata = {
  title: 'Secure Card Vault — CardMax',
  description: 'Manage your encrypted credit cards safely with hardware-grade AES-256-GCM encryption.',
}

export default async function CardsPage() {
  const cookieStore = await cookies()

  if (!cookieStore.has('payload-token')) {
    redirect('/login')
  }

  return (
    <div className="cards-page-wrapper">
      <MyCards />
    </div>
  )
}