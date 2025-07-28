# Payment Configuration Analysis & Fixes

## 🔍 Current Configuration Issues Found

### 1. **Environment Variables Issues**
Your `.env` file has duplicate SUPABASE_URL entries:
```
VITE_SUPABASE_URL=https://pipglplowicyoexiiotd.supabase.co
VITE_SUPABASE_FUNCTIONS_URL=https://pipglplowicyoexiiotd.supabase.co/functions/v1
VITE_SUPABASE_URL=https://pipglplowicyoexiiotd.supabase.co  # ❌ DUPLICATE
```

### 2. **Missing Edge Function Environment Variables**
The Edge Functions need these environment variables in Supabase Dashboard:
- `ALIF_MERCHANT_ID` (currently using test: 656374)
- `ALIF_SECRET_KEY` (currently using test: QipCWXJGf39yJA77W5np)
- `ALIF_API_URL` (currently using test: https://test-web.alif.tj)
- `SITE_URL` (should be: https://sakina-tj.netlify.app)

### 3. **Edge Functions Deployment Status**
Need to verify if these functions are deployed:
- ✅ `alif-payment-init`
- ✅ `alif-payment-callback` 
- ✅ `alif-payment-status`
- ✅ `create-admin`

## 🛠️ Step-by-Step Fix Guide

### Step 1: Clean Environment Variables
1. Go to your `.env` file and remove the duplicate line
2. Ensure you have:
   ```
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://pipglplowicyoexiiotd.supabase.co
   VITE_SUPABASE_FUNCTIONS_URL=https://pipglplowicyoexiiotd.supabase.co/functions/v1
   ```

### Step 2: Set Edge Function Environment Variables
Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Edge Functions → Settings:

```
ALIF_MERCHANT_ID=656374
ALIF_SECRET_KEY=QipCWXJGf39yJA77W5np
ALIF_API_URL=https://test-web.alif.tj
SITE_URL=https://sakina-tj.netlify.app
```

### Step 3: Verify Edge Functions Are Deployed
Check in Supabase Dashboard → Edge Functions that you have:
- `alif-payment-init`
- `alif-payment-callback`
- `alif-payment-status`

### Step 4: Test Edge Function Accessibility
You can test if functions are accessible by visiting:
```
https://pipglplowicyoexiiotd.supabase.co/functions/v1/alif-payment-init
```

### Step 5: Database Permissions Check
Verify RLS policies allow Edge Functions to access the `payments` table.

## 🧪 Testing Checklist

### Frontend Testing:
1. ✅ Can access checkout page
2. ✅ Can fill out customer information
3. ✅ Can select payment method "Оплата онлайн"
4. ❌ Can click payment button without errors
5. ❌ Gets redirected to Alif Bank payment page

### Backend Testing:
1. ❌ Edge Functions are deployed and accessible
2. ❌ Environment variables are set correctly
3. ❌ Database permissions allow function access
4. ❌ Payment records are created in database

## 🚨 Most Likely Issues

### Issue #1: Edge Functions Not Deployed
**Symptoms:** "Failed to send a request to the Edge Function"
**Solution:** Deploy functions manually via Supabase Dashboard

### Issue #2: Missing Environment Variables
**Symptoms:** "Invalid amount" or "Authentication error"
**Solution:** Set all required environment variables in Supabase Dashboard

### Issue #3: RLS Policies Too Restrictive
**Symptoms:** "Permission denied" or database errors
**Solution:** Check RLS policies on `payments` table

### Issue #4: CORS Issues
**Symptoms:** Network errors or blocked requests
**Solution:** Verify CORS headers in Edge Functions

## 🔧 Quick Diagnostic Commands

### Test Edge Function Accessibility:
```bash
curl -X POST https://pipglplowicyoexiiotd.supabase.co/functions/v1/alif-payment-init \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Test Database Connection:
Check if you can query the payments table from the SQL editor in Supabase Dashboard.

## 📋 Next Steps

1. **First Priority:** Clean up environment variables
2. **Second Priority:** Verify Edge Functions are deployed
3. **Third Priority:** Set environment variables in Supabase Dashboard
4. **Fourth Priority:** Test payment flow end-to-end

## 🆘 If Still Not Working

If after following all steps the payment still doesn't work, the issue is likely:
1. Edge Functions are not properly deployed
2. Environment variables are not set in Supabase Dashboard
3. RLS policies are blocking Edge Function access
4. Alif Bank test credentials are incorrect

**Recommendation:** Start with a simple test by deploying just the `alif-payment-init` function and testing it with a minimal payload.