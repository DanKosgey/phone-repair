-- Migration 027: Set role claim in JWT token
-- Description: Create a function to set the user's role in the JWT token so RLS policies can check it

-- Create a function to set the role claim in the JWT token
CREATE OR REPLACE FUNCTION public.set_role_claim_in_jwt()
RETURNS JSONB AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the user's role from the profiles table
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- If no role is found, default to 'user'
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;
  
  -- Return the role as a JSON object to be added to the JWT claims
  RETURN jsonb_build_object('role', user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configure the auth hook to use our function
-- This needs to be done in the Supabase dashboard or config, not in SQL
-- The hook should be configured as:
-- [auth.hook.custom_access_token]
-- enabled = true
-- uri = "pg-functions://postgres/public/set_role_claim_in_jwt"