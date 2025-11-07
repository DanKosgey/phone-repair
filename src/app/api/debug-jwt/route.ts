import { getSupabaseServerClient } from '@/server/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 })
    }

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ message: 'No active session' }, { status: 401 })
    }

    console.log('Debug JWT API: Session found', { 
      userId: session.user.id, 
      email: session.user.email,
      expiresAt: session.expires_at
    });

    // Check the user's role from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Debug JWT API: Profile error', profileError);
      return NextResponse.json({ 
        error: 'Profile error',
        details: profileError.message
      }, { status: 500 });
    }

    console.log('Debug JWT API: Profile data', profile);

    // Check the JWT token claims
    const jwtClaims = session.user.app_metadata;
    console.log('Debug JWT API: JWT claims', jwtClaims);

    return NextResponse.json({ 
      userId: session.user.id,
      email: session.user.email,
      role: profile?.role || null,
      profile: profile,
      jwtClaims: jwtClaims,
      message: 'JWT debug completed'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Debug JWT API: Exception', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}