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
   # Apply migrations from the migrations/ directory to your PostgreSQL database
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

---

Built with ❤️ using Next.js and OpenAI
