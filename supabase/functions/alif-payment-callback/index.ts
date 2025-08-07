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
    const alifMerchantId = Deno.env.get('ALIF_MERCHANT_ID') || '656374';
    const alifSecretKey = Deno.env.get('ALIF_SECRET_KEY') || 'QipCWXJGf39yJA77W5np';
    const callbackData = await req.json();
    console.log('Received Alif callback:', {
      ...callbackData,
      token: callbackData.token ? '[HIDDEN]' : undefined
    });
    // ✅ Verify token if provided using 2-step HMAC
    if (callbackData.token) {
      const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/alif-payment-callback`;
      const amountFixed = parseFloat(callbackData.amount).toFixed(2);
      const tokenString = `${alifMerchantId}${callbackData.order_id}${amountFixed}${callbackUrl}`;
      // Step 1: Generate first token using HMAC(ALIF_MERCHANT_ID, ALIF_SECRET_KEY)
      const firstToken = createHmac('sha256', alifSecretKey).update(alifMerchantId).digest('hex');
      // Step 2: Generate final token using HMAC(tokenString, firstToken)
      const expectedToken = createHmac('sha256', firstToken).update(tokenString).digest('hex');
      if (callbackData.token !== expectedToken) {
        console.error('Invalid callback signature:', {
          received: callbackData.token,
          expected: expectedToken,
          tokenString
        });
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid signature - callback rejected'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 401
        });
      }
      console.log('Callback signature verified successfully');
    } else {
      console.warn('No token provided in callback - proceeding without verification');
    }
    // 🔍 Find payment
    const { data: payment, error: findError } = await supabaseClient.from('payments').select('*').eq('alif_order_id', callbackData.order_id).single();
    if (findError || !payment) {
      console.error('Payment not found:', callbackData.order_id, findError);
      throw new Error('Payment record not found');
    }
    // 🏷 Map Alif status to internal status
    let paymentStatus = 'failed';
    const statusMap = {
      success: 'completed',
      completed: 'completed',
      paid: 'completed',
      approve: 'completed',
      approved: 'completed',
      pending: 'pending',
      processing: 'pending',
      wait: 'pending',
      waiting: 'pending',
      cancelled: 'cancelled',
      canceled: 'cancelled',
      cancel: 'cancelled',
      failed: 'failed',
      error: 'failed',
      declined: 'failed',
      decline: 'failed',
      reject: 'failed',
      rejected: 'failed'
    };
    const alifStatus = callbackData.status?.toLowerCase() || '';
    paymentStatus = statusMap[alifStatus] || 'failed';
    // 💾 Update payment record
    const { error: updateError } = await supabaseClient.from('payments').update({
      status: paymentStatus,
      alif_transaction_id: callbackData.transaction_id,
      alif_callback_payload: callbackData,
      updated_at: new Date().toISOString()
    }).eq('id', payment.id);
    if (updateError) {
      console.error('Failed to update payment:', updateError);
      throw new Error('Failed to update payment record');
    }
    // ✅ Optionally create order record
    if (paymentStatus === 'completed') {
      try {
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
        const { error: orderError } = await supabaseClient.from('orders').insert(orderData);
        if (orderError) {
          console.warn('Order insert failed:', orderError.message);
        } else {
          console.log('Order record created');
        }
      } catch (e) {
        console.warn('Order creation error:', e);
      }
    } else if (paymentStatus === 'failed') {
      console.log(`Payment failed: ${callbackData.order_id} - ${callbackData.message || 'No message'}`);
    } else {
      console.log(`Payment status updated: ${callbackData.order_id} -> ${paymentStatus}`);
    }
    // ✅ Send success response to Alif
    return new Response(JSON.stringify({
      success: true,
      status: 'callback_processed',
      payment_status: paymentStatus,
      order_id: callbackData.order_id
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Callback processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Callback processing failed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
