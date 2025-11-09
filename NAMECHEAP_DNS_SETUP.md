# Namecheap DNS Configuration Guide for custodyclarity.com

This guide will help you configure your domain for both your website (hosted on Netlify) and email (Namecheap Private Email).

## Overview

You need to configure DNS records for:

1. **Website hosting** (Netlify) - A, AAAA, and CNAME records
2. **Email** (Namecheap Private Email) - MX and SPF (TXT) records

## Step 1: Get Netlify DNS Information

1. Go to your **Netlify Dashboard**
2. Navigate to **Site settings** → **Domain management**
3. Click **"DNS setup navigator"** or **"Configure DNS"**
4. Note down the following values (they will be shown to you):
   - **A Record IP** (IPv4 address, typically starts with `75.2.x.x`)
   - **AAAA Record IP** (IPv6 address)
   - **CNAME target** for www (usually `custodyclarity.netlify.app`)

## Step 2: Configure DNS in Namecheap

1. Log into your **Namecheap account**
2. Go to **Domain List** → Click **"Manage"** next to `custodyclarity.com`
3. Navigate to the **"Advanced DNS"** tab

## Step 3: Add DNS Records

### Remove Any Existing Records First

If you see any existing A, AAAA, or CNAME records for the root domain or www, you may need to remove or update them.

### Add Website DNS Records

#### A Record (IPv4) - For custodyclarity.com

- **Type:** `A Record`
- **Host:** `@`
- **Value:** `[IP from Netlify - get from step 1]` (e.g., 75.2.xxx.xxx)
- **TTL:** `Automatic` or `3600`
- **Click:** `Add Record`

#### AAAA Record (IPv6) - For custodyclarity.com (Optional but recommended)

- **Type:** `AAAA Record`
- **Host:** `@`
- **Value:** `[IPv6 address from Netlify - get from step 1]`
- **TTL:** `Automatic` or `3600`
- **Click:** `Add Record`

#### CNAME Record - For www.custodyclarity.com

- **Type:** `CNAME Record`
- **Host:** `www`
- **Value:** `custodyclarity.netlify.app` (or the value shown in Netlify)
- **TTL:** `Automatic` or `3600`
- **Click:** `Add Record`

### Add Email DNS Records

#### MX Record 1 - For Email Delivery

- **Type:** `MX Record`
- **Host:** `@`
- **Value:** `mx1.privateemail.com`
- **Priority:** `10`
- **TTL:** `Automatic` or `3600`
- **Click:** `Add Record`

#### MX Record 2 - For Email Delivery (Backup)

- **Type:** `MX Record`
- **Host:** `@`
- **Value:** `mx2.privateemail.com`
- **Priority:** `10`
- **TTL:** `Automatic` or `3600`
- **Click:** `Add Record`

#### TXT Record - SPF (Email Authentication)

- **Type:** `TXT Record`
- **Host:** `@`
- **Value:** `v=spf1 include:spf.privateemail.com ~all`
- **TTL:** `Automatic` or `3600`
- **Click:** `Add Record`

## Step 4: Complete DNS Record Summary

After configuration, you should have these records:

| Type  | Host | Value                                    | Priority | TTL  |
| ----- | ---- | ---------------------------------------- | -------- | ---- |
| A     | @    | [Netlify IPv4]                           | -        | Auto |
| AAAA  | @    | [Netlify IPv6]                           | -        | Auto |
| CNAME | www  | custodyclarity.netlify.app               | -        | Auto |
| MX    | @    | mx1.privateemail.com                     | 10       | Auto |
| MX    | @    | mx2.privateemail.com                     | 10       | Auto |
| TXT   | @    | v=spf1 include:spf.privateemail.com ~all | -        | Auto |

## Step 5: Wait for DNS Propagation

1. **DNS changes can take 1-4 hours** to propagate globally (sometimes up to 24-48 hours)
2. **Check propagation status:**
   - Visit https://dnschecker.org
   - Check for `custodyclarity.com` A record
   - Check for `www.custodyclarity.com` CNAME record
   - Check for `custodyclarity.com` MX records

## Step 6: Verify in Netlify

1. Go back to **Netlify Dashboard** → **Domain management**
2. Click **"Retry DNS verification"** or **"Verify DNS configuration"**
3. Netlify should automatically provision SSL certificate once DNS is verified

## Step 7: Verify Email Setup

1. Go back to **Namecheap** → **Private Email** dashboard
2. The yellow alert should disappear once DNS records are propagated
3. Test sending an email to `contact@custodyclarity.com` to verify it works

## Optional: Set Up DKIM (Recommended for Email Security)

1. In **Namecheap Private Email** dashboard, find the **"Email Security"** section
2. Click **"SHOW DKIM"** to reveal your DKIM keys
3. Copy the DKIM record value (it will look like a long string)
4. In **Namecheap Advanced DNS**, add a new **TXT Record**:
   - **Type:** `TXT Record`
   - **Host:** `default._domainkey` (or as shown in Namecheap)
   - **Value:** `[DKIM value from Namecheap]`
   - **TTL:** `Automatic` or `3600`
   - **Click:** `Add Record`

## Troubleshooting

### Website Not Loading

- Wait 1-4 hours for DNS propagation
- Verify A and CNAME records using https://dnschecker.org
- Check Netlify dashboard for any errors
- Ensure you're using the correct IP addresses from Netlify

### Email Not Working

- Wait 1-4 hours for DNS propagation
- Verify MX records using: `dig custodyclarity.com MX`
- Check MX records at https://dnschecker.org
- Ensure SPF (TXT) record is correctly set
- Check Namecheap Private Email dashboard for any errors

### SSL Certificate Issues

- Ensure DNS records are properly configured
- Wait for DNS propagation
- In Netlify, go to Domain management → SSL/TLS → Click "Retry DNS verification"
- Netlify will automatically provision SSL once DNS is verified

## Quick Verification Commands

You can verify DNS records using these commands in your terminal:

```bash
# Check A record (website)
dig custodyclarity.com A

# Check CNAME record (www)
dig www.custodyclarity.com CNAME

# Check MX records (email)
dig custodyclarity.com MX

# Check SPF record
dig custodyclarity.com TXT
```

## Important Notes

1. **Don't delete existing records** until you've added the new ones
2. **TTL (Time To Live)** can be set to "Automatic" - Namecheap will handle it
3. **Priority** for MX records should be `10` for both (they're equal priority)
4. **@ symbol** in Host field means the root domain (custodyclarity.com)
5. **DNS propagation** can take time - be patient!

## Next Steps After DNS is Configured

1. ✅ Website should be accessible at https://custodyclarity.com
2. ✅ Email should work at contact@custodyclarity.com
3. ✅ SSL certificate will be automatically provisioned by Netlify
4. ✅ www.custodyclarity.com will redirect to custodyclarity.com (configured in Netlify)

## Support

If you encounter issues:

- **Netlify Support:** https://www.netlify.com/support/
- **Namecheap Support:** https://www.namecheap.com/support/
- **DNS Checker:** https://dnschecker.org (to verify propagation)
