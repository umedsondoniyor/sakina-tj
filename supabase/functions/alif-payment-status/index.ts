import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { order_id } = await req.json();
    if (!order_id) throw new Error('Order ID is required');

    const { data: payment, error: dbError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('alif_order_id', order_id)
      .single();

    if (dbError || !payment) throw new Error('Payment not found');

    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: payment.id,
        order_id: payment.alif_order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transaction_id: payment.alif_transaction_id,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Status check error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Status check failed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
