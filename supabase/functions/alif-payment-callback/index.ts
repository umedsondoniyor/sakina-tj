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
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const alifSecretKey = Deno.env.get('ALIF_SECRET_KEY') ?? ''; // Password used to verify token
    const callbackData = await req.json();
    console.log('🔁 Callback received:', {
      ...callbackData,
      token: callbackData.token ? '[HIDDEN]' : undefined
    });
    const { orderId, status, transactionId, token } = callbackData;
    if (!token || !orderId || !status || !transactionId) {
      throw new Error('Missing required callback fields');
    }
    // ✅ Token verification using correct logic: HMAC256(orderId + status + transactionId, password)
    const tokenString = `${orderId}${status}${transactionId}`;
    const expectedToken = createHmac('sha256', alifSecretKey).update(tokenString).digest('hex');
    if (token !== expectedToken) {
      console.error('❌ Invalid token:', {
        received: token,
        expected: expectedToken
      });
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid token - callback rejected'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }
    console.log('✅ Callback token verified successfully');
    // 🔍 Fetch payment from Supabase
    const { data: payment, error: paymentError } = await supabase.from('payments').select('*').eq('alif_order_id', orderId).single();
    if (paymentError || !payment) {
      console.error('❌ Payment not found:', paymentError);
      throw new Error('Payment record not found');
    }
    // 🔄 Map Alif status to internal payment status
    let paymentStatus = 'failed';
    switch(status?.toLowerCase()){
      case 'success':
      case 'approved':
      case 'paid':
      case 'complete':
        paymentStatus = 'completed';
        break;
      case 'pending':
      case 'processing':
      case 'wait':
      case 'waiting':
      case 'to_approve':
        paymentStatus = 'pending';
        break;
      case 'cancel':
      case 'canceled':
      case 'cancelled':
        paymentStatus = 'cancelled';
        break;
      case 'failed':
      case 'error':
      case 'declined':
      case 'rejected':
        paymentStatus = 'failed';
        break;
      default:
        paymentStatus = 'failed';
        console.warn('⚠️ Unknown callback status received:', status);
    }
    // 💾 Update the payment record in Supabase
    const { error: updateError } = await supabase.from('payments').update({
      status: paymentStatus,
      alif_transaction_id: transactionId,
      alif_callback_payload: callbackData,
      updated_at: new Date().toISOString()
    }).eq('id', payment.id);
    if (updateError) {
      console.error('❌ Failed to update payment record:', updateError);
      throw new Error('Failed to update payment');
    }
    // ✅ Respond to Alif with success
    return new Response(JSON.stringify({
      success: true,
      message: 'Callback processed successfully',
      status: paymentStatus,
      order_id: orderId
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    console.error('🔥 Callback processing error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
