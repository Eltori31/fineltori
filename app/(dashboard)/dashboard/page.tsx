import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConnectBankButton } from '@/components/accounts/connect-bank-button'
import { formatCurrency } from '@/lib/utils/formatters'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_included_in_networth', true)

  // Calculate total net worth
  const totalNetWorth = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

  // Get transactions count for this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: transactionsCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('date', startOfMonth.toISOString().split('T')[0])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenue, {profile?.full_name || user.email} !
          </p>
        </div>
        <ConnectBankButton />
      </div>

      {params.success === 'bank_connected' && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          ✓ Banque connectée avec succès ! Synchronisation en cours...
        </div>
      )}

      {params.error && (
        <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
          Erreur : {params.error === 'connection_failed' ? 'La connexion à la banque a échoué' : 'Une erreur est survenue'}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Patrimoine Total</h3>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(totalNetWorth)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {accounts?.length || 0} compte(s) connecté(s)
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Comptes</h3>
          <p className="mt-2 text-3xl font-bold">{accounts?.length || 0}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {accounts && accounts.length > 0 ? 'Comptes synchronisés' : 'Connectez votre première banque'}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Transactions</h3>
          <p className="mt-2 text-3xl font-bold">{transactionsCount || 0}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ce mois-ci
          </p>
        </div>
      </div>

      {(!accounts || accounts.length === 0) && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Prochaines étapes</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="font-medium">Compte créé</p>
                <p className="text-sm text-muted-foreground">Votre compte a été créé avec succès</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="rounded-full bg-muted p-2 text-muted-foreground">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Connectez votre banque</p>
                <p className="text-sm text-muted-foreground">Cliquez sur &quot;Connecter une banque&quot; ci-dessus</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="rounded-full bg-muted p-2 text-muted-foreground">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Visualisez votre patrimoine</p>
                <p className="text-sm text-muted-foreground">Suivez l&apos;évolution de vos finances</p>
              </div>
            </li>
          </ul>
        </div>
      )}

      {accounts && accounts.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Vos comptes</h2>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.institution_name}</p>
                </div>
                <p className="text-lg font-semibold">{formatCurrency(Number(account.balance), account.currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
