import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
Deno.serve(async (req)=>{
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
    const { amount, currency = 'TJS', gate = 'vsa', orderData } = requestBody;
    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!orderData?.customerInfo?.email) throw new Error('Customer email is required');
    if (!orderData?.customerInfo?.name) throw new Error('Customer name is required');
    if (!orderData?.customerInfo?.phone) throw new Error('Customer phone is required');

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
    const invoices = orderData?.invoices?.invoices?.length > 0 ? orderData.invoices : {
      invoices: orderData.items.map((item)=>({
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
    if (![
      0,
      200
    ].includes(alifData.code)) {
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
      delivery_type: orderData.deliveryInfo?.type || 'home',
      delivery_address: orderData.deliveryInfo?.address || null,
      payment_gateway: gate,
      order_summary: {
        items: orderData.items,
        total_amount: amount,
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
