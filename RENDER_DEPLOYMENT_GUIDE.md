# Render Deployment Guide

This guide will help you deploy your Jay's Phone Repair application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. Your Supabase project URL and keys

## Deployment Steps

### 1. Push Your Code to a Git Repository

First, make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create a New Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your Git repository
4. Configure the service:

   **Settings:**
   - Name: `jays-phone-repair`
   - Environment: `Docker`
   - Dockerfile path: `Dockerfile.render`
   - Root directory: `.` (default)

### 3. Configure Environment Variables

In the "Environment Variables" section, add the following variables:

| Key | Value | Note |
|-----|-------|------|
| `NODE_ENV` | `production` | Environment mode |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | From your Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | From your Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | From your Supabase project settings |
| `NEXTAUTH_URL` | `https://YOUR_APP_NAME.onrender.com` | Replace with your actual Render URL |
| `NEXTAUTH_SECRET` | A random string | Generate a secure secret |
| `PORT` | `3000` | Must be 3000 for Render |

### 4. Advanced Settings

In the "Advanced" section:
- Health Check Path: `/api/health`
- Port: `3000`

### 5. Deploy

Click "Create Web Service" to start the deployment.

## Troubleshooting

### Common Issues

1. **Build Failures**: If you encounter TypeScript errors, ensure all dependencies are properly installed.

2. **Runtime Issues**: Check the logs in the Render dashboard for any errors.

3. **Environment Variables**: Make sure all required environment variables are set correctly.

### Health Check

The application includes a health check endpoint at `/api/health` which Render will use to monitor your application's status.

## Updating Your Application

To update your deployed application:

1. Push your changes to your Git repository
2. Render will automatically detect the changes and start a new deployment
3. Or manually trigger a deployment from the Render dashboard

## Scaling

Render's free tier includes:
- 512 MB RAM
- 10 GB disk space
- Sleeps after 15 minutes of inactivity

For production use, consider upgrading to a paid plan for better performance and no sleep behavior.

## Support

If you encounter issues:
1. Check the build logs in the Render dashboard
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is properly configured