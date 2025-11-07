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

    console.log('Test Role Timing API: User authenticated', { userId: user.id, email: user.email });

    // Test multiple times with delays to check for timing issues
    const results = [];
    
    for (let i = 0; i < 5; i++) {
      // Wait before each attempt
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      results.push({
        attempt: i + 1,
        data,
        error: error?.message || null,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Test Role Timing API: Attempt ${i + 1}`, { data, error });
    }

    return NextResponse.json({ 
      userId: user.id,
      results,
      message: 'Timing test completed'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Test Role Timing API: Exception', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}