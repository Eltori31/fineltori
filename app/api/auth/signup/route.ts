import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    const { email, password, fullName } = validatedData

    const supabase = await createClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Create profile manually (in case trigger doesn't exist yet)
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: fullName,
        })

      // Ignore error if profile already exists (trigger might have created it)
      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('Profile creation error:', profileError)
      }
    }

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
      message: 'Inscription réussie',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
