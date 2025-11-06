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

    // Get the user from the request
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Try to fetch the user's role
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching role:', error);
      return res.status(500).json({ 
        error: 'Error fetching role', 
        details: error.message,
        code: error.code 
      });
    }

    return res.status(200).json({ 
      userId: user.id,
      role: data?.role || null,
      message: 'Role fetched successfully'
    });
  } catch (error: any) {
    console.error('Exception in test-role API:', error);
    return res.status(500).json({ 
      error: 'Exception occurred', 
      details: error.message 
    });
  }
}