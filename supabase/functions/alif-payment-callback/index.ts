import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AlifCallback {
  order_id: string;
  amount: string;
  currency: string;
  status: string;
  transaction_id?: string;
  message?: string;
  token?: string;
  [key: string]: any;
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

    const alifMerchantId = Deno.env.get('ALIF_MERCHANT_ID');
    const alifSecretKey = Deno.env.get('ALIF_SECRET_KEY');

    if (!alifMerchantId || !alifSecretKey) {
      throw new Error('Alif Bank credentials not configured');
    }

    // Parse callback data
    const callbackData: AlifCallback = await req.json();
    
    console.log('Received Alif callback:', {
      ...callbackData,
      token: callbackData.token ? '[HIDDEN]' : undefined
    });

    // Verify signature/token if provided
    if (callbackData.token) {
      // Generate expected token using the same formula as in payment initialization
      // Formula: HMAC256(key + order_id + amount.Fixed(2) + callback_url, password)
      const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/alif-payment-callback`;
      const amountFixed = parseFloat(callbackData.amount).toFixed(2);
      const tokenString = `${alifMerchantId}${callbackData.order_id}${amountFixed}${callbackUrl}`;
      
      const expectedToken = createHmac('sha256', alifSecretKey)
        .update(tokenString)
        .digest('hex');

      if (callbackData.token !== expectedToken) {
        console.error('Invalid callback signature:', {
          received: callbackData.token,
          expected: expectedToken,
          tokenString: tokenString
        });
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid signature - callback rejected'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
      
      console.log('Callback signature verified successfully');
    } else {
      console.warn('No token provided in callback - proceeding without signature verification');
    }

    // Find payment record
    const { data: payment, error: findError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('alif_order_id', callbackData.order_id)
      .single();

    if (findError || !payment) {
      console.error('Payment not found:', callbackData.order_id, findError);
      throw new Error('Payment record not found');
    }

    // Map Alif status to our status
    let paymentStatus = 'failed';
    switch (callbackData.status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
      case 'approve':
      case 'approved':
        paymentStatus = 'completed';
        break;
      case 'pending':
      case 'processing':
      case 'wait':
      case 'waiting':
        paymentStatus = 'pending';
        break;
      case 'cancelled':
      case 'canceled':
      case 'cancel':
        paymentStatus = 'cancelled';
        break;
      case 'failed':
      case 'error':
      case 'declined':
      case 'decline':
      case 'reject':
      case 'rejected':
        paymentStatus = 'failed';
        break;
      default:
        console.warn('Unknown payment status:', callbackData.status);
        paymentStatus = 'failed';
    }

    // Update payment record
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: paymentStatus,
        alif_transaction_id: callbackData.transaction_id,
        alif_callback_payload: callbackData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      throw new Error('Failed to update payment record');
    }

    // Handle successful payment
    if (paymentStatus === 'completed') {
      console.log(`Payment completed successfully: ${callbackData.order_id}`);
      
      // TODO: Add your business logic here
      // - Create order in orders table
      // - Send confirmation email to customer
      // - Update product inventory
      // - Trigger shipping/fulfillment process
      // - Send notification to admin
      
      // Example: You could create an order record
      /*
      const { error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          payment_id: payment.id,
          customer_email: payment.order_data.customerInfo.email,
          customer_name: payment.order_data.customerInfo.name,
          total_amount: payment.amount,
          status: 'confirmed',
          items: payment.order_data.items,
          delivery_info: payment.order_data.deliveryInfo
        });
      */
      
    } else if (paymentStatus === 'failed') {
      console.log(`Payment failed: ${callbackData.order_id} - ${callbackData.message || 'No message'}`);
    } else {
      console.log(`Payment status updated: ${callbackData.order_id} -> ${paymentStatus}`);
    }

    // Return success response (Alif Bank expects this)
    return new Response(
      JSON.stringify({ 
        success: true,
        status: 'callback_processed',
        payment_status: paymentStatus,
        order_id: callbackData.order_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Callback processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Callback processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});