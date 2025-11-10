# Render Deployment Guide

This guide explains how to deploy the Jay's Phone Repair application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. Supabase account for database and authentication
3. Environment variables configured in Render dashboard

## Deployment Steps

You can deploy this application to Render using either the Node.js runtime or Docker runtime:

### Option 1: Node.js Runtime (Recommended)

1. Fork this repository to your GitHub account
2. Log in to Render dashboard
3. Click "New Web Service"
4. Connect your GitHub account and select your forked repository
5. Configure the following settings:
   - Name: jays-phone-repair
   - Runtime: Node
   - Region: Choose your preferred region
   - Branch: main
   - Build Command: node render-build.js
   - Start Command: npm run start

### Option 2: Docker Runtime

1. Fork this repository to your GitHub account
2. Log in to Render dashboard
3. Click "New Web Service"
4. Connect your GitHub account and select your forked repository
5. Configure the following settings:
   - Name: jays-phone-repair
   - Runtime: Docker
   - Region: Choose your preferred region
   - Branch: main
   - Dockerfile path: Dockerfile.render (or Dockerfile)
   - Root directory: Leave empty (.)

## Environment Variables

Set the following environment variables in your Render service:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL | https://your-project.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anon key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| SUPABASE_SERVICE_ROLE_KEY | Your Supabase service role key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| NEXTAUTH_URL | Your Render app URL | https://your-app-name.onrender.com |
| NEXTAUTH_SECRET | Random string for encryption | generate a random secret |
| PORT | Port for the application | 3000 |

## Troubleshooting

### Common Issues

1. **Build failures**: If you encounter build failures, check the build logs in Render dashboard for specific error messages.

2. **Lockfile issues**: The build process automatically handles incompatible lockfiles by removing them and forcing a fresh install.

3. **Turbopack path errors**: The next.config.ts has been configured to avoid Turbopack path issues in production.

### Health Check

The application includes a health check endpoint at `/api/health` which can be used to verify the application is running correctly.

## Updating the Application

To update your deployed application:

1. Push changes to your GitHub repository
2. Render will automatically detect the changes and start a new deployment
3. Monitor the build logs in Render dashboard for any issues

## Scaling

The free tier of Render provides:
- 512 MB RAM
- 100 GB bandwidth per month
- Sleeps after 15 minutes of inactivity

For production usage, consider upgrading to a paid plan for better performance and reliability.