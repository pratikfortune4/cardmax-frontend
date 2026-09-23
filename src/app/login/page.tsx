import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const cookieStore = await cookies()
  if (cookieStore.has('payload-token')) {
    redirect('/')
  }

  return (
    <main className="cm-login-page">
      <LoginForm />
    </main>
  )
}