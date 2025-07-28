import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
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
    console.log('📥 Received payment request:', requestBody);

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

    // Get Alif Bank credentials from environment
    const alifMerchantId = Deno.env.get('ALIF_MERCHANT_ID');
    const alifSecretKey = Deno.env.get('ALIF_SECRET_KEY');
    const alifApiUrl = Deno.env.get('ALIF_API_URL');
    const siteUrl = Deno.env.get('SITE_URL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    console.log('🔧 Environment check:', {
      alifMerchantId: alifMerchantId ? 'SET' : 'MISSING',
      alifSecretKey: alifSecretKey ? 'SET' : 'MISSING',
      alifApiUrl: alifApiUrl ? 'SET' : 'MISSING',
      siteUrl: siteUrl ? 'SET' : 'MISSING',
    });

    // Use fallback values if environment variables are not set
    const merchantId = alifMerchantId || '656374';
    const secretKey = alifSecretKey || 'QipCWXJGf39yJA77W5np';
    const apiUrl = alifApiUrl || 'https://test-web.alif.tj';
    const returnSiteUrl = siteUrl || 'https://sakina-tj.netlify.app';

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
    const returnUrl = `${returnSiteUrl}/payment/success?order_id=${orderId}`;

    // Generate token using Alif Bank's formula: HMAC256(key + order_id + amount.Fixed(2) + callback_url, password)
    const amountFixed = amount.toFixed(2);
    const tokenString = `${merchantId}${orderId}${amountFixed}${callbackUrl}`;
    const token = createHmac('sha256', secretKey)
      .update(tokenString)
      .digest('hex');

    console.log('🔐 Token generation:', {
      merchantId,
      orderId,
      amountFixed,
      callbackUrl,
      tokenString: `${merchantId}${orderId}${amountFixed}${callbackUrl}`,
      token: token.substring(0, 8) + '...'
    });

    // Prepare payment data exactly as per Alif Bank API specification
    const paymentData = {
      key: merchantId,
      order_id: orderId,
      amount: parseFloat(amountFixed),
      callback_url: callbackUrl,
      return_url: returnUrl,
      email: orderData.customerInfo.email,
      phone: orderData.customerInfo.phone,
      gate: gate,
      info: `Заказ в магазине Sakina #${orderId}`,
      info_hash: "", // Optional field, can be empty
      token: token,
      invoices: {
        invoices: orderData.invoices.invoices,
        is_hold_required: orderData.invoices.is_hold_required,
        is_outbox_marked: orderData.invoices.is_outbox_marked
      },
      mpTerminalInfo: [] // Empty array for non-marketplace payments
    };

    console.log('📤 Sending payment request to Alif Bank:', {
      ...paymentData,
      token: '[HIDDEN]',
      key: '[HIDDEN]'
    });

    // Make request to Alif Bank with exact headers as per documentation
    const alifResponse = await fetch(`${apiUrl}/v2/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'gate': gate,
        'isMarketPlace': 'false'
      },
      body: JSON.stringify(paymentData),
    });

    console.log('📥 Alif Bank response status:', alifResponse.status);

    if (!alifResponse.ok) {
      const errorText = await alifResponse.text();
      console.error('❌ Alif Bank API error:', {
        status: alifResponse.status,
        statusText: alifResponse.statusText,
        body: errorText
      });
      throw new Error(`Alif Bank API error: ${alifResponse.status} - ${errorText}`);
    }

    const alifData = await alifResponse.json();
    console.log('✅ Alif Bank response:', alifData);

    if (alifData.code !== 0) {
      console.error('❌ Alif Bank business logic error:', alifData);
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
      console.error('❌ Database error:', dbError);
      throw new Error('Failed to create payment record');
    }

    console.log('✅ Payment record created:', payment.id);

    // Return success response with payment URL
    const response = {
      success: true,
      payment_id: payment.id,
      order_id: orderId,
      payment_url: alifData.url,
      message: alifData.message
    };

    console.log('✅ Returning success response:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Payment initialization error:', error);
    
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