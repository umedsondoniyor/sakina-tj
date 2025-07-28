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