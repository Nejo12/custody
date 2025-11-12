#!/usr/bin/env node

/**
 * Database Connection Test Script
 *
 * This script verifies that:
 * 1. Supabase connection is working
 * 2. All required tables exist
 * 3. Tables are accessible
 *
 * Run this after executing database migrations to verify setup.
 *
 * Usage:
 *   node scripts/test-db-connection.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

/**
 * Print colored message to console
 */
function log(message, color = "reset") {
  console.warn(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print section header
 */
function section(title) {
  console.warn("\n" + "=".repeat(60));
  log(title, "cyan");
  console.warn("=".repeat(60));
}

/**
 * Main test function
 */
async function testDatabaseConnection() {
  section("DATABASE CONNECTION TEST");

  // Check environment variables
  if (!supabaseUrl || !supabaseKey) {
    log("❌ ERROR: Missing Supabase environment variables", "red");
    log(
      "   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local",
      "yellow"
    );
    process.exit(1);
  }

  log(`✓ Environment variables loaded`, "green");
  log(`  URL: ${supabaseUrl}`, "blue");

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Tables to check
  const tables = ["queue_records", "newsletter_subscribers", "court_reminders", "referrals"];

  section("CHECKING TABLES");

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        log(`❌ ${table}: ${error.message}`, "red");
        allTablesExist = false;
      } else {
        log(`✓ ${table}: Accessible (${count ?? 0} rows)`, "green");
      }
    } catch (error) {
      log(`❌ ${table}: ${error.message}`, "red");
      allTablesExist = false;
    }
  }

  // Final summary
  section("SUMMARY");

  if (allTablesExist) {
    log("✅ SUCCESS: All tables are accessible!", "green");
    log("   Your database is properly configured.", "green");
    log("\n   Next steps:", "cyan");
    log("   1. Deploy to Netlify", "blue");
    log("   2. Monitor cron job execution in Netlify Functions logs", "blue");
    log("   3. Test features that use these tables", "blue");
    process.exit(0);
  } else {
    log("❌ FAILED: Some tables are not accessible", "red");
    log("\n   To fix this:", "yellow");
    log("   1. Open Supabase SQL Editor", "blue");
    log("   2. Run the migrations from: supabase/migrations/run-all-migrations.sql", "blue");
    log("   3. Verify with: supabase/migrations/verify-migrations.sql", "blue");
    log("   4. Run this script again", "blue");
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection().catch((error) => {
  section("FATAL ERROR");
  log(error.message, "red");
  log(error.stack, "red");
  process.exit(1);
});
