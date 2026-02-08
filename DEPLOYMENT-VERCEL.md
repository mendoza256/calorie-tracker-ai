# Deployment Guide - Vercel

This guide will help you deploy the Calorie Tracker AI application to Vercel, which offers excellent Next.js hosting with a generous free tier.

## Prerequisites

- A GitHub account (for connecting your repository)
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A PostgreSQL database (see database options below)

## Database Options (Free Tier Available)

Vercel doesn't provide PostgreSQL directly, but you can use one of these free options:

### Option 1: Vercel Postgres (Recommended)
- **Free Tier**: 256MB storage, 60 hours compute/month
- Integrated with Vercel dashboard
- Easy to set up and manage

### Option 2: Supabase
- **Free Tier**: 500MB database, unlimited API requests
- Great developer experience
- Includes additional features (auth, storage, etc.)

### Option 3: Neon
- **Free Tier**: 0.5GB storage, unlimited projects
- Serverless PostgreSQL
- Great for serverless architectures

### Option 4: Railway Database (Separate Service)
- **Free Tier**: 1GB storage, 256MB RAM
- Can use Railway database with Vercel hosting
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway setup

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure all environment variables are documented in `.env.local.example`

## Step 2: Set Up Your Database

Choose one of the database options above and set it up:

### If Using Vercel Postgres:

1. In your Vercel project (after creating it in Step 3), go to "Storage"
2. Click "Create Database" → "Postgres"
3. Choose a name and region
4. Vercel will automatically create `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, and `POSTGRES_URL_NON_POOLING` environment variables
5. Use `POSTGRES_URL` as your `DATABASE_URL`

### If Using Supabase:

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to "Settings" → "Database"
4. Copy the "Connection string" (URI format)
5. Use this as your `DATABASE_URL` in Vercel

### If Using Neon:

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use this as your `DATABASE_URL` in Vercel

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project
5. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

## Step 4: Configure Environment Variables

In your Vercel project settings, go to "Settings" → "Environment Variables" and add:

### Required Variables

- `DATABASE_URL` - Your PostgreSQL connection string
  - If using Vercel Postgres: Use the `POSTGRES_URL` variable (or set `DATABASE_URL` to match it)
  - If using external database: Paste your connection string
- `BETTER_AUTH_SECRET` - Generate a random secret (min 32 characters):
  ```bash
  openssl rand -base64 32
  ```
- `BETTER_AUTH_URL` - Your Vercel app URL (e.g., `https://your-app-name.vercel.app`)
  - **Note**: Set this after your first deployment to get the actual URL
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Same as `BETTER_AUTH_URL`
- `OPENAI_API_KEY` - Your OpenAI API key

### Optional Variables (for root user creation)

- `ROOT_USER_EMAIL` - Email for the root/admin user
- `ROOT_USER_PASSWORD` - Password for the root/admin user (min 8 characters)
- `ROOT_USER_NAME` - Name for the root/admin user

**Important**: 
- Set these for **Production**, **Preview**, and **Development** environments as needed
- After setting `BETTER_AUTH_URL`, you'll need to redeploy for it to take effect

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## Step 6: Run Migrations

Vercel doesn't support running scripts during deployment like Railway does. You'll need to run migrations manually using the Vercel CLI.

### Install Vercel CLI

```bash
npm i -g vercel
```

### Run Migrations Locally (Recommended)

1. Pull your environment variables:
   ```bash
   vercel env pull .env.local
   ```
   This downloads your Vercel environment variables to `.env.local`

2. Run migrations:
   ```bash
   npm run migrate
   ```

### Alternative: Run Migrations via Vercel CLI

You can also run migrations directly using Vercel's remote execution:

```bash
# Link your project (if not already linked)
vercel link

# Run migrations with Vercel environment variables
vercel env pull .env.local
npm run migrate
```

### Using Vercel Postgres

