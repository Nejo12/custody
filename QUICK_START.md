# 🚀 Quick Start: Add Payment Button to Result Page

You now have a complete payment system! Here's how to add it to your result page in **2 minutes**.

## Option 1: Simple Button (Recommended)

Add this anywhere on your result page where you want the payment button:

```tsx
import GetPDFButton from "@/components/GetPDFButton";

// Inside your Result component:
<GetPDFButton
  documentType="joint-custody"
  metadata={{
    interviewData: JSON.stringify(interview.answers),
    status: status,
  }}
/>;
```

That's it! The button handles everything:

- Opens pricing modal
- Collects email
- Processes payment
- Redirects to success page

## Option 2: Add to Existing Actions

If you already have a "Download PDF" or "Export" section, add it there:

```tsx
<div className="flex gap-4">
  {/* Your existing buttons */}
  <button onClick={handleExistingAction}>Free Export</button>

  {/* New payment button */}
  <GetPDFButton documentType="professional-package" variant="primary" />
</div>
```

## Option 3: Direct Modal Control

If you want more control:

```tsx
import { useState } from "react";
import PricingModal from "@/components/PricingModal";

function YourComponent() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <>
      <button onClick={() => setShowPricing(true)}>Get Professional Version</button>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        documentType="custody-application"
        metadata={
          {
            // Any data you want to pass through
          }
        }
      />
    </>
  );
}
```

## Where to Place It?

**Best locations on the result page:**

1. **Top of page** (after status card):

   ```tsx
   <StatusCard status={status} />;

   {
     /* NEW: Add payment CTA */
   }
   <div className="my-8 text-center">
     <h3 className="text-2xl font-bold mb-4">Get Your Court-Ready Documents</h3>
     <GetPDFButton />
   </div>;

   {
     /* Rest of your result content */
   }
   ```

2. **After citations** (natural flow):

   ```tsx
   {
     /* Show legal information */
   }
   <CitationsList citations={citations} />;

   {
     /* NEW: Payment CTA */
   }
   <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8 my-8">
     <h3 className="text-2xl font-bold mb-4">Ready to file your application?</h3>
     <p className="text-gray-600 dark:text-gray-400 mb-6">
       Get professionally formatted PDFs with all legal citations and court submission guides.
     </p>
     <GetPDFButton />
   </div>;
   ```

3. **Bottom of page** (after all info):

   ```tsx
   {
     /* All your result content */
   }

   {
     /* NEW: Final CTA */
   }
   <div className="text-center my-12">
     <h3 className="text-3xl font-bold mb-4">Ready to Take Action?</h3>
     <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
       Get court-ready documents delivered to your email in minutes.
     </p>
     <GetPDFButton />
   </div>;
   ```

## Testing

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Navigate to result page:**

   ```
   http://localhost:3000/result
   ```

3. **Click the button** - you should see the pricing modal!

4. **To test payment** (after Stripe setup):
   - Enter any email
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - See success page

## Next Steps

1. ✅ Add button to result page (done in 2 minutes)
2. ⏳ Set up Stripe & Resend (see [`PAYMENT_SETUP.md`](PAYMENT_SETUP.md))
3. ⏳ Test payment flow locally
4. ⏳ Deploy to production
5. 🎉 Get your first sale!

## Customization

### Change Button Text

```tsx
<GetPDFButton className="px-12 py-6">💼 Get Professional Package</GetPDFButton>
```

### Change Colors

```tsx
<GetPDFButton variant="secondary" />
```

### Hide for Free Users (Optional)

```tsx
{
  interview.answers.someField && <GetPDFButton />;
}
```

---

**That's it!** The payment system is live. Now follow [`PAYMENT_SETUP.md`](PAYMENT_SETUP.md) to configure Stripe and Resend.
