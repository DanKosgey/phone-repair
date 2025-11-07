import { getSupabaseServerClient } from '@/server/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 })
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ message: 'No user authenticated' }, { status: 401 })
    }

    console.log('Test Role Fetch API: User authenticated', { userId: user.id, email: user.email });

    // Exactly mimic what fetchUserRole does
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    console.log('Test Role Fetch API: Role query result', { data, error });

    if (error) {
      console.error('Test Role Fetch API: Error fetching user role:', error.message);
      return NextResponse.json({ 
        error: 'Error fetching user role',
        details: error.message
      }, { status: 500 });
    }

    // data might be null if profile doesn't exist
    const userRole = data?.role || null;
    console.log('Test Role Fetch API: User role', userRole);

    return NextResponse.json({ 
      userId: user.id,
      role: userRole,
      rawData: data,
      message: 'Role fetch completed'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Test Role Fetch API: Exception', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}