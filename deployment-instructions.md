# Edge Function Deployment Instructions

## The Issue
The payment system is failing because the Supabase Edge Functions are not deployed or properly configured.

## Solution Steps

### 1. Verify Supabase CLI Installation
```bash
# Check if Supabase CLI is installed
supabase --version

# If not installed, install it
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link Your Project
```bash
# Replace 'your-project-ref' with your actual project reference
supabase link --project-ref pipglplowicyoexiiotd
```

### 4. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy alif-payment-init
supabase functions deploy alif-payment-callback
supabase functions deploy alif-payment-status
```

### 5. Verify Environment Variables
In your Supabase dashboard, go to:
**Project Settings → Edge Functions → Environment Variables**

Ensure these variables are set:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALIF_MERCHANT_ID`
- `ALIF_SECRET_KEY`
- `ALIF_API_URL`
- `SITE_URL`

### 6. Test the Function
After deployment, test the function:
```bash
# Test locally
supabase functions serve

# Or test the deployed function
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/alif-payment-init' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": true}'
```

## Alternative: Manual Deployment via Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create Function**
4. Copy the code from `supabase/functions/alif-payment-init/index.ts`
5. Paste it into the function editor
6. Save and deploy

## Troubleshooting
- If you get permission errors, use `sudo npm install -g supabase`
- If linking fails, check your project reference ID
- If deployment fails, check your function syntax and dependencies
- Verify all environment variables are correctly set in Supabase dashboard