import { getSupabaseServerClient } from '@/server/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 })
    }

    // Get the current user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ message: 'No user authenticated' }, { status: 401 })
    }

    console.log('Debug API: User authenticated', { userId: user.id, email: user.email });

    // Try to get the user's role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Debug API: Profile error', profileError);
      return NextResponse.json({ 
        message: 'User authenticated but role not found',
        userId: user.id,
        error: profileError.message 
      }, { status: 200 })
    }

    console.log('Debug API: Profile data', profile);

    return NextResponse.json({ 
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || null
      },
      profile: profile
    }, { status: 200 })
  } catch (error: any) {
    console.error('Debug API: Exception', error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}