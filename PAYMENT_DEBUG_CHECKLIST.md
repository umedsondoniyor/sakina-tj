# 🔍 Payment Debug Checklist

## Step 1: Check Environment Variables
Open your browser's Developer Tools (F12) and run:
```javascript
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('FUNCTIONS_URL:', import.meta.env.VITE_SUPABASE_FUNCTIONS_URL);
```

## Step 2: Test Edge Function Manually
In browser console, run:
```javascript
fetch('https://pipglplowicyoexiiotd.supabase.co/functions/v1/alif-payment-init', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcGdscGxvd2ljeW9leGlpb3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTQ0NDEsImV4cCI6MjA1NzE3MDQ0MX0.y-xQmEvdUNmDMX6s0QcPqyCtpzbNfP1L58RPkzGBOBM',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ test: true })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Step 3: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: pipglplowicyoexiiotd
3. Navigate to Edge Functions
4. Verify these functions exist:
   - ✅ alif-payment-init
   - ✅ alif-payment-callback
   - ✅ alif-payment-status

## Step 4: Check Environment Variables in Supabase
In Edge Functions settings, verify these are set:
```
ALIF_MERCHANT_ID=656374
ALIF_SECRET_KEY=QipCWXJGf39yJA77W5np
ALIF_API_URL=https://test-web.alif.tj
SITE_URL=https://sakina-tj.netlify.app
```

## Step 5: Test Payment Flow
1. Add items to cart
2. Go to checkout
3. Fill customer information
4. Select "Оплата онлайн"
5. Click payment button
6. Check browser console for detailed logs

## Expected Console Output:
```
🚀 Initiating payment with Supabase URL: https://pipglplowicyoexiiotd.supabase.co
📦 Order data: {...}
📋 Enhanced order data prepared
🔄 Calling Edge Function: alif-payment-init
✅ Edge Function response received: {...}
💳 Payment URL received: https://test-web.alif.tj/...
🔄 Redirecting to payment page...
```

## Common Issues & Solutions:

### Issue: "Function not found" (404)
**Solution:** Deploy the Edge Function in Supabase Dashboard

### Issue: "Failed to send a request"
**Solution:** Check if Edge Function is deployed and accessible

### Issue: "unauthorized" (401)
**Solution:** Check VITE_SUPABASE_ANON_KEY in .env file

### Issue: "Invalid amount"
**Solution:** Check if environment variables are set in Supabase Dashboard

### Issue: No payment URL returned
**Solution:** Check Alif Bank credentials and API endpoint