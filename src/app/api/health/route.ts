import { getSupabaseServerClient } from '@/server/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test Supabase connection
    const supabase = getSupabaseServerClient()
    
    if (!supabase) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Supabase client not available' 
      }, { status: 500 })
    }

    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Health check database error:', error)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Health check successful',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Health check failed',
      error: error.message
    }, { status: 500 })
  }
}