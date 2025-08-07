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
    const ALIF_MERCHANT_ID = Deno.env.get('ALIF_MERCHANT_ID');
    const ALIF_SECRET_KEY = Deno.env.get('ALIF_SECRET_KEY');
    const ALIF_API_URL = Deno.env.get('ALIF_API_URL');
    const { order_id } = await req.json();
    if (!order_id) throw new Error('Order ID is required');
    // Generate token for status check
    const tokenString = `${ALIF_MERCHANT_ID}${order_id}`;
    const token = createHmac('sha256', ALIF_SECRET_KEY).update(tokenString).digest('hex');
    // Call Alif API to check transaction status
    const alifResponse = await fetch(`${ALIF_API_URL}/checktxn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: ALIF_MERCHANT_ID,
        orderId: order_id,
        token
      })
    });
    if (!alifResponse.ok) {
      const errorText = await alifResponse.text();
      return new Response(JSON.stringify({
        success: false,
        error: `Alif API error: ${alifResponse.status} - ${errorText}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const alifData = await alifResponse.json();
    // Map Alif status to internal status
    const statusMap = {
      ok: 'completed',
      pending: 'pending',
      to_approve: 'pending',
      partially_approved: 'partial',
      canceled: 'cancelled',
      partially_canceled: 'partial',
      failed: 'failed'
    };
    const newStatus = statusMap[alifData.status?.toLowerCase()] ?? 'unknown';
    // Update DB record
    const { error: updateError } = await supabase.from('payments').update({
      status: newStatus,
      alif_transaction_id: alifData.transaction_id || null,
      updated_at: new Date().toISOString()
    }).eq('alif_order_id', order_id);
    if (updateError) {
      throw new Error('Failed to update payment record');
    }
    return new Response(JSON.stringify({
      success: true,
      status: newStatus,
      alif_status: alifData.status,
      order_id
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
