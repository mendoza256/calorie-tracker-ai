# Calorie Tracker AI 🍎

Track your calories and macros with AI-powered meal parsing. Simply describe what you ate, and let AI extract the nutritional information automatically.

## Features

- 🤖 **AI Meal Parsing** - Describe meals in natural language (e.g., "grilled chicken breast with rice")
- 📊 **Daily Tracking** - Monitor calories, protein, carbs, and fats throughout the day
- 📅 **Meal History** - View and navigate past meals by date
- 🍳 **Recipe Management** - Save favorite meals as recipes for quick logging
- 🔐 **User Authentication** - Secure login and signup with Better Auth

## Tech Stack

- **Next.js 16** - React framework
- **PostgreSQL** - Database
- **Better Auth** - Authentication
- **OpenAI** - AI meal parsing
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your `.env.local`:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `DATABASE_URL` - PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Random secret (min 32 chars)
   - `BETTER_AUTH_URL` - Your app URL (e.g., `http://localhost:3000`)
   - `NEXT_PUBLIC_BETTER_AUTH_URL` - Same as above

3. **Run database migrations**
   ```bash
   # Run Better Auth migrations
   npm run auth:migrate
   
   # Run all migrations (Better Auth + custom SQL migrations)
   npm run migrate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Sign up or log in
2. On the home page, describe your meal in the input field
3. AI will parse the meal and extract nutritional information
4. Review and add the meal to your daily log
5. Track your daily totals and view meal history

## Deployment

### Railway (Recommended - Free Tier Available)

Railway offers free tiers for both the application and PostgreSQL database. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Start:**
1. Push your code to GitHub
2. Sign up at [railway.app](https://railway.app)
3. Create a new project from your GitHub repo
4. Add a PostgreSQL database
5. Set environment variables (see `.env.local.example`)
6. Deploy - migrations run automatically
7. Create root user via Railway shell: `npm run create-root-user`

### Vercel (Best for Next.js)

Vercel offers excellent Next.js hosting with a generous free tier. You'll need a separate PostgreSQL database (Vercel Postgres, Supabase, Neon, or Railway). See [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md) for detailed deployment instructions.

**Quick Start:**
1. Push your code to GitHub
2. Sign up at [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set up a PostgreSQL database (Vercel Postgres, Supabase, or Neon)
5. Set environment variables in Vercel dashboard
6. Deploy - Vercel auto-detects Next.js
7. Run migrations locally: `vercel env pull .env.local && npm run migrate`
8. Create root user: `npm run create-root-user`

### Creating a Root User

After deployment, create an admin user:

```bash
npm run create-root-user <email> <password> [name]
```

Or set environment variables:
```bash
ROOT_USER_EMAIL=admin@example.com
ROOT_USER_PASSWORD=securepassword123
ROOT_USER_NAME="Admin User"
npm run create-root-user
```

---

Built with ❤️ using Next.js and OpenAI
