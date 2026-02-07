import { createClient } from '@/lib/supabase/server'
import { syncConnection } from '@/lib/powens/sync'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { connectionId } = await request.json()

    if (!connectionId) {
      return NextResponse.json(
        { error: 'ID de connexion requis' },
        { status: 400 }
      )
    }

    // Verify connection belongs to user
    const { data: connection } = await supabase
      .from('bank_connections')
      .select('powens_connection_id')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Connexion non trouvée' },
        { status: 404 }
      )
    }

    // Trigger synchronization
    const result = await syncConnection(connection.powens_connection_id)

    return NextResponse.json({
      success: true,
      accountsSynced: result.accountsSynced,
      transactionsSynced: result.transactionsSynced,
      message: 'Synchronisation réussie',
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la synchronisation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
