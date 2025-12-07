import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { payment_id, status } = body;

    if (!payment_id || !status) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: payment_id and status'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Fetch payment details
    const { data: payment, error: findErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (findErr || !payment) {
      console.error('❌ Payment not found', findErr);
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

    // Helper function to clean phone numbers
    const cleanPhoneNumber = (phone: string) => {
      return phone.replace(/[\s\+\-\(\)]/g, '');
    };

    // Helper function to add default SMS fields
    const addDefaultFields = (message: any) => ({
      ...message,
      ScheduledAt: new Date().toISOString(),
      ExpiresIn: 10 // minutes
    });

    const orderTitle = payment.product_title || `Заказ №${payment.alif_order_id}`;
    
    // Extract items from order_summary or order_data
    const orderSummary = payment.order_summary || payment.order_data || {};
    const items = orderSummary.items || [];
    
    // Format items list for SMS
    const formatItemsList = (itemsList: any[]) => {
      if (!itemsList || itemsList.length === 0) {
        return 'Товары не указаны';
      }
      return itemsList.map((item: any, index: number) => {
        const itemName = item.name || 'Товар без названия';
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        return `${index + 1}. ${itemName} (${quantity} шт. × ${price} ${orderSummary.currency || 'TJS'})`;
      }).join('\n');
    };
    
    const itemsListText = formatItemsList(items);
    const itemsCount = items.length;
    const totalItemsQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    
    // Fetch phone numbers from sms_templates table
    let managerPhone = Deno.env.get('MANAGER_PHONE') || '+992936337785'; // fallback
    let deliveryPhone = Deno.env.get('DELIVERY_PHONE') || '+992936337785'; // fallback

    // Get manager phone from admin_payment_notification template
    const { data: adminTemplate, error: adminTemplateError } = await supabase
      .from('sms_templates')
      .select('phone_number')
      .eq('name', 'admin_payment_notification')
      .eq('is_active', true)
      .single();

    if (!adminTemplateError && adminTemplate?.phone_number) {
      managerPhone = adminTemplate.phone_number;
      console.log('✅ Manager phone from template:', managerPhone);
    } else {
      console.log('⚠️ Using fallback manager phone:', managerPhone);
    }

    // Get delivery phone from delivery_team_notification template
    const { data: deliveryTemplate, error: deliveryTemplateError } = await supabase
      .from('sms_templates')
      .select('phone_number')
      .eq('name', 'delivery_team_notification')
      .eq('is_active', true)
      .single();

    if (!deliveryTemplateError && deliveryTemplate?.phone_number) {
      deliveryPhone = deliveryTemplate.phone_number;
      console.log('✅ Delivery phone from template:', deliveryPhone);
    } else {
      console.log('⚠️ Using fallback delivery phone:', deliveryPhone);
    }

    let messages: any[] = [];

    // Prepare common variables for both statuses
    const customerName = payment.customer_name || orderSummary.customer_info?.name || 'Неизвестно';
    const customerPhone = payment.customer_phone || orderSummary.customer_info?.phone || 'Неизвестно';
    const customerEmail = payment.customer_email || orderSummary.customer_info?.email || '';
    const orderAmount = payment.amount || orderSummary.total_amount || '0';
    const orderCurrency = payment.currency || orderSummary.currency || 'TJS';
    const deliveryType = payment.delivery_type || orderSummary.delivery_info?.delivery_type || '';
    const deliveryTypeText = deliveryType === 'home' ? 'Доставка на дом' : deliveryType === 'pickup' ? 'Самовывоз' : 'Не указан';
    const deliveryAddress = payment.delivery_address || orderSummary.delivery_info?.delivery_address || (deliveryType === 'pickup' ? 'Самовывоз' : 'Не указан');
    const paymentMethodText = payment.payment_gateway === 'cash' ? 'Наличные' : payment.payment_gateway === 'alif_bank' ? 'Alif Bank' : payment.payment_gateway || 'Не указан';
    
    // Compact delivery info - combine if same
    const deliveryInfo = deliveryTypeText === deliveryAddress || deliveryType === 'pickup' 
      ? deliveryTypeText 
      : `${deliveryTypeText}, ${deliveryAddress}`;
    
    if (status === 'pending') {
      // Send SMS to manager when status is 'pending'
      const managerMessage = {
        PhoneNumber: cleanPhoneNumber(managerPhone),
        Text: `⏰ Новый заказ: ${orderTitle}

Сумма: ${orderAmount} ${orderCurrency} | ${paymentMethodText} | ${deliveryInfo}
Клиент: ${customerName} | ${customerPhone}${customerEmail ? ` | ${customerEmail}` : ''}

Товары (${itemsCount} позиций):
${itemsListText}`,
        SenderAddress: 'SAKINA',
        Priority: 1,
        SmsType: 2
      };
      messages.push(managerMessage);
    } else if (status === 'confirmed') {
      // Send SMS to delivery guy when status is 'confirmed'
      const deliveryMessage = {
        PhoneNumber: cleanPhoneNumber(deliveryPhone),
        Text: `🚚 Заказ для доставки: ${orderTitle}

Сумма: ${orderAmount} ${orderCurrency} | ${paymentMethodText} | ${deliveryInfo}
Клиент: ${customerName} | ${customerPhone}${customerEmail ? ` | ${customerEmail}` : ''}

Товары (${itemsCount} позиций):
${itemsListText}`,
        SenderAddress: 'SAKINA',
        Priority: 1,
        SmsType: 2
      };
      messages.push(deliveryMessage);
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No SMS to send for this status'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Get SMS templates from database if available
    // For 'pending' status, look for 'admin_payment_notification' template
    // For 'confirmed' status, look for 'delivery_team_notification' template
    const templateName = status === 'pending' ? 'admin_payment_notification' : 'delivery_team_notification';
    
    const { data: smsTemplates, error: templatesError } = await supabase
      .from('sms_templates')
      .select('*')
      .eq('is_active', true)
      .eq('name', templateName)
      .order('order_index', { ascending: true });

    if (!templatesError && smsTemplates && smsTemplates.length > 0) {
      // Use templates if available
      messages = smsTemplates.map((template: any) => {
        // Replace phone number variables with actual values
        let phoneNumber = template.phone_number
          .replace(/\{\{payment\.customer_phone\}\}/g, payment.customer_phone || orderSummary.customer_info?.phone || managerPhone)
          .replace(/\{\{payment\.delivery_phone\}\}/g, deliveryPhone)
          .replace(/\{\{manager_phone\}\}/g, managerPhone);

        // Determine delivery type text
        const deliveryType = payment.delivery_type || orderSummary.delivery_info?.delivery_type || '';
        const deliveryTypeText = deliveryType === 'home' ? 'Доставка на дом' : deliveryType === 'pickup' ? 'Самовывоз' : deliveryType || 'Не указан';
        
        // Determine delivery address
        const deliveryAddress = payment.delivery_address || orderSummary.delivery_info?.delivery_address || (deliveryType === 'pickup' ? 'Самовывоз' : 'Не указан');
        
        // Determine status text
        const statusText = status === 'confirmed' ? 'Подтвержден' : status === 'pending' ? 'Ожидает' : payment.status || 'Неизвестно';
        
        // Determine payment method text
        const paymentMethodText = payment.payment_gateway === 'cash' ? 'Наличные' : payment.payment_gateway === 'alif_bank' ? 'Alif Bank' : payment.payment_gateway || 'Не указан';
        
        // Get customer info
        const customerName = payment.customer_name || orderSummary.customer_info?.name || 'Клиент';
        const customerPhone = payment.customer_phone || orderSummary.customer_info?.phone || '';
        const customerEmail = payment.customer_email || orderSummary.customer_info?.email || '';
        const orderAmount = payment.amount?.toString() || orderSummary.total_amount?.toString() || '0';
        const orderCurrency = payment.currency || orderSummary.currency || 'TJS';
        const transactionId = payment.alif_transaction_id || payment.alif_order_id || '';
        
        // Create a clean order title without "Заказ" prefix for use in "Заказ" lines
        const cleanOrderTitle = orderTitle.startsWith('Заказ') ? orderTitle.replace(/^Заказ\s*№?\s*/, '') : orderTitle;
        
        // Replace text template variables - do multiple passes to handle nested replacements
        let messageText = template.text_template
          // First pass: replace all orderTitle occurrences
          .replace(/\{\{orderTitle\}\}/g, orderTitle)
          // Handle "Заказ" lines - use clean title to avoid duplication
          .replace(/Заказ\s*\{\{orderTitle\}\}/g, `Заказ №${cleanOrderTitle}`)
          .replace(/Заказ:\s*\{\{orderTitle\}\}/g, `Заказ: №${cleanOrderTitle}`)
          .replace(/Заказ\s*\(/g, `Заказ №${cleanOrderTitle} (`)
          .replace(/Заказ:\s*\(/g, `Заказ: №${cleanOrderTitle} (`)
          // Also handle cases where template might have "Заказ" followed by orderTitle variable
          .replace(/Заказ\s+Заказ\s*№/g, 'Заказ №')
          .replace(/Заказ:\s+Заказ\s*№/g, 'Заказ: №')
          // Customer info
          .replace(/\{\{payment\.customer_name\}\}/g, customerName)
          .replace(/\{\{payment\.customer_phone\}\}/g, customerPhone)
          .replace(/\{\{payment\.customer_email\}\}/g, customerEmail || 'Не указан')
          // Order details
          .replace(/\{\{payment\.amount\}\}/g, orderAmount)
          .replace(/\{\{payment\.currency\}\}/g, orderCurrency)
          .replace(/\{\{payment\.status\}\}/g, statusText)
          .replace(/\{\{payment\.alif_transaction_id\}\}/g, transactionId)
          .replace(/\{\{payment\.payment_gateway\}\}/g, paymentMethodText)
          .replace(/\{\{payment\.delivery_type\}\}/g, deliveryTypeText)
          .replace(/\{\{payment\.delivery_address\}\}/g, deliveryAddress)
          // Items
          .replace(/\{\{items_list\}\}/g, itemsListText)
          .replace(/\{\{items_count\}\}/g, itemsCount.toString())
          .replace(/\{\{items_total_quantity\}\}/g, totalItemsQuantity.toString())
          // Phone numbers
          .replace(/\{\{manager_phone\}\}/g, managerPhone)
          .replace(/\{\{delivery_phone\}\}/g, deliveryPhone);
        
        // If items list is missing from template, append it
        if (!messageText.includes(itemsListText) && itemsListText !== 'Товары не указаны') {
          messageText += `\n\nТовары (${itemsCount} позиций):\n${itemsListText}`;
        }
        
        // Apply compact format transformations to template messages
        // Remove redundant lines and combine information
        const compactDeliveryInfo = deliveryTypeText === deliveryAddress || deliveryType === 'pickup' 
          ? deliveryTypeText 
          : `${deliveryTypeText}, ${deliveryAddress}`;
        
        messageText = messageText
          // Remove redundant "Покупатель подтвердил оплату" or similar
          .replace(/Покупатель подтвердил оплату\.?\s*\n\s*\n/g, '\n')
          // Remove redundant "Пожалуйста, свяжитесь с клиентом и доставьте вовремя."
          .replace(/Пожалуйста, свяжитесь с клиентом и доставьте вовремя\.?\s*\n\s*\n/g, '\n')
          // Remove redundant "Заказ №" line if order title already in header
          .replace(/Заказ\s*№[^\n]+\s*\([^)]+\)\s*\n/g, '')
          .replace(/Заказ:\s*№[^\n]+\s*\([^)]+\)\s*\n/g, '')
          // Remove redundant "Статус:" line
          .replace(/Статус:\s*[^\n]+\s*\n/g, '')
          // Remove redundant "Транзакция:" line (same as order ID)
          .replace(/Транзакция:\s*[^\n]+\s*\n/g, '')
          // Replace separate delivery lines with compact format
          .replace(/Тип доставки:\s*([^\n]+)\s*\n\s*Адрес:\s*\1\s*\n/g, `Доставка: $1\n`)
          .replace(/Тип доставки:\s*([^\n]+)\s*\n\s*Адрес:\s*([^\n]+)\s*\n/g, (match, type, addr) => {
            if (type === addr || type === 'Самовывоз') {
              return `Доставка: ${type}\n`;
            }
            return `Доставка: ${type}, ${addr}\n`;
          })
          // Combine customer info lines into one compact line
          .replace(/Имя клиента:\s*([^\n]+)\s*\n\s*Тел клиента:\s*([^\n]+)\s*\n\s*Email клиента:\s*([^\n]*)\s*\n/g, (match, name, phone, email) => {
            const emailPart = email && email !== 'Не указан' && email.trim() ? ` | ${email}` : '';
            return `Клиент: ${name} | ${phone}${emailPart}\n`;
          })
          // Remove "всего X шт." from items count
          .replace(/Товары\s*\((\d+)\s*позиций,\s*всего\s*\d+\s*шт\.\)/g, 'Товары ($1 позиций)')
          // Clean up multiple newlines
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        
        // If compact format wasn't applied (template might have different structure), try to add compact summary
        if (!messageText.includes('Сумма:') && !messageText.includes('Клиент:')) {
          // Try to insert compact summary after header
          const headerMatch = messageText.match(/^([^\n]+)\n/);
          if (headerMatch) {
            const header = headerMatch[1];
            const rest = messageText.substring(headerMatch[0].length);
            messageText = `${header}\n\nСумма: ${orderAmount} ${orderCurrency} | ${paymentMethodText} | ${compactDeliveryInfo}\nКлиент: ${customerName} | ${customerPhone}${customerEmail && customerEmail !== 'Не указан' ? ` | ${customerEmail}` : ''}\n\n${rest}`;
          }
        }

        return {
          PhoneNumber: cleanPhoneNumber(phoneNumber),
          Text: messageText,
          SenderAddress: template.sender_address || 'SAKINA',
          Priority: template.priority || 1,
          SmsType: template.sms_type || 2
        };
      });
    }

    // Add default fields and send
    const bulkMessages = messages.map(addDefaultFields);

    console.log('📲 Sending SMS messages:', JSON.stringify(bulkMessages, null, 2));

    const smsResponse = await fetch('https://sms2.aliftech.net/api/v1/sms/bulk', {
      method: 'POST',
      headers: {
        'X-Api-Key': Deno.env.get('SMS_API_KEY') ?? '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bulkMessages)
    });

    console.log('📲 SMS API response status:', smsResponse.status);

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error('📲 SMS API error:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send SMS',
        details: errorText
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
      message: 'SMS sent successfully',
      status: status,
      messages_sent: bulkMessages.length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err: any) {
    console.error('🔥 SMS sending error', err);
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

