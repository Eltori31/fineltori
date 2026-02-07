import { createAdminClient } from '@/lib/supabase/admin'
import { powensClient } from './client'
import type { PowernsAccount, PowernsTransaction } from '@/types/powens'

/**
 * Map Powens account type to our account type
 */
function mapAccountType(powensType: string): string {
  const typeMap: Record<string, string> = {
    'checking': 'checking',
    'savings': 'savings',
    'card': 'credit_card',
    'loan': 'loan',
    'securities': 'investment',
    'life_insurance': 'investment',
    'market': 'investment',
  }
  return typeMap[powensType.toLowerCase()] || 'other'
}

/**
 * Synchronize a Powens connection with Supabase
 */
export async function syncConnection(connectionId: string) {
  const supabase = createAdminClient()

  // Get connection from database
  const { data: connection, error: connError } = await supabase
    .from('bank_connections')
    .select('*')
    .eq('powens_connection_id', connectionId)
    .single()

  if (connError || !connection) {
    throw new Error('Connection not found')
  }

  const syncLog = {
    user_id: connection.user_id,
    connection_id: connection.id,
    started_at: new Date().toISOString(),
    status: 'success' as const,
    accounts_synced: 0,
    transactions_synced: 0,
  }

  try {
    // Fetch accounts from Powens
    const powensAccounts: PowernsAccount[] = await powensClient.getAccounts(connectionId)

    // Update connection status
    await supabase
      .from('bank_connections')
      .update({
        bank_name: powensAccounts[0]?.bank?.name || connection.bank_name,
        bank_logo_url: powensAccounts[0]?.bank?.logo_url || connection.bank_logo_url,
        status: 'active',
      })
      .eq('id', connection.id)

    // Sync each account
    for (const powensAccount of powensAccounts) {
      try {
        // Upsert account
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .upsert(
            {
              user_id: connection.user_id,
              connection_id: connection.id,
              powens_account_id: powensAccount.id,
              name: powensAccount.name,
              type: mapAccountType(powensAccount.type),
              balance: powensAccount.balance,
              currency: powensAccount.currency,
              institution_name: powensAccount.bank?.name,
              is_manual: false,
              is_included_in_networth: true,
            },
            {
              onConflict: 'powens_account_id',
              ignoreDuplicates: false,
            }
          )
          .select()
          .single()

        if (accountError) {
          console.error('Error upserting account:', accountError)
          continue
        }

        if (account) {
          syncLog.accounts_synced++

          // Record balance history
          await supabase
            .from('balance_history')
            .upsert(
              {
                account_id: account.id,
                balance: powensAccount.balance,
                currency: powensAccount.currency,
                recorded_at: new Date().toISOString().split('T')[0],
              },
              {
                onConflict: 'account_id,recorded_at',
                ignoreDuplicates: true,
              }
            )

          // Fetch and sync transactions (last 90 days)
          const minDate = new Date()
          minDate.setDate(minDate.getDate() - 90)

          const powensTransactions: PowernsTransaction[] = await powensClient.getTransactions(
            connectionId,
            powensAccount.id,
            {
              min_date: minDate.toISOString().split('T')[0],
              limit: 500,
            }
          )

          // Bulk insert transactions
          if (powensTransactions.length > 0) {
            const transactionsToInsert = powensTransactions.map((transaction) => ({
              account_id: account.id,
              powens_transaction_id: transaction.id,
              date: transaction.date,
              description: transaction.description || transaction.original_description || 'Transaction',
              amount: transaction.amount,
              currency: transaction.currency,
              category: transaction.category?.name || null,
              is_pending: transaction.state === 'pending',
              is_manual: false,
            }))

            const { error: transactionsError } = await supabase
              .from('transactions')
              .upsert(transactionsToInsert, {
                onConflict: 'powens_transaction_id',
                ignoreDuplicates: true,
              })

            if (!transactionsError) {
              syncLog.transactions_synced += powensTransactions.length
            } else {
              console.error('Error inserting transactions:', transactionsError)
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing account ${powensAccount.id}:`, error)
      }
    }

    // Update connection last sync time
    await supabase
      .from('bank_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        status: 'active',
        error_message: null,
      })
      .eq('id', connection.id)

    // Log successful sync
    await supabase
      .from('sync_logs')
      .insert({
        ...syncLog,
        completed_at: new Date().toISOString(),
      })

    return {
      success: true,
      accountsSynced: syncLog.accounts_synced,
      transactionsSynced: syncLog.transactions_synced,
    }
  } catch (error) {
    console.error('Sync error:', error)

    // Update connection with error
    await supabase
      .from('bank_connections')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', connection.id)

    // Log failed sync
    await supabase
      .from('sync_logs')
      .insert({
        ...syncLog,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })

    throw error
  }
}
