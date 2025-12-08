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
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const requestBody = await req.json();
    const merchantId = Deno.env.get('ALIF_MERCHANT_ID');
    const secretPassword = Deno.env.get('ALIF_SECRET_KEY');
    const apiUrl = Deno.env.get('ALIF_API_URL');
    const returnSiteUrl = Deno.env.get('SITE_URL') || 'https://sakina-tj.netlify.app';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const { amount, currency = 'TJS', gate = 'korti_milli', orderData } = requestBody;

    // Validate environment variables
    if (!merchantId) {
      console.error('❌ ALIF_MERCHANT_ID is not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment gateway configuration error: ALIF_MERCHANT_ID not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    if (!secretPassword) {
      console.error('❌ ALIF_SECRET_KEY is not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment gateway configuration error: ALIF_SECRET_KEY not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    if (!apiUrl) {
      console.error('❌ ALIF_API_URL is not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment gateway configuration error: ALIF_API_URL not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!orderData?.customerInfo?.email || !orderData.customerInfo.email.trim()) {
      console.error('❌ Validation failed: Missing or empty email', { customerInfo: orderData?.customerInfo });
      throw new Error('Customer email is required');
    }
    if (!orderData?.customerInfo?.name || !orderData.customerInfo.name.trim()) {
      console.error('❌ Validation failed: Missing or empty name', { customerInfo: orderData?.customerInfo });
      throw new Error('Customer name is required');
    }
    if (!orderData?.customerInfo?.phone || !orderData.customerInfo.phone.trim()) {
      console.error('❌ Validation failed: Missing or empty phone', { customerInfo: orderData?.customerInfo });
      throw new Error('Customer phone is required');
    }

    // Debug logging for delivery info
    console.log('📦 Delivery info received:', {
      delivery_type: orderData?.deliveryInfo?.delivery_type,
      delivery_address: orderData?.deliveryInfo?.delivery_address,
      city: orderData?.deliveryInfo?.city,
      apartment: orderData?.deliveryInfo?.apartment
    });

    // Extract product title from items
    const productTitle = orderData.items?.length > 0 
      ? orderData.items.length === 1 
        ? orderData.items[0].name
        : `${orderData.items[0].name} и еще ${orderData.items.length - 1} товар(ов)`
      : 'Заказ';

    const orderId = `SAKINA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const callbackUrl = `${supabaseUrl}/functions/v1/alif-payment-callback`;
    const returnUrl = `${returnSiteUrl}/payment/success?order_id=${orderId}`;
    const amountFixed = parseFloat(amount).toFixed(2);

    // STEP 1: Generate first_token using merchantId as key, secretPassword as message
    const firstToken = createHmac('sha256', merchantId).update(secretPassword).digest('hex');

    // STEP 2: Generate real token using firstToken as key
    const tokenString = `${merchantId}${orderId}${amountFixed}${callbackUrl}`;
    const token = createHmac('sha256', firstToken).update(tokenString).digest('hex');

    console.log('🔐 Token generation:', {
      merchantIdLength: merchantId?.length,
      secretPasswordLength: secretPassword?.length,
      tokenString,
      tokenLength: token?.length,
      apiUrl,
      gate
    });

    const invoices = orderData?.invoices?.invoices?.length > 0 ? orderData.invoices : {
      invoices: orderData.items.map((item) => ({
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
      gate,
      token,
      invoices
    };

    console.log('📤 Sending to Alif Bank:', {
      url: `${apiUrl}/v2/`,
      gate,
      orderId,
      amount: amountFixed,
      hasToken: !!token
    });

    const alifResponse = await fetch(`${apiUrl}/v2/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        gate,
        isMarketPlace: 'false'
      },
      body: JSON.stringify(paymentData)
    });

    const alifText = await alifResponse.text();
    console.log('Raw Alif API response:', alifText);
    let alifData;
    try {
      alifData = JSON.parse(alifText);
    } catch (e) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to parse Alif API JSON response',
        rawResponse: alifText
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    if (![0, 200].includes(alifData.code)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Alif Bank error: ${alifData.message || 'Unknown error'}`,
        rawResponse: alifData
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    const { data: payment, error: dbError } = await supabaseClient.from('payments').insert({
      alif_order_id: orderId,
      amount,
      currency,
      status: 'pending',
      order_data: orderData,
      user_id: null,
      product_title: productTitle,
      customer_name: orderData.customerInfo.name,
      customer_phone: orderData.customerInfo.phone,
      customer_email: orderData.customerInfo.email,
      delivery_type: orderData.deliveryInfo?.delivery_type || 'pickup',
      delivery_address: orderData.deliveryInfo?.delivery_address,
      payment_gateway: gate,
      order_summary: {
        items: orderData.items,
        subtotal: orderData.subtotal || amount, // Original total before discount
        discount: orderData.discount || 0, // Discount amount
        discount_percentage: orderData.discount_percentage || 0, // Discount percentage
        total_amount: amount, // This is already the discounted amount
        currency: currency,
        customer_info: orderData.customerInfo,
        delivery_info: orderData.deliveryInfo,
        timestamp: new Date().toISOString()
      }
    }).select().single();

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

    return new Response(JSON.stringify({
      success: true,
      payment_id: payment.id,
      order_id: orderId,
      payment_url: alifData.url,
      message: alifData.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('🔥 Edge Function error:', error);
    console.error('🔥 Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Payment init failed',
      details: error instanceof Error ? error.stack : undefined
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
