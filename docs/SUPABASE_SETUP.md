# Supabase Setup Guide

This project uses Supabase to store queue records instead of a local JSON file.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in your Supabase dashboard

## Setup Steps

### 1. Create the Database Table

Run the SQL migration file to create the `queue_records` table:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_queue_table.sql`
4. Click **Run** to execute the migration

Alternatively, you can use the Supabase CLI:

```bash
supabase db push
```

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **service_role key** (this is your `SUPABASE_SERVICE_ROLE_KEY`) - **Important**: Use the service_role key for server-side operations, not the anon key

### 3. Set Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual Supabase credentials:
   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

**Important Notes:**

- Use `.env.local` for local development (this file is gitignored)
- The `.env.example` file is a template and is committed to git
- For server-side API routes, the `service_role` key is recommended for full database access
- The `anon` key has Row Level Security (RLS) restrictions and is better for client-side usage
- Never commit `.env.local` or any file with actual secrets

### 4. Verify the Setup

1. Start your development server: `npm run dev`
2. Test the queue API endpoints:
   - `GET /api/queue` - Should return an empty aggregates array
   - `POST /api/queue` - Should successfully create a record

## Database Schema

The `queue_records` table has the following structure:

- `id` (BIGSERIAL) - Primary key, auto-incrementing
- `service_id` (TEXT) - The service identifier
- `wait_minutes` (INTEGER) - Wait time in minutes
- `suggested_window` (TEXT, nullable) - Optional suggested time window
- `submitted_at` (BIGINT) - Timestamp when the record was submitted
- `created_at` (TIMESTAMP) - Database timestamp (auto-generated)

## Security Notes

- The service_role key has full database access. Keep it secure and never expose it in client-side code.
- Consider setting up Row Level Security (RLS) policies if you need to restrict access based on user authentication.

## Troubleshooting

- **Error: Missing Supabase environment variables**: Make sure your `.env.local` file is set up correctly and the server has been restarted.
- **Error: relation "queue_records" does not exist**: Make sure you've run the SQL migration to create the table.
- **Connection errors**: Verify your Supabase URL and API keys are correct.
