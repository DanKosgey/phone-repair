# Authentication Deployment Guide

This guide explains how to properly configure authentication for deployment to avoid session reset issues.

## Common Issues and Solutions

### 1. Environment Variables

Ensure these environment variables are set in your deployment environment:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Cookie Domain Configuration

Cookies set with localhost domain won't work on production domains. The system now automatically:
- Sets proper domain for cookies in production
- Uses secure flags for HTTPS connections
- Sets appropriate SameSite attributes

### 3. Session Persistence

The application uses localStorage for session persistence which:
- Works across browser restarts
- Is tied to the specific domain
- May be cleared by users or browser settings

## Vercel Deployment

For Vercel deployments:

1. Add environment variables in the Vercel dashboard:
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Ensure your Supabase project allows your Vercel domain:
   - In Supabase Dashboard → Project Settings → API
   - Add your Vercel domain to "Additional Redirect URLs"

## Troubleshooting

### Debug Authentication Issues

Visit `/debug-auth` to check authentication status and debug issues.

### Common Problems

1. **Session Lost After Deploy**: 
   - Check that environment variables are correctly set
   - Verify Supabase project URL hasn't changed
   - Ensure domain is added to Supabase redirect URLs

2. **Cookies Not Persisting**:
   - Check browser console for cookie errors
   - Verify domain and secure flag settings
   - Ensure SameSite settings are appropriate

3. **Authentication Loops**:
   - Check middleware configuration
   - Verify autoRefreshToken is disabled in middleware
   - Review redirect logic in authentication components

## Testing Deployment

Before deploying to production:

1. Test on a staging environment with the same domain setup
2. Verify authentication flow works after browser refresh
3. Test sign out and sign in flow
4. Check that sessions persist across different pages

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)