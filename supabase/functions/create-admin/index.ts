import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
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

    const adminEmail = 'admin@sakina.com';
    const adminPassword = 'admin123';

    // First, check if the admin credentials exist
    const { data: existingCredentials, error: credentialsCheckError } = await supabaseClient
      .from('admin_credentials')
      .select('email')
      .eq('email', adminEmail)
      .single();

    if (credentialsCheckError && credentialsCheckError.code !== 'PGRST116') {
      throw credentialsCheckError;
    }

    // Check if the user exists in auth.users
    const { data: { users }, error: userCheckError } = await supabaseClient.auth.admin.listUsers();
    
    if (userCheckError) {
      throw userCheckError;
    }

    let userId;
    const existingAdminUser = users.find(user => user.email === adminEmail);
    
    if (existingAdminUser) {
      userId = existingAdminUser.id;
      // Update the existing user's password
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { 
          password: adminPassword,
          user_metadata: { role: 'admin' },
          email_confirm: true
        }
      );
      
      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new admin user
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
      
      if (createError) {
        throw createError;
      }
      
      userId = newUser.user.id;
    }

    // Ensure user_profiles record exists with proper role
    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .upsert({
        id: userId,
        email: adminEmail,
        role: 'admin',
        full_name: 'Admin User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      throw profileError;
    }

    // Ensure admin_credentials record exists
    if (!existingCredentials) {
      const { error: credentialsError } = await supabaseClient
        .from('admin_credentials')
        .insert({ 
          email: adminEmail,
          created_at: new Date().toISOString()
        });

      if (credentialsError) {
        throw credentialsError;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created/updated successfully',
        email: adminEmail,
        userId: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-admin function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'No additional details available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});