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
    const { phone, code } = body;

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone and code are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Find valid OTP code
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error('Error finding OTP:', otpError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (!otpData) {
      // Increment attempts for the most recent OTP for this phone
      const { data: recentOtp } = await supabase
        .from('otp_codes')
        .select('id, attempts')
        .eq('phone', phone)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (recentOtp) {
        await supabase
          .from('otp_codes')
          .update({ attempts: (recentOtp.attempts || 0) + 1 })
          .eq('id', recentOtp.id);
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Неверный код или код истек. Пожалуйста, запросите новый код.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Check if too many attempts
    if (otpData.attempts >= 5) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Превышено количество попыток. Пожалуйста, запросите новый код.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpData.id);

    if (updateError) {
      console.error('Error updating OTP:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify OTP' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Get club member details
    const { data: member, error: memberError } = await supabase
      .from('club_members')
      .select('*')
      .eq('phone', phone)
      .eq('is_active', true)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ success: false, error: 'Member not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // If member has user_id, sign them in
    let authToken = null;
    if (member.user_id) {
      try {
        const tempEmail = `phone_${phone.replace(/[\s\+\-\(\)]/g, '').slice(3)}@sakina.tj`;
        const tempPassword = `Sakina${phone.replace(/[\s\+\-\(\)]/g, '').slice(-6)}!`;
        
        // Note: We can't directly sign in via edge function, but we can return success
        // The client will handle the sign-in if needed
      } catch (authErr) {
        console.warn('Auth sign-in skipped:', authErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Код подтвержден',
        member: {
          id: member.id,
          full_name: member.full_name,
          phone: member.phone,
          member_tier: member.member_tier,
          points: member.points,
          discount_percentage: member.discount_percentage,
          user_id: member.user_id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (err) {
    console.error('Error in verify-club-login-otp:', err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message ?? 'Server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

