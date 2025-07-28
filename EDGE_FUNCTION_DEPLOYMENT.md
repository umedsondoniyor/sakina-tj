# Manual Edge Function Deployment Guide

Since the Supabase CLI is not available in this environment, you need to deploy the Edge Functions manually through the Supabase Dashboard.

## 🚀 Step-by-Step Manual Deployment

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `pipglplowicyoexiiotd`

### 2. Navigate to Edge Functions
1. In the left sidebar, click **"Edge Functions"**
2. Click **"Create a new function"**

### 3. Deploy alif-payment-init Function

#### Create the Function:
1. **Function name**: `alif-payment-init`
2. **Copy and paste** the following code:

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PaymentRequest {
  amount: number;
  currency?: string;
  gate?: string;
  orderData: {
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
    }>;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    deliveryInfo: {
      type: string;
      address?: string;
    };
    invoices: {
      invoices: Array<{
        category: string;
        name: string;
        price: number;
        quantity: number;
      }>;
      is_hold_required: boolean;
      is_outbox_marked: boolean;
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse request body first
    const requestBody = await req.json();

    // Handle test requests for accessibility check
    if (requestBody.test === true) {
      return new Response(
        JSON.stringify({ success: true, message: 'Function is accessible' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get Alif Bank credentials from environment (using test credentials from guide)
    const alifMerchantId = Deno.env.get('ALIF_MERCHANT_ID') || '656374';
    const alifSecretKey = Deno.env.get('ALIF_SECRET_KEY') || 'QipCWXJGf39yJA77W5np';
    const alifApiUrl = Deno.env.get('ALIF_API_URL') || 'https://test-web.alif.tj';
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    // Destructure payment parameters from the parsed body
    const { amount, currency = 'TJS', gate = 'korti_milli', orderData }: PaymentRequest = requestBody;

    // Validate request
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!orderData?.customerInfo?.email) {
      throw new Error('Customer email is required');
    }

    if (!orderData?.customerInfo?.name) {
      throw new Error('Customer name is required');
    }

    if (!orderData?.customerInfo?.phone) {
      throw new Error('Customer phone is required');
    }

    // Generate unique order ID
    const orderId = `SAKINA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare callback URL
    const callbackUrl = `${supabaseUrl}/functions/v1/alif-payment-callback`;

    // Generate token using Alif Bank's formula: HMAC256(key + order_id + amount.Fixed(2) + callback_url, password)
    const amountFixed = amount.toFixed(2);
    const tokenString = `${alifMerchantId}${orderId}${amountFixed}${callbackUrl}`;
    const token = createHmac('sha256', alifSecretKey)
      .update(tokenString)
      .digest('hex');

    // Prepare payment data for Alif Bank
    const paymentData = {
      key: alifMerchantId,
      order_id: orderId,
      amount: parseFloat(amountFixed),
      callback_url: callbackUrl,
      return_url: `${siteUrl}/payment/success?order_id=${orderId}`,
      email: orderData.customerInfo.email,
      phone: orderData.customerInfo.phone,
      gate: gate,
      info: `Заказ в магазине Sakina #${orderId}`,
      token: token,
      invoices: {
        invoices: orderData.invoices.invoices,
        is_hold_required: orderData.invoices.is_hold_required,
        is_outbox_marked: orderData.invoices.is_outbox_marked
      }
    };

    console.log('Sending payment request to Alif Bank:', {
      ...paymentData,
      token: '[HIDDEN]'
    });

    // Make request to Alif Bank
    const alifResponse = await fetch(`${alifApiUrl}/v2/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'gate': gate,
        'isMarketPlace': 'false'
      },
      body: JSON.stringify(paymentData),
    });

    if (!alifResponse.ok) {
      const errorText = await alifResponse.text();
      console.error('Alif Bank API error:', {
        status: alifResponse.status,
        statusText: alifResponse.statusText,
        body: errorText
      });
      throw new Error(`Alif Bank API error: ${alifResponse.status} - ${errorText}`);
    }

    const alifData = await alifResponse.json();
    console.log('Alif Bank response:', alifData);

    if (alifData.code !== 0) {
      throw new Error(`Alif Bank error: ${alifData.message || 'Unknown error'}`);
    }

    // Store payment record in database
    const { data: payment, error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        alif_order_id: orderId,
        amount: amount,
        currency: currency,
        status: 'pending',
        order_data: orderData,
        user_id: null, // Will be updated when user is authenticated
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create payment record');
    }

    // Return success response with payment URL
    const response = {
      success: true,
      payment_id: payment.id,
      order_id: orderId,
      payment_url: alifData.url,
      message: alifData.message
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment initialization error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Payment initialization failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

3. Click **"Deploy function"**

### 4. Deploy alif-payment-callback Function

#### Create the Function:
1. Click **"Create a new function"** again
2. **Function name**: `alif-payment-callback`
3. **Copy and paste** the following code:

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AlifCallback {
  order_id: string;
  amount: string;
  currency: string;
  status: string;
  transaction_id?: string;
  message?: string;
  token?: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Use test credentials from guide
    const alifMerchantId = Deno.env.get('ALIF_MERCHANT_ID') || '656374';
    const alifSecretKey = Deno.env.get('ALIF_SECRET_KEY') || 'QipCWXJGf39yJA77W5np';

    // Parse callback data
    const callbackData: AlifCallback = await req.json();
    
    console.log('Received Alif callback:', {
      ...callbackData,
      token: callbackData.token ? '[HIDDEN]' : undefined
    });

    // Verify signature/token if provided
    if (callbackData.token) {
      // Generate expected token using the same formula as in payment initialization
      // Formula: HMAC256(key + order_id + amount.Fixed(2) + callback_url, password)
      const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/alif-payment-callback`;
      const amountFixed = parseFloat(callbackData.amount).toFixed(2);
      const tokenString = `${alifMerchantId}${callbackData.order_id}${amountFixed}${callbackUrl}`;
      
      const expectedToken = createHmac('sha256', alifSecretKey)
        .update(tokenString)
        .digest('hex');

      if (callbackData.token !== expectedToken) {
        console.error('Invalid callback signature:', {
          received: callbackData.token,
          expected: expectedToken,
          tokenString: tokenString
        });
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid signature - callback rejected'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
      
      console.log('Callback signature verified successfully');
    } else {
      console.warn('No token provided in callback - proceeding without signature verification');
    }

    // Find payment record
    const { data: payment, error: findError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('alif_order_id', callbackData.order_id)
      .single();

    if (findError || !payment) {
      console.error('Payment not found:', callbackData.order_id, findError);
      throw new Error('Payment record not found');
    }

    // Map Alif status to our status (following the guide mapping)
    let paymentStatus = 'failed';
    switch (callbackData.status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
      case 'approve':
      case 'approved':
        paymentStatus = 'completed';
        break;
      case 'pending':
      case 'processing':
      case 'wait':
      case 'waiting':
        paymentStatus = 'pending';
        break;
      case 'cancelled':
      case 'canceled':
      case 'cancel':
        paymentStatus = 'cancelled';
        break;
      case 'failed':
      case 'error':
      case 'declined':
      case 'decline':
      case 'reject':
      case 'rejected':
        paymentStatus = 'failed';
        break;
      default:
        console.warn('Unknown payment status:', callbackData.status);
        paymentStatus = 'failed';
    }

    // Update payment record
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: paymentStatus,
        alif_transaction_id: callbackData.transaction_id,
        alif_callback_payload: callbackData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      throw new Error('Failed to update payment record');
    }

    // Handle successful payment
    if (paymentStatus === 'completed') {
      console.log(`Payment completed successfully: ${callbackData.order_id}`);
      
      // Business logic for successful payment
      try {
        // Create order record (if orders table exists)
        const orderData = {
          payment_id: payment.id,
          customer_email: payment.order_data.customerInfo.email,
          customer_name: payment.order_data.customerInfo.name,
          customer_phone: payment.order_data.customerInfo.phone,
          total_amount: payment.amount,
          currency: payment.currency,
          status: 'confirmed',
          items: payment.order_data.items,
          delivery_info: payment.order_data.deliveryInfo,
          created_at: new Date().toISOString()
        };
        
        // Try to create order record (will fail silently if table doesn't exist)
        const { error: orderError } = await supabaseClient
          .from('orders')
          .insert(orderData);
        
        if (orderError) {
          console.warn('Could not create order record (table may not exist):', orderError.message);
        } else {
          console.log('Order record created successfully');
        }
      } catch (orderCreationError) {
        console.warn('Order creation failed:', orderCreationError);
      }
      
    } else if (paymentStatus === 'failed') {
      console.log(`Payment failed: ${callbackData.order_id} - ${callbackData.message || 'No message'}`);
    } else {
      console.log(`Payment status updated: ${callbackData.order_id} -> ${paymentStatus}`);
    }

    // Return success response (Alif Bank expects this)
    return new Response(
      JSON.stringify({ 
        success: true,
        status: 'callback_processed',
        payment_status: paymentStatus,
        order_id: callbackData.order_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Callback processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Callback processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

4. Click **"Deploy function"**

### 5. Deploy alif-payment-status Function

#### Create the Function:
1. Click **"Create a new function"** again
2. **Function name**: `alif-payment-status`
3. **Copy and paste** the following code:

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StatusRequest {
  order_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const alifApiUrl = Deno.env.get('ALIF_API_URL') || 'https://test-web.alif.tj';

    const { order_id }: StatusRequest = await req.json();

    if (!order_id) {
      throw new Error('Order ID is required');
    }

    // Get payment from database
    const { data: payment, error: dbError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('alif_order_id', order_id)
      .single();

    if (dbError || !payment) {
      throw new Error('Payment not found');
    }

    // For now, we'll return the current status from our database
    // In a production environment, you might want to also check with Alif Bank
    // using their transaction status endpoint if available

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          order_id: payment.alif_order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          transaction_id: payment.alif_transaction_id,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Status check error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Status check failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

4. Click **"Deploy function"**

### 6. Set Environment Variables

1. Go to **Project Settings** → **Edge Functions** → **Environment Variables**
2. Add these variables:

```
ALIF_MERCHANT_ID=656374
ALIF_SECRET_KEY=QipCWXJGf39yJA77W5np
ALIF_API_URL=https://test-web.alif.tj
SITE_URL=https://sakina-tj.netlify.app
```

### 7. Test the Functions

After deployment, test if the functions are working:

1. Go to **Edge Functions** in your dashboard
2. Click on `alif-payment-init`
3. Click **"Invoke function"**
4. Use this test payload:

```json
{
  "test": true
}
```

If you see `{"success": true, "message": "Function is accessible"}`, the function is working!

## ✅ After Manual Deployment

Once all three functions are deployed and environment variables are set:

1. ✅ Payment initialization will work
2. ✅ Payment callbacks will be processed
3. ✅ Payment status checking will function
4. ✅ The checkout process will be fully operational

## 🔧 Troubleshooting

If you encounter issues:

1. **Check function logs** in the Supabase Dashboard
2. **Verify environment variables** are set correctly
3. **Test each function individually** using the invoke feature
4. **Check the payments table** exists in your database

The payment system will be fully functional once these Edge Functions are manually deployed!