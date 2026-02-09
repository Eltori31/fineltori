import { createClient } from '@/lib/supabase/server'
import { powensClient } from '@/lib/powens/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Check required environment variables
    if (!process.env.POWENS_CLIENT_ID || !process.env.POWENS_CLIENT_SECRET) {
      console.error('Missing Powens credentials')
      return NextResponse.json(
        { 
          error: 'Configuration manquante',
          details: 'Les identifiants Powens ne sont pas configurés'
        },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Missing NEXT_PUBLIC_APP_URL')
      return NextResponse.json(
        { 
          error: 'Configuration manquante',
          details: 'NEXT_PUBLIC_APP_URL n\'est pas défini'
        },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Create Powens user and get permanent token
    let powensUser
    try {
      powensUser = await powensClient.createUserAndToken()
    } catch (error) {
      console.error('Error creating Powens user:', error)
      return NextResponse.json(
        {
          error: 'Erreur lors de la création de l\'utilisateur Powens',
          details: error instanceof Error ? error.message : 'Erreur inconnue',
        },
        { status: 500 }
      )
    }

    if (!powensUser.auth_token || !powensUser.id_user) {
      return NextResponse.json(
        { error: 'Échec de la création de l\'utilisateur Powens' },
        { status: 500 }
      )
    }

    // Get webview URL
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/powens/callback`
    const webviewUrl = powensClient.getWebviewUrl(
      powensUser.auth_token,
      redirectUrl
    )

    console.log('🔗 Powens webview URL:', webviewUrl)
    console.log('🔙 Redirect URL:', redirectUrl)

    // Store connection in database with auth token
    // Note: In production, you should encrypt the auth token
    const { error: dbError } = await supabase.from('bank_connections').insert({
      user_id: user.id,
      powens_connection_id: powensUser.id_user.toString(),
      bank_name: 'En attente',
      status: 'pending',
      // Store auth token in error_message field temporarily (not ideal, but works)
      // TODO: Add proper powens_auth_token column to bank_connections table
      error_message: powensUser.auth_token,
    })

    if (dbError) {
      console.error('Error creating bank connection:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la connexion' },
        { status: 500 }
      )
    }

    // Store Powens auth token securely (you might want to encrypt this)
    // For now, we'll pass it in the response for the webview
    return NextResponse.json({
      url: webviewUrl,
      powensUserId: powensUser.id_user,
      authToken: powensUser.auth_token, // Note: In production, store this securely
    })
  } catch (error) {
    console.error('Powens connect error:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'initialisation de la connexion bancaire',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
