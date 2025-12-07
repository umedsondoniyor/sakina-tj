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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const body = await req.json();
    const { email, password, full_name, phone, date_of_birth, role = 'user' } = body;

    // Validate email
    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'EMAIL_REQUIRED',
          message: 'Email обязателен для заполнения'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Неверный формат email адреса. Пример: user@example.com'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate password
    if (!password) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'PASSWORD_REQUIRED',
          message: 'Пароль обязателен для заполнения'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'PASSWORD_TOO_SHORT',
          message: 'Пароль должен содержать минимум 6 символов'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check if user profile already exists (simpler check)
    const { data: existingProfile, error: profileCheckError } = await supabaseClient
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', profileCheckError);
      // Continue anyway, will catch duplicate on create
    }

    if (existingProfile) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'USER_EXISTS',
          message: `Пользователь с email ${email} уже существует в системе. Используйте другой email адрес.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create new user in auth
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: role,
        full_name: full_name || null
      }
    });

    if (createError) {
      // Log the full error for debugging
      console.error('User creation error:', JSON.stringify(createError, null, 2));
      
      // Check if error is due to existing user
      const errorMessage = (createError.message || '').toLowerCase();
      const errorString = JSON.stringify(createError).toLowerCase();
      const errorCode = (createError as any)?.code || '';
      const errorStatus = (createError as any)?.status || '';
      
      // Check various indicators of duplicate user
      const isDuplicateUser = 
        errorMessage.includes('already registered') || 
        errorMessage.includes('already exists') ||
        errorMessage.includes('user already registered') ||
        errorMessage.includes('email address has already been registered') ||
        errorMessage.includes('a user with this email address has already been registered') ||
        errorString.includes('already registered') ||
        errorString.includes('already exists') ||
        errorCode === 'user_already_exists' ||
        errorStatus === 422;
      
      if (isDuplicateUser) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'USER_EXISTS',
            message: `Пользователь с email ${email} уже зарегистрирован в системе. Используйте другой email адрес или восстановите доступ к существующему аккаунту.`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Check for invalid email format errors
      if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'INVALID_EMAIL',
            message: `Неверный формат email адреса: ${email}. Проверьте правильность введенного адреса.`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Check for weak password errors
      if (errorMessage.includes('password') && (errorMessage.includes('weak') || errorMessage.includes('short'))) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'WEAK_PASSWORD',
            message: 'Пароль слишком слабый. Используйте пароль длиной не менее 6 символов с буквами и цифрами.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // For other authentication errors, return user-friendly message
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'AUTH_ERROR',
          message: `Ошибка при создании пользователя: ${createError.message || 'Неизвестная ошибка аутентификации'}. Попробуйте еще раз или обратитесь к администратору.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'USER_CREATION_FAILED',
          message: 'Не удалось создать пользователя. Данные пользователя не были возвращены системой. Попробуйте еще раз.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Create user profile
    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .insert({
        id: newUser.user.id,
        email: email,
        full_name: full_name || null,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // If profile creation fails, try to delete the auth user
      try {
        await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      } catch (deleteError) {
        console.error('Failed to delete auth user after profile creation failure:', deleteError);
      }
      
      // Check for specific database errors
      let errorMessage = 'Не удалось создать профиль пользователя в базе данных.';
      if (profileError.code === '23505') {
        errorMessage = `Пользователь с email ${email} уже существует в базе данных. Используйте другой email адрес.`;
      } else if (profileError.code === '23503') {
        errorMessage = 'Ошибка целостности данных. Проверьте правильность введенных данных.';
      } else if (profileError.message) {
        errorMessage = `Ошибка базы данных: ${profileError.message}`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'PROFILE_CREATION_FAILED',
          message: errorMessage
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.user.id,
          email: email,
          role: role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in create-user function:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError || error.message?.includes('JSON')) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'INVALID_REQUEST',
          message: 'Неверный формат данных запроса. Проверьте правильность отправленных данных.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    // Handle network/server errors
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'SERVER_ERROR',
        message: `Внутренняя ошибка сервера: ${error.message || 'Неизвестная ошибка'}. Попробуйте еще раз позже или обратитесь к администратору.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

