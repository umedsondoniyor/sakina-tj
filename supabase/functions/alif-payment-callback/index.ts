import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';
// Public CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
Deno.serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
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
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const body = await req.json();
    console.log('🔁 Alif callback received:', {
      ...body,
      token: body.token ? '[HIDDEN]' : undefined
    });
    const { orderId, status, transactionId, token } = body;
    if (!orderId || !status || !transactionId || !token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // --- Token validation (HMAC-SHA256 over orderId + status + transactionId) ---
    const secret = Deno.env.get('ALIF_ENCRYPTED_KEY');
    if (!secret) {
      console.error('❌ ALIF_ENCRYPTED_KEY is not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'Server misconfiguration'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    const tokenString = `${orderId}${status}${transactionId}`;
    const expectedToken = createHmac('sha256', secret).update(tokenString).digest('hex');
    if (token !== expectedToken) {
      console.error('❌ Invalid token', {
        received: token,
        expected: expectedToken,
        tokenString
      });
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }
    console.log('✅ Token verified');
    // Fetch payment
    const { data: payment, error: findErr } = await supabase.from('payments').select('*').eq('alif_order_id', orderId).single();
    if (findErr || !payment) {
      console.error('❌ Payment not found for orderId', orderId, findErr);
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment not found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 404
      });
    }
    // Map Alif status → internal
    let mapped = 'failed';
    switch ((status || '').toLowerCase()) {
      case 'ok':
      case 'success':
      case 'approved':
      case 'paid':
        mapped = 'completed';
        break;
      case 'pending':
      case 'processing':
      case 'wait':
      case 'waiting':
      case 'to_approve':
        mapped = 'pending';
        break;
      case 'cancel':
      case 'canceled':
      case 'cancelled':
        mapped = 'cancelled';
        break;
      default:
        mapped = 'failed';
    }
    // Update payment
    const { error: updateErr } = await supabase.from('payments').update({
      status: mapped,
      alif_transaction_id: transactionId,
      alif_callback_payload: body,
      updated_at: new Date().toISOString()
    }).eq('id', payment.id);
    if (updateErr) {
      console.error('❌ Failed to update payment', updateErr);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update payment'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    // --- SMS notifications (only if payment completed) ---
    if (mapped === 'completed') {
      const orderTitle = payment.product_title || `Заказ №${orderId}`;
      
      // Helper function to clean phone numbers
      const cleanPhoneNumber = (phone) => {
        return phone.replace(/[\s\+\-\(\)]/g, '');
      };
      
      // Helper function to add default SMS fields
      const addDefaultFields = (message) => ({
        ...message,
        ScheduledAt: new Date().toISOString(),
        ExpiresIn: 10 // minutes  
      });

      // Get SMS templates from database
      const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
      const { data: smsTemplates, error: templatesError } = await supabaseClient.from('sms_templates').select('*').eq('is_active', true).order('order_index', {
        ascending: true
      });

      if (templatesError) {
        console.error('Error fetching SMS templates:', templatesError);
        // Fallback to default messages if templates can't be loaded
        const fallbackMessages = [
          {
            PhoneNumber: cleanPhoneNumber(payment.customer_phone || "+992936337785"),
            Text: `✅ Оплата прошла успешно! Ваш заказ: «${orderTitle}». Спасибо, что выбрали Sakina.tj 🙏`,
            SenderAddress: "SAKINA",
            Priority: 1,
            SmsType: 2
          },
          {
            PhoneNumber: cleanPhoneNumber("+992936337785"),
            Text: `💰 Оплачен новый заказ: «${orderTitle}». Покупатель: ${payment.customer_name || 'Неизвестно'}, тел: ${payment.customer_phone || 'Неизвестно'}`,
            SenderAddress: "SAKINA", 
            Priority: 1,
            SmsType: 2
          },
          {
            PhoneNumber: cleanPhoneNumber("+992936337785"),
            Text: `🚚 Новый заказ для доставки: «${orderTitle}». Тип: ${payment.delivery_type || 'pickup'}. ${payment.delivery_address ? `Адрес: ${payment.delivery_address}` : 'Самовывоз'}`,
            SenderAddress: "SAKINA",
            Priority: 1, 
            SmsType: 2
          }
        ];
        
        // Add default fields and send
        const bulkMessages = fallbackMessages.map(addDefaultFields);
        
        console.log('📲 Sending fallback SMS messages (array of objects):', JSON.stringify(bulkMessages, null, 2));
        
        const smsResponse = await fetch("https://sms2.aliftech.net/api/v1/sms/bulk", {
          method: "POST",
          headers: {
            "X-Api-Key": Deno.env.get("SMS_API_KEY") ?? "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bulkMessages)
        });
        
        console.log('📲 SMS API response status:', smsResponse.status);
        if (!smsResponse.ok) {
          console.error('📲 SMS API error:', await smsResponse.text());
        }
      } else {
        // Process templates and replace variables
        const processedMessages = (smsTemplates || []).map((template) => {
          // Replace variables in phone number field
          let phoneNumber = template.phone_number
            .replace(/\{\{payment\.customer_phone\}\}/g, payment.customer_phone || "+992936337785")
            .replace(/\{\{payment\.delivery_phone\}\}/g, "+992936337785");
          
          // Replace variables in text template
          let messageText = template.text_template
            .replace(/\{\{orderTitle\}\}/g, orderTitle)
            .replace(/\{\{payment\.customer_name\}\}/g, payment.customer_name || 'Клиент')
            .replace(/\{\{payment\.customer_phone\}\}/g, payment.customer_phone || '')
            .replace(/\{\{payment\.customer_email\}\}/g, payment.customer_email || '')
            .replace(/\{\{payment\.delivery_phone\}\}/g, "+992936337785")
            .replace(/\{\{payment\.amount\}\}/g, payment.amount?.toString() || '0')
            .replace(/\{\{payment\.currency\}\}/g, payment.currency || 'TJS')
            .replace(/\{\{payment\.status\}\}/g, mapped)
            .replace(/\{\{payment\.alif_transaction_id\}\}/g, payment.alif_transaction_id || transactionId || '')
            .replace(/\{\{payment\.delivery_type\}\}/g, payment.delivery_type || '')
            .replace(/\{\{payment\.delivery_address\}\}/g, payment.delivery_address || '')
            .replace(/\{\{payment\.payment_gateway\}\}/g, payment.payment_gateway || 'Alif');

          // Return properly structured SMS object
          return {
            PhoneNumber: cleanPhoneNumber(phoneNumber),
            Text: messageText,
            SenderAddress: template.sender_address,
            Priority: template.priority,
            SmsType: template.sms_type
          };
        });
        
        // Add default fields and send
        const bulkMessages = processedMessages.map(addDefaultFields);
        
        console.log('📲 Sending SMS messages from templates (array of objects):', JSON.stringify(bulkMessages, null, 2));
        
        const smsResponse = await fetch("https://sms2.aliftech.net/api/v1/sms/bulk", {
          method: "POST",
          headers: {
            "X-Api-Key": Deno.env.get("SMS_API_KEY") ?? "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bulkMessages)
        });
        
        console.log('📲 SMS API response status:', smsResponse.status);
        if (!smsResponse.ok) {
          console.error('📲 SMS API error:', await smsResponse.text());
        }
      }
      // Process templates and replace variables
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Callback processed',
      order_id: orderId,
      status: mapped
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    console.error('🔥 Callback error', err);
    return new Response(JSON.stringify({
      success: false,
      error: err?.message ?? 'Server error'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
