#!/bin/bash
# Startup script that runs migrations before starting the app

set -e

echo "🚀 Starting Calorie Tracker AI..."

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "📝 Running database migrations..."
  npm run migrate || {
    echo "⚠️  Migrations failed, but continuing startup..."
    echo "   You may need to run migrations manually: npm run migrate"
  }
else
  echo "⚠️  DATABASE_URL not set, skipping migrations"
fi

# Start the Next.js app
echo "🌐 Starting Next.js server..."
exec npm start
