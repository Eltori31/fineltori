import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/">
          <h1 className="text-3xl font-bold">Fineltori</h1>
        </Link>
        <p className="mt-2 text-muted-foreground">
          Gérez votre patrimoine en toute simplicité
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
