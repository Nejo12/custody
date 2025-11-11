# DNS Configuration Fix for SSL Certificate Provisioning

## Problem

Netlify cannot provision SSL certificates because the DNS records are using non-standard record types (`NETLIFY` and `NETLIFYv6`) instead of standard DNS record types.

## Solution

Replace the current DNS records with standard A, AAAA, and CNAME records.

## Required DNS Records

### Get the Correct IP Addresses from Netlify

**Important:** The exact IP addresses may vary. Get them from:

1. Netlify Dashboard → Domain management → DNS setup navigator
2. Or use the Netlify CLI: `netlify dns:list`

### For custodyclarity.com (Root Domain)

**A Record (IPv4):**

- **Name:** `@` or `custodyclarity.com`
- **Type:** `A`
- **Value:** Get from Netlify DNS setup navigator (typically starts with `75.2.x.x`)
- **TTL:** `3600` (or auto)

**AAAA Record (IPv6) - Optional but recommended:**

- **Name:** `@` or `custodyclarity.com`
- **Type:** `AAAA`
- **Value:** Get from Netlify DNS setup navigator
- **TTL:** `3600` (or auto)

### For www.custodyclarity.com (WWW Subdomain)

**CNAME Record:**

- **Name:** `www`
- **Type:** `CNAME`
- **Value:** `custodyclarity.netlify.app`
- **TTL:** `3600` (or auto)

## Steps to Fix

1. **In Netlify Dashboard:**
   - Go to Domain management → SSL/TLS certificate section
   - Click "Go to DNS setup navigator" (this will show you the exact records needed)

2. **Log into your DNS provider** (wherever you manage DNS for custodyclarity.com)

3. **Remove the existing NETLIFY and NETLIFYv6 records**

4. **Add the standard DNS records** as shown in Netlify's DNS setup navigator:
   - A record for the root domain
   - AAAA record for IPv6 (optional but recommended)
   - CNAME record for www subdomain

5. **Wait for DNS propagation** (can take up to 24-48 hours, but usually 1-4 hours)

6. **Verify DNS propagation:**
   - Use https://dnschecker.org to check if records have propagated globally
   - Or use: `dig custodyclarity.com A` and `dig www.custodyclarity.com CNAME`

7. **In Netlify Dashboard:**
   - Go back to Domain management
   - Click "Retry DNS verification"
   - Netlify should now be able to provision the SSL certificate automatically

## Alternative: Use Netlify DNS

If your domain registrar supports it, you can also:

1. Transfer DNS management to Netlify
2. Netlify will automatically configure the correct records
3. SSL certificates will provision automatically

## Verification

After updating DNS records, verify they're correct using:

- `dig custodyclarity.com A`
- `dig custodyclarity.com AAAA`
- `dig www.custodyclarity.com CNAME`

Or use online tools like:

- https://dnschecker.org
- https://www.whatsmydns.net

## Note

The current `_redirects` file in the codebase is correct and will continue to work once DNS is properly configured.
