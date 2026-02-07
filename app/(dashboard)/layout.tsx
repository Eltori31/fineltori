import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <Button type="submit" variant="ghost" size="sm">
        Déconnexion
      </Button>
    </form>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-bold">
            Fineltori
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:underline">
              Comptes
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:underline">
              Transactions
            </Link>
            <div className="ml-4 flex items-center gap-2 border-l pl-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <LogoutButton />
            </div>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
