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

    // Test the Supabase connection by fetching the current time
    const { data, error } = await supabase.rpc('now');

    if (error) {
      console.error('Health check error:', error);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: error.message
      });
    }

    return res.status(200).json({ 
      status: 'OK',
      timestamp: data,
      message: 'Health check successful'
    });
  } catch (error: any) {
    console.error('Health check exception:', error);
    return res.status(500).json({ 
      error: 'Health check failed',
      details: error.message 
    });
  }
}