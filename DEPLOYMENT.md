# Deployment Guide - Railway

This guide will help you deploy the Calorie Tracker AI application to Railway, which offers free tiers for both the application and PostgreSQL database.

## Prerequisites

- A GitHub account (for connecting your repository)
- A Railway account (sign up at [railway.app](https://railway.app))

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure all environment variables are documented in `.env.local.example`

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect it's a Next.js project

## Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL database and automatically set the `DATABASE_URL` environment variable

## Step 4: Configure Environment Variables

In your Railway project settings, add the following environment variables:

### Required Variables

- `DATABASE_URL` - Automatically set by Railway when you add PostgreSQL (don't override this)
- `BETTER_AUTH_SECRET` - Generate a random secret (min 32 characters). You can use:
  ```bash
  openssl rand -base64 32
  ```
- `BETTER_AUTH_URL` - Your Railway app URL (e.g., `https://your-app-name.up.railway.app`)
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Same as `BETTER_AUTH_URL`
- `OPENAI_API_KEY` - Your OpenAI API key

### Optional Variables (for root user creation)

- `ROOT_USER_EMAIL` - Email for the root/admin user
- `ROOT_USER_PASSWORD` - Password for the root/admin user (min 8 characters)
- `ROOT_USER_NAME` - Name for the root/admin user

## Step 5: Deploy

1. Railway will automatically deploy when you push to your main branch
2. Or click "Deploy" in the Railway dashboard
3. Wait for the build to complete (this may take a few minutes)

## Step 6: Run Migrations

Migrations will run automatically on first startup via the startup script. The app will start even if migrations have already been run. If you need to run them manually:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Deployments" tab
4. Click on the latest deployment
5. Open the "Shell" tab
6. Run:
   ```bash
   npm run migrate
   ```

## Step 7: Create Root User

After migrations are complete, create your root user:

1. In Railway, go to your service → "Deployments" → latest deployment → "Shell"
2. Run:
   ```bash
   npm run create-root-user
   ```
   
   Or with specific credentials:
   ```bash
   npm run create-root-user admin@example.com securepassword123 "Admin User"
   ```

   Or set environment variables and run:
   ```bash
   npm run create-root-user
   ```

## Step 8: Access Your Application

1. Railway will provide a URL like `https://your-app-name.up.railway.app`
2. Visit the URL to access your application
3. Log in with your root user credentials

## Troubleshooting

### Migrations Not Running

If migrations fail, you can run them manually via Railway's shell:
```bash
npm run migrate
```

### Database Connection Issues

- Ensure `DATABASE_URL` is set correctly (Railway sets this automatically)
- Check that your PostgreSQL service is running in Railway

### Build Failures

- Check Railway build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Railway uses Node 18+ by default)

### Root User Creation Fails

- Ensure migrations have run successfully first
- Check that environment variables are set correctly
- Verify the database connection is working

## Railway Free Tier Limits

- **Compute**: $5 credit per month (enough for small apps)
- **Database**: 1GB storage, 256MB RAM
- **Bandwidth**: 100GB/month

For production use, consider upgrading to a paid plan.

## Alternative: Render Deployment

If you prefer Render, the process is similar:

1. Sign up at [render.com](https://render.com)
2. Create a new "Web Service" from your GitHub repo
3. Add a PostgreSQL database
4. Set environment variables
5. Use the same migration and root user scripts

Render's free tier includes:
- 750 hours/month of runtime
- PostgreSQL database (free tier available)

## Additional Notes

- Railway automatically handles HTTPS/SSL certificates
- Your app will sleep after inactivity on the free tier (takes a few seconds to wake up)
- Consider setting up a cron job or uptime monitor to keep the app awake if needed
