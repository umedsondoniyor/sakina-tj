// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
Deno.serve(async (req)=>{
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  // Only POST expected
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 405
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const callbackData = await req.json().catch(()=>({}));
    // Alif sample: { token, amount, status, account, orderId, transactionId, transaction_type }
    const { orderId, status, transactionId } = callbackData || {};
    console.log('🔁 Callback received (no-auth, no-token-verify):', {
      orderId,
      status,
      transactionId
    });
    // Minimal required fields
    if (!orderId || !status) {
      console.error('⚠️ Callback missing required fields:', {
        orderId,
        status
      });
      // Still ACK with 200 so Alif does not retry
      return new Response(JSON.stringify({
        success: true,
        message: 'ACK (missing fields logged)'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Map Alif status → internal status
    let paymentStatus = 'failed';
    switch(String(status).toLowerCase()){
      case 'ok':
      case 'success':
      case 'approved':
      case 'paid':
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
      default:
        paymentStatus = 'failed';
        break;
    }
    // Find payment by alif_order_id
    const { data: payment, error: paymentError } = await supabase.from('payments').select('*').eq('alif_order_id', orderId).single();
    if (paymentError || !payment) {
      console.error('❌ Payment not found for orderId:', orderId, paymentError);
      // Still ACK; we don’t want Alif to retry forever
      return new Response(JSON.stringify({
        success: true,
        message: 'ACK (payment not found; logged)',
        order_id: orderId,
        status: paymentStatus
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Update payment (idempotent)
    const { error: updateError } = await supabase.from('payments').update({
      status: paymentStatus,
      alif_transaction_id: transactionId ?? payment.alif_transaction_id ?? null,
      alif_callback_payload: callbackData,
      updated_at: new Date().toISOString()
    }).eq('id', payment.id);
    if (updateError) {
      console.error('❌ Failed to update payment record:', updateError);
      // Still ACK to prevent retries
      return new Response(JSON.stringify({
        success: true,
        message: 'ACK (update failed; logged)',
        order_id: orderId,
        status: paymentStatus
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // ✅ Success
    return new Response(JSON.stringify({
      success: true,
      message: 'Callback processed',
      order_id: orderId,
      status: paymentStatus
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    console.error('🔥 Callback processing error:', err);
    // Still ACK to avoid retries
    return new Response(JSON.stringify({
      success: true,
      message: 'ACK (exception logged)'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
