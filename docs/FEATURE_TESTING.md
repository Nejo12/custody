# Feature Testing Guide

This guide helps you test the new features end-to-end: newsletter signup, court reminders, and analytics.

## Prerequisites

- Environment variables configured (see previous guides)
- Database migrations run
- Cron job set up (optional for testing)

## 1. Test Newsletter Signup

### Step 1: Test on Homepage

1. Visit `http://localhost:3000` (or production URL)
2. Scroll to the newsletter signup section
3. Enter a test email: `test@example.com`
4. Click **Subscribe**
5. Verify success message appears

### Step 2: Test on Result Page

1. Complete the interview flow
2. Navigate to result page
3. Scroll to newsletter signup (inline variant)
4. Enter email and subscribe
5. Verify success message

### Step 3: Verify in Database

```sql
SELECT * FROM newsletter_subscribers
WHERE email = 'test@example.com'
ORDER BY subscribed_at DESC;
```

You should see:

- Email address
- `subscribed_at` timestamp
- `source` (referer URL)

### Step 4: Test Validation

1. Try submitting without email → Should show error
2. Try invalid email format → Should show error
3. Try duplicate email → Should show success (idempotent)

### Step 5: Test Rate Limiting

1. Try subscribing 6 times quickly
2. 6th attempt should be rate limited (429 error)
3. Wait 1 hour or change IP to test again

## 2. Test Court Reminders

### Step 1: Schedule a Reminder (ICS Download)

1. Complete interview and go to result page
2. Click **"Add filing reminder"**
3. Verify ICS file downloads
4. Open in calendar app to verify event

### Step 2: Schedule Email Reminder

1. On result page, click **"Schedule email reminder"**
2. Enter email address
3. Set reminder date (at least 1 hour in future for testing)
4. Click **"Schedule Reminder"**
5. Verify success message appears

### Step 3: Verify in Database

```sql
SELECT
  id,
  email,
  reminder_date,
  summary,
  status,
  created_at
FROM court_reminders
WHERE email = 'your-test-email@example.com'
ORDER BY created_at DESC;
```

You should see:

- Status: `pending`
- Reminder date set correctly
- Summary and description

### Step 4: Test Reminder Sending (Manual)

```bash
# Set your cron secret
export REMINDERS_CRON_SECRET="your-secret-here"

# Call the send endpoint
curl -X POST http://localhost:3000/api/reminders/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REMINDERS_CRON_SECRET"
```

### Step 5: Verify Email Sent

1. Check your email inbox
2. You should receive reminder email
3. Verify email content is correct
4. Check database status updated to `sent`:

```sql
SELECT * FROM court_reminders
WHERE email = 'your-test-email@example.com'
  AND status = 'sent';
```

### Step 6: Test Error Handling

1. Schedule reminder with invalid email → Should show error
2. Schedule reminder with past date → Should show error
3. Schedule reminder without summary → Should show error

## 3. Test Analytics

### Step 1: Verify Analytics Script Loads

1. Open browser DevTools → **Network** tab
2. Visit your site
3. Filter by `gtag` or `google-analytics`
4. You should see requests to `www.google-analytics.com`

### Step 2: Test Page View Tracking

1. Navigate between pages:
   - Home → Interview → Result
2. Check Network tab for GA requests on each page
3. In Google Analytics → **Realtime** → **Overview**
4. You should see page views appearing

### Step 3: Test Event Tracking

1. Subscribe to newsletter
2. Check Network tab for event:
   ```
   event: newsletter_signup
   ```
3. Schedule a reminder
4. Check for event:
   ```
   event: court_reminder_email_scheduled
   ```

### Step 4: Test Conversion Tracking

1. Complete a test payment (use Stripe test card)
2. Check Network tab for conversion event:
   ```
   event: purchase
   value: [amount]
   currency: EUR
   transaction_id: [session_id]
   ```
3. In Google Analytics → **Conversions** → **Ecommerce**
4. Verify conversion appears (may take 24-48 hours)

### Step 5: Verify Analytics in Production

1. Deploy to production
2. Visit production site
3. Perform actions (signup, reminder, payment)
4. Check Google Analytics Realtime reports
5. Verify events are tracked correctly

## 4. End-to-End Test Scenario

### Complete User Journey

