import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');

    // Check if club member exists
    const { data: member, error: memberError } = await supabase
      .from('club_members')
      .select('id, full_name, phone, is_active')
      .eq('phone', phone)
      .eq('is_active', true)
      .maybeSingle();

    if (memberError) {
      console.error('Error checking member:', memberError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (!member) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Клубный участник с таким номером не найден. Пожалуйста, зарегистрируйтесь.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Generate OTP code (6 digits)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        phone: phone,
        code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      });

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate OTP' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Send OTP via SMS
    const smsMessage = {
      PhoneNumber: cleanPhone,
      Text: `Ваш код для входа в Клуб Sakina: ${otpCode}\n\nКод действителен 10 минут. Не сообщайте его никому.`,
      SenderAddress: 'SAKINA',
      Priority: 1,
      SmsType: 2,
      ScheduledAt: new Date().toISOString(),
      ExpiresIn: 10
    };

    const smsResponse = await fetch('https://sms2.aliftech.net/api/v1/sms/bulk', {
      method: 'POST',
      headers: {
        'X-Api-Key': Deno.env.get('SMS_API_KEY') ?? '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([smsMessage])
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error('SMS API error:', errorText);
      // Don't fail if SMS fails - OTP is still stored
      console.warn('OTP generated but SMS failed to send');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP отправлен на ваш номер телефона',
        expires_in: 600 // 10 minutes in seconds
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (err) {
    console.error('Error in send-club-login-otp:', err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message ?? 'Server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

