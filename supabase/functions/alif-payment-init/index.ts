import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('📥 Received payment request:', requestBody);

    if (requestBody.test === true) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Function is accessible'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }

    const alifMerchantId = Deno.env.get('ALIF_MERCHANT_ID');
    const alifSecretKey = Deno.env.get('ALIF_SECRET_KEY');
    const alifApiUrl = Deno.env.get('ALIF_API_URL');
    const siteUrl = Deno.env.get('SITE_URL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    console.log('🔧 Environment variables check:');
    console.log('  ALIF_MERCHANT_ID:', alifMerchantId ? 'SET' : 'NOT SET');
    console.log('  ALIF_SECRET_KEY:', alifSecretKey ? 'SET' : 'NOT SET');
    console.log('  ALIF_API_URL:', alifApiUrl ? 'SET' : 'NOT SET');
    console.log('  SITE_URL:', siteUrl ? 'SET' : 'NOT SET');

    if (!alifMerchantId) {
      throw new Error('ALIF_MERCHANT_ID environment variable is not set');
    }
    if (!alifSecretKey) {
      throw new Error('ALIF_SECRET_KEY environment variable is not set');
    }
    if (!alifApiUrl) {
      throw new Error('ALIF_API_URL environment variable is not set');
    }

    const merchantId = alifMerchantId;
    const secretKey = alifSecretKey;
    const apiUrl = alifApiUrl;
    const returnSiteUrl = siteUrl || 'https://sakina-tj.netlify.app';

    const { amount, currency = 'TJS', gate = 'korti_milli', orderData } = requestBody;

    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!orderData?.customerInfo?.email) throw new Error('Customer email is required');
    if (!orderData?.customerInfo?.name) throw new Error('Customer name is required');
    if (!orderData?.customerInfo?.phone) throw new Error('Customer phone is required');

    const orderId = `SAKINA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const callbackUrl = `${supabaseUrl}/functions/v1/alif-payment-callback`;
    const returnUrl = `${returnSiteUrl}/payment/success?order_id=${orderId}`;

    // Generate token using new Alif Bank formula: key + order_id + amount + callback_url
    const amountFixed = parseFloat(amount).toFixed(2);
    const tokenString = `${merchantId}${orderId}${amountFixed}${callbackUrl}`;
    const token = createHmac('sha256', secretKey).update(tokenString).digest('hex');

    console.log('🔐 Token generation details (Alif Bank specification):');
    console.log('  Rule: HMAC256(key + order_id + amount.Fixed(2) + callback_url, password)');
    console.log('  Merchant ID (key):', merchantId);
    console.log('  Order ID:', orderId);
    console.log('  Amount Fixed(2):', amountFixed);
    console.log('  Callback URL:', callbackUrl);
    console.log('  Token string:', tokenString);
    console.log('  Secret key (password):', secretKey ? `${secretKey.substring(0, 4)}...${secretKey.substring(secretKey.length - 4)}` : 'NOT SET');
    console.log('  Generated token:', token);
    console.log('  Token string length:', tokenString.length);

    const invoices = orderData?.invoices?.invoices?.length > 0
      ? orderData.invoices
      : {
          invoices: orderData.items.map((item: any) => ({
            category: item.category || 'products',
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity)
          })),
          is_hold_required: false,
          is_outbox_marked: false
        };

    const paymentData = {
      key: merchantId,
      order_id: orderId,
      amount: parseFloat(amountFixed),
      callback_url: callbackUrl,
      return_url: returnUrl,
      email: orderData.customerInfo.email,
      phone: orderData.customerInfo.phone,
      gate: gate,
      token: token,
      invoices
    };

    console.log("🛒 Payload to Alif:", JSON.stringify(paymentData, null, 2));

    const alifResponse = await fetch(`${apiUrl}/v2/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'gate': gate,
        'isMarketPlace': 'false'
      },
      body: JSON.stringify(paymentData)
    });

    if (!alifResponse.ok) {
      const errorText = await alifResponse.text();
      console.error("❌ Alif Error Raw:", errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `Alif Bank API error: ${alifResponse.status} - ${errorText}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    const alifData = await alifResponse.json();
    if (alifData.code !== 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Alif Bank error: ${alifData.message || 'Unknown error'}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    const { data: payment, error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        alif_order_id: orderId,
        amount: amount,
        currency: currency,
        status: 'pending',
        order_data: orderData,
        user_id: null
      })
      .select()
      .single();

    if (dbError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create payment record'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

    const response = {
      success: true,
      payment_id: payment.id,
      order_id: orderId,
      payment_url: alifData.url,
      message: alifData.message
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('❌ Uncaught error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Payment init failed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
