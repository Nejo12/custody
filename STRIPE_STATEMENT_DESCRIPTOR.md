# Stripe Statement Descriptor Configuration

## What to Fill in the Stripe Dashboard Form

### 1. Statement Descriptor (Main - Required)

**Fill in:** `CUSTODYCLARITY`

**Why:**

- ✅ 15 characters (within 5-22 limit)
- ✅ Matches your domain name (custodyclarity.com)
- ✅ Customers will recognize it on bank statements
- ✅ Reduces chargebacks (customers know what they paid for)

**Alternative options:**

- `CUSTODY CLARITY` (16 chars) - if you want a space
- `CUSTODYCLARITY.COM` (18 chars) - more explicit but longer

### 2. Shortened Descriptor (Optional - Recommended)

**Fill in:** `CUSTODY`

**Why:**

- ✅ 7 characters (under 10 limit)
- ✅ Clear and recognizable
- ✅ Used for individual product descriptors
- ✅ Matches your brand

**Alternative:** `CUSTODYCL` (9 chars) - if you want more characters

### 3. Customer Support (General Info)

**Fill in:**

- **Email:** `support@custodyclarity.com`
- **Phone:** (Optional - add if you have one)
- **Website:** `custodyclarity.com`

**Why:**

- Matches what's displayed on your website
- Consistent with your email templates
- Customers can reach you if they have questions

---

## How It Will Appear on Bank Statements

### Main Descriptor

```
Bank Statement:
CUSTODYCLARITY
€2.99
€9.99
€29.99
```

### With Shortened Descriptor (for individual products)

```
Bank Statement:
CUSTODY - PDF
€2.99
```

---

## Important Notes

### ✅ DO:

- Use all caps (standard for statement descriptors)
- Match your business name/URL
- Keep it simple and recognizable
- Test with a small transaction first

### ❌ DON'T:

- Use special characters (except spaces and hyphens)
- Make it too long (harder to read)
- Use abbreviations customers won't recognize
- Change it frequently (confuses customers)

---

## Next Steps

1. ✅ Fill in the form in Stripe Dashboard
2. ✅ Save the settings
3. ✅ Test with a small transaction (€0.50)
4. ✅ Check your bank statement to verify it appears correctly
5. ✅ Update code to include statement descriptors (see below)

---

## Code Implementation

The code should also set statement descriptors in checkout sessions for better control. See the updated `create-checkout/route.ts` file.