1. **Homepage**
   - ✅ Newsletter signup works
   - ✅ Analytics tracks page view

2. **Interview**
   - ✅ Complete interview flow
   - ✅ Analytics tracks navigation

3. **Result Page**
   - ✅ Newsletter signup (inline) works
   - ✅ Court reminder (ICS) downloads
   - ✅ Email reminder scheduling works
   - ✅ Analytics tracks events

4. **Payment** (if applicable)
   - ✅ Payment flow completes
   - ✅ Conversion tracked in analytics
   - ✅ PDF generated and emailed

5. **Reminder Delivery**
   - ✅ Cron job runs (or manual trigger)
   - ✅ Email sent at scheduled time
   - ✅ Database status updated

## 5. Database Verification Queries

### Check Newsletter Subscribers

```sql
-- Total subscribers
SELECT COUNT(*) FROM newsletter_subscribers;

-- Recent subscribers
SELECT email, subscribed_at, source
FROM newsletter_subscribers
ORDER BY subscribed_at DESC
LIMIT 10;

-- Subscribers by source
SELECT source, COUNT(*) as count
FROM newsletter_subscribers
GROUP BY source;
```

### Check Court Reminders

```sql
-- All reminders
SELECT
  id,
  email,
  reminder_date,
  summary,
  status,
  sent_at,
  created_at
FROM court_reminders
ORDER BY reminder_date DESC;

-- Pending reminders
SELECT COUNT(*) as pending_count
FROM court_reminders
WHERE status = 'pending'
  AND reminder_date > NOW();

-- Reminders by status
SELECT status, COUNT(*) as count
FROM court_reminders
GROUP BY status;

-- Failed reminders (need attention)
SELECT *
FROM court_reminders
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## 6. Common Issues & Solutions

### Newsletter Signup Not Working

**Issue**: Form submits but no success message

- ✅ Check API endpoint is accessible
- ✅ Verify Supabase connection
- ✅ Check browser console for errors
- ✅ Verify rate limiting not triggered

### Reminders Not Sending

**Issue**: Reminders scheduled but emails not sent

- ✅ Check cron job is running
- ✅ Verify `REMINDERS_CRON_SECRET` matches
- ✅ Check Resend API key is set
- ✅ Verify reminder dates are in future
- ✅ Check reminder status in database

### Analytics Not Tracking

**Issue**: No GA requests in Network tab

- ✅ Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- ✅ Check environment variable is public (starts with `NEXT_PUBLIC_`)
- ✅ Restart dev server after adding env var
- ✅ Check browser ad blockers (may block GA)

### Database Errors

**Issue**: API returns 500 errors

- ✅ Verify Supabase credentials
- ✅ Check tables exist (run migrations)
- ✅ Verify service_role key (not anon key)
- ✅ Check Supabase project is active

## 7. Performance Testing

### Load Test Newsletter Signup

```bash
# Test with multiple requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/newsletter/subscribe \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\"}" &
done
wait
```

### Load Test Reminder Scheduling

```bash
# Schedule multiple reminders
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/reminders/schedule \
    -H "Content-Type: application/json" \
    -d "{
      \"email\":\"test@example.com\",
      \"reminderDate\":\"$(date -u -v+${i}H +%Y-%m-%dT%H:%M:%SZ)\",
      \"summary\":\"Test Reminder $i\"
    }" &
done
wait
```

## 8. Security Testing

### Test Rate Limiting

1. Make 6 newsletter signup requests quickly
2. 6th should return 429 (Too Many Requests)
3. Verify `Retry-After` header present

### Test Authentication

1. Try calling `/api/reminders/send` without auth
2. Should return 401 (Unauthorized)
3. Try with wrong secret
4. Should return 401

### Test Input Validation

1. Try SQL injection in email field
2. Try XSS in summary field
3. Try extremely long strings
4. All should be sanitized/rejected

---

## Success Criteria

✅ Newsletter signup works on homepage and result page  
✅ Subscribers stored in database  
✅ Court reminders can be scheduled (ICS and email)  
✅ Email reminders sent at scheduled time  
✅ Analytics tracks page views, events, and conversions  
✅ Rate limiting prevents abuse  
✅ Error handling works correctly  
✅ All features work in production

**Congratulations!** Your features are now fully tested and ready for production use! 🎉
