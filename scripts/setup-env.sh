#!/bin/bash

# Environment Setup Helper Script
# Helps generate secrets and check environment variables

set -e

echo "🔧 Custody Clarity - Environment Setup Helper"
echo "=============================================="
echo ""

# Generate Cron Secret
echo "📝 Generating REMINDERS_CRON_SECRET..."
CRON_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated secret: {REMINDERS_CRON_SECRET}"    # This is a placeholder for the actual secret
echo ""
echo "Add this to your .env.local:"
echo "REMINDERS_CRON_SECRET={REMINDERS_CRON_SECRET}"
echo ""

# Check existing .env.local
if [ -f .env.local ]; then
  echo "📋 Current .env.local status:"
  echo "------------------------------"
  
  if grep -q "NEXT_PUBLIC_GA_MEASUREMENT_ID" .env.local; then
    echo "✅ NEXT_PUBLIC_GA_MEASUREMENT_ID is set"
  else
    echo "❌ NEXT_PUBLIC_GA_MEASUREMENT_ID is missing"
    echo "   Add: NEXT_PUBLIC_GA_MEASUREMENT_ID={NEXT_PUBLIC_GA_MEASUREMENT_ID}"
  fi
  
  if grep -q "REMINDERS_CRON_SECRET" .env.local; then
    echo "✅ REMINDERS_CRON_SECRET is set"
  else
    echo "❌ REMINDERS_CRON_SECRET is missing"
    echo "   Add: REMINDERS_CRON_SECRET={REMINDERS_CRON_SECRET}"
  fi
  
  if grep -q "RESEND_API_KEY" .env.local; then
    echo "✅ RESEND_API_KEY is set"
  else
    echo "❌ RESEND_API_KEY is missing"
    echo "   Get from: https://resend.com/api-keys"
  fi
  
  if grep -q "SUPABASE_URL" .env.local; then
    echo "✅ SUPABASE_URL is set"
  else
    echo "❌ SUPABASE_URL is missing"
    echo "   Get from: https://supabase.com/dashboard"
  fi
  
  if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY is set"
  else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY is missing"
    echo "   Get from: Supabase Dashboard → Settings → API"
  fi
else
  echo "⚠️  .env.local file not found"
  echo "Creating template..."
  cat > .env.local << EOF
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID={NEXT_PUBLIC_GA_MEASUREMENT_ID}

# Court Reminders Cron
REMINDERS_CRON_SECRET={REMINDERS_CRON_SECRET}

# Resend (Email)
RESEND_API_KEY={RESEND_API_KEY}

# Supabase (Database)
SUPABASE_URL={SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY={SUPABASE_SERVICE_ROLE_KEY}

# Stripe (Payment - if not already set)
STRIPE_SECRET_KEY={STRIPE_SECRET_KEY}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY={NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
STRIPE_WEBHOOK_SECRET={STRIPE_WEBHOOK_SECRET}

# App URL
NEXT_PUBLIC_APP_URL=https://custodyclarity.com/
EOF
  echo "✅ Created .env.local template"
  echo "   Please fill in the values above"
fi

echo ""
echo "📚 Next Steps:"
echo "1. Fill in missing environment variables"
echo "2. Run database migrations (see docs/DATABASE_MIGRATIONS.md)"
echo "3. Set up cron job (see docs/CRON_JOB_SETUP.md)"
echo "4. Test features (see docs/FEATURE_TESTING.md)"
echo ""