If you're using Vercel Postgres, you can also run migrations via the Vercel dashboard:
1. Go to your project → "Storage" → Your Postgres database
2. Use the built-in SQL editor to run migration files manually

## Step 7: Create Root User

After migrations are complete, create your root user:

### Option 1: Using Vercel CLI (Recommended)

1. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

2. Run the create-root-user script:
   ```bash
   npm run create-root-user
   ```
   
   Or with specific credentials:
   ```bash
   npm run create-root-user admin@example.com securepassword123 "Admin User"
   ```

### Option 2: Using Local Environment

1. Set up `.env.local` with your Vercel environment variables:
   ```bash
   vercel env pull .env.local
   ```

2. Run the script:
   ```bash
   npm run create-root-user
   ```

### Option 3: Create User via Signup Page

You can also create the first admin user by visiting your deployed app's signup page:
1. Go to `https://your-app-name.vercel.app/signup`
2. Create an account
3. This will be your first user (you can treat it as admin)

## Step 8: Access Your Application

1. Visit your Vercel deployment URL: `https://your-app-name.vercel.app`
2. Log in with your root user credentials
3. Your app is now live! 🎉

## Automatic Deployments

Vercel automatically deploys when you push to your connected branch:
- **Production**: Deploys from your main/master branch
- **Preview**: Deploys from pull requests and other branches

## Troubleshooting

### Migrations Not Running

Vercel doesn't run migrations automatically. You must run them manually:

```bash
vercel env pull .env.local
npm run migrate
```

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Check that your database allows connections from Vercel's IP ranges
- For Vercel Postgres: Ensure the database is created and running
- For external databases: Check firewall/security settings

### Build Failures

- Check Vercel build logs in the dashboard
- Ensure all dependencies are in `package.json` (not just devDependencies)
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check that environment variables are set correctly

### Root User Creation Fails

- Ensure migrations have run successfully first
- Verify `DATABASE_URL` is accessible from your local machine
- Check that environment variables are loaded correctly
- Try pulling environment variables again: `vercel env pull .env.local`

### Better Auth URL Issues

- Make sure `BETTER_AUTH_URL` matches your actual Vercel deployment URL
- After changing `BETTER_AUTH_URL`, redeploy your application
- Check that both `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` are set

## Vercel Free Tier Limits

- **Bandwidth**: 100GB/month
- **Serverless Function Execution**: 100GB-hours/month
- **Build Time**: 6000 build minutes/month
- **Edge Middleware Invocations**: Unlimited
- **Vercel Postgres**: 256MB storage, 60 hours compute/month

For production use with higher traffic, consider upgrading to a paid plan.

## Setting Up Custom Domain

1. Go to your Vercel project → "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to your custom domain
5. Redeploy your application

## Environment-Specific Configuration

Vercel supports different environment variables for:
- **Production**: Your main deployment
- **Preview**: Pull request and branch deployments
- **Development**: Local development (when using `vercel dev`)

Set environment variables for each environment as needed in "Settings" → "Environment Variables".

## Additional Notes

- Vercel automatically handles HTTPS/SSL certificates
- Serverless functions have a 10-second timeout on the free tier (upgrade for longer)
- Vercel provides excellent analytics and monitoring
- Use Vercel's Edge Network for global CDN benefits
- Consider using Vercel's Analytics and Speed Insights for performance monitoring

## Comparison: Vercel vs Railway

| Feature | Vercel | Railway |
|---------|--------|---------|
| Next.js Optimization | ✅ Excellent | ✅ Good |
| Free Tier | ✅ Generous | ✅ $5 credit/month |
| Database Included | ❌ Separate service | ✅ Included |
| Migration Scripts | Manual (CLI) | Automatic on startup |
| Ease of Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Best For | Next.js apps, static sites | Full-stack apps, databases |

Choose Vercel if you want the best Next.js hosting experience and don't mind setting up a separate database.
Choose Railway if you want everything (app + database) in one place with automatic migrations.
