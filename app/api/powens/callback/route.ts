import { createClient } from '@/lib/supabase/server'
import { syncConnection } from '@/lib/powens/sync'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const connectionId = searchParams.get('connection_id')
  const state = searchParams.get('state')

  if (!connectionId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_callback`
    )
  }

  const supabase = await createClient()

  if (state === 'error') {
    // Connection failed
    await supabase
      .from('bank_connections')
      .update({
        status: 'error',
        error_message: 'La connexion à la banque a échoué',
      })
      .eq('powens_connection_id', connectionId)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=connection_failed`
    )
  }

  try {
    // Get connection to retrieve auth token
    const { data: connection } = await supabase
      .from('bank_connections')
      .select('error_message')
      .eq('powens_connection_id', connectionId)
      .single()

    if (!connection || !connection.error_message) {
      throw new Error('Auth token not found for connection')
    }

    // Update connection status to active
    await supabase
      .from('bank_connections')
      .update({ status: 'active' })
      .eq('powens_connection_id', connectionId)

    // Trigger initial sync in the background
    syncConnection(connectionId, connection.error_message).catch((error) => {
      console.error('Background sync error:', error)
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=bank_connected`
    )
  } catch (error) {
    console.error('Callback error:', error)

    await supabase
      .from('bank_connections')
      .update({
        status: 'error',
        error_message: 'Erreur lors de la synchronisation initiale',
      })
      .eq('powens_connection_id', connectionId)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=sync_failed`
    )
  }
}
