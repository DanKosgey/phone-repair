import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '@/server/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseServerClient();
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Test accessing the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(1);

    if (error) {
      console.error('Database test error:', error);
      return res.status(500).json({ 
        error: 'Database query failed',
        details: error.message,
        code: error.code
      });
    }

    return res.status(200).json({ 
      status: 'OK',
      data: data,
      message: 'Database test successful'
    });
  } catch (error: any) {
    console.error('Database test exception:', error);
    return res.status(500).json({ 
      error: 'Database test failed',
      details: error.message 
    });
  }
}