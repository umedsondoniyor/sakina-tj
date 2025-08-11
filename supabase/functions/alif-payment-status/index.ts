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
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const ALIF_MERCHANT_ID = Deno.env.get('ALIF_MERCHANT_ID') ?? '';
    const ALIF_SECRET_KEY = Deno.env.get('ALIF_SECRET_KEY') ?? '';
    const ALIF_API_URL = Deno.env.get('ALIF_API_URL') ?? 'https://test-api.alif.tj';
    // Validate env
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ALIF_MERCHANT_ID || !ALIF_SECRET_KEY) {
      throw new Error('One or more required environment variables are missing');
    }
    const { order_id } = await req.json();
    if (!order_id) throw new Error('Order ID is required');
    // ✅ Generate token: HMAC256(key + order_id, key_password)
    const tokenString = `${ALIF_MERCHANT_ID}${order_id}`;
    const token = createHmac('sha256', ALIF_SECRET_KEY).update(tokenString).digest('hex');
    console.log('🔐 Token string:', tokenString);
    console.log('🔐 Generated token:', token);
    // 🔍 Call Alif /checktxn API
    const alifResponse = await fetch(`${ALIF_API_URL}/checktxn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: ALIF_MERCHANT_ID,
        orderId: order_id,
        token: token
      })
    });
    const responseText = await alifResponse.text();
    if (!alifResponse.ok) {
      console.error('❌ Alif API error:', responseText);
      return new Response(JSON.stringify({
        success: false,
        error: `Alif API error: ${alifResponse.status} - ${responseText}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const alifData = JSON.parse(responseText);
    console.log('📦 Alif API response:', alifData);
    // ✅ Map Alif status to internal
    const statusMap = {
      ok: 'completed',
      pending: 'pending',
      to_approve: 'pending',
      partially_approved: 'partial',
      canceled: 'cancelled',
      partially_canceled: 'partial',
      failed: 'failed'
    };
    const alifStatus = alifData.status?.toLowerCase() || '';
    const newStatus = statusMap[alifStatus] ?? 'unknown';
    // 💾 Update DB
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: updateError } = await supabase.from('payments').update({
      status: newStatus,
      alif_transaction_id: alifData.transaction_id || null,
      updated_at: new Date().toISOString()
    }).eq('alif_order_id', order_id);
    if (updateError) {
      console.error('❌ Supabase update error:', updateError);
      throw new Error('Failed to update payment in Supabase');
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
    console.error('🔥 Unexpected error:', err);
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
