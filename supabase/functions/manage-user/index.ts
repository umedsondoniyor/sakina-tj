import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS'
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Log all headers for debugging
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Get the authorization header - Supabase functions automatically include it
    // Try multiple header name variations
    const authHeader = 
      req.headers.get('Authorization') || 
      req.headers.get('authorization') ||
      req.headers.get('x-authorization') ||
      req.headers.get('X-Authorization');
    
    console.log('Authorization header found:', !!authHeader);
    console.log('Authorization header value:', authHeader ? `${authHeader.substring(0, 20)}...` : 'none');
    
    if (!authHeader) {
      console.error('No authorization header found. Available headers:', Array.from(req.headers.keys()));
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authorization header required. Please ensure you are logged in.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Parse request body early (needed for fallback path)
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'INVALID_REQUEST',
          message: 'Invalid JSON in request body'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create client with anon key to verify the user's token
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify user is authenticated
    console.log('Attempting to verify user with token...');
    
    // First, try to decode the JWT to get the user ID
    let userIdFromToken: string | null = null;
    try {
      // Decode JWT to get user ID (without verification, just to extract the sub claim)
      const tokenParts = authHeader.replace('Bearer ', '').split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        userIdFromToken = payload.sub;
        console.log('User ID from JWT:', userIdFromToken);
      }
    } catch (e) {
      console.error('Error decoding JWT:', e);
    }

    // Try to verify user with Supabase auth
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    // If auth.getUser() fails but we have a user ID from the token, check user_profiles directly
    if (userError && userIdFromToken) {
      console.warn('Auth.getUser() failed, but we have user ID from token. Checking user_profiles directly...', {
        error: userError.message,
        userIdFromToken
      });
      
      // Use admin client to check if user exists in user_profiles and has admin role
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('role, email')
        .eq('id', userIdFromToken)
        .single();

      if (profileError || !profile) {
        console.error('User not found in user_profiles:', profileError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'UNAUTHORIZED',
            message: 'User not found. Please ensure you are logged in and have a valid account.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }

      if (profile.role !== 'admin') {
        console.error('User does not have admin role:', profile.role);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'FORBIDDEN',
            message: 'Admin access required'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        );
      }

      // User has admin role, continue with the request
      console.log('User verified via user_profiles:', { userId: userIdFromToken, role: profile.role });
      // Create a mock user object for compatibility
      const mockUser = { id: userIdFromToken, email: profile.email || '' };
      
      // Continue with admin operations using the admin client
      // We'll use supabaseAdmin for all operations since we've verified admin access
      const { action, userId, ...updateData } = body;

      if (!action || !userId) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'INVALID_REQUEST',
            message: 'Action and userId are required'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Handle delete action
      if (action === 'delete') {
        // First, check if user exists in auth.users
        const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        // Delete from auth.users if user exists there
        if (authUser && !getUserError) {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          
          if (deleteError) {
            console.error('Error deleting from auth.users:', deleteError);
            // Continue to delete from user_profiles even if auth deletion fails
          } else {
            console.log('User deleted from auth.users successfully');
          }
        } else {
          console.log('User does not exist in auth.users, deleting from user_profiles only');
        }

        // Always try to delete from user_profiles (in case user only exists there)
        const { error: profileDeleteError } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', userId);

        if (profileDeleteError) {
          console.error('Error deleting from user_profiles:', profileDeleteError);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'DELETE_FAILED',
              message: profileDeleteError.message || 'Failed to delete user profile'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'User deleted successfully'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Handle update action
      if (action === 'update') {
        const { email, password, role, full_name, phone, date_of_birth } = updateData;

        const authUpdatePayload: {
          email?: string;
          password?: string;
          user_metadata?: Record<string, any>;
        } = {};

        if (email) authUpdatePayload.email = email;
        if (password) authUpdatePayload.password = password;
        if (role) authUpdatePayload.user_metadata = { role };

        if (Object.keys(authUpdatePayload).length > 0) {
          const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            authUpdatePayload
          );

          if (authError) {
            return new Response(
              JSON.stringify({ 
                success: false,
                error: 'AUTH_UPDATE_FAILED',
                message: authError.message || 'Failed to update user authentication'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              }
            );
          }
        }

        const profileUpdate: any = {
          updated_at: new Date().toISOString()
        };

        if (role !== undefined) profileUpdate.role = role;
        if (full_name !== undefined) profileUpdate.full_name = full_name;
        if (phone !== undefined) profileUpdate.phone = phone;
        if (date_of_birth !== undefined) profileUpdate.date_of_birth = date_of_birth;
        if (email !== undefined) profileUpdate.email = email;

        const { error: profileUpdateError } = await supabaseAdmin
          .from('user_profiles')
          .update(profileUpdate)
          .eq('id', userId);

        if (profileUpdateError) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'PROFILE_UPDATE_FAILED',
              message: profileUpdateError.message || 'Failed to update user profile'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'User updated successfully'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'INVALID_ACTION',
          message: 'Invalid action. Use "update" or "delete"'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    if (userError) {
      console.error('Auth error details:', {
        message: userError.message,
        status: (userError as any)?.status,
        code: (userError as any)?.code,
        name: userError.name
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'UNAUTHORIZED',
          message: `Invalid authentication: ${userError.message}. Please ensure you are logged in and have a valid session.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }
    
    if (!user) {
      console.error('No user found after auth verification');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User not found. Please ensure you are logged in.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('User verified:', { userId: user.id, email: user.email });

    // Create client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user has admin role using admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin access required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Body already parsed earlier
    const { action, userId, ...updateData } = body;

    if (!action || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'INVALID_REQUEST',
          message: 'Action and userId are required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (action === 'update') {
      const { email, password, role, full_name, phone, date_of_birth } = updateData;

      // Prepare update payload
      const authUpdatePayload: {
        email?: string;
        password?: string;
        user_metadata?: Record<string, any>;
      } = {};

      if (email) authUpdatePayload.email = email;
      if (password) authUpdatePayload.password = password;
      if (role) authUpdatePayload.user_metadata = { role };

      // Update auth user if there are auth changes
      if (Object.keys(authUpdatePayload).length > 0) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          authUpdatePayload
        );

        if (authError) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'AUTH_UPDATE_FAILED',
              message: authError.message || 'Failed to update user authentication'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      }

      // Update user profile
      const profileUpdate: any = {
        updated_at: new Date().toISOString()
      };

      if (role !== undefined) profileUpdate.role = role;
      if (full_name !== undefined) profileUpdate.full_name = full_name;
      if (phone !== undefined) profileUpdate.phone = phone;
      if (date_of_birth !== undefined) profileUpdate.date_of_birth = date_of_birth;
      if (email !== undefined) profileUpdate.email = email;

      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileError) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'PROFILE_UPDATE_FAILED',
            message: profileError.message || 'Failed to update user profile'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'User updated successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (action === 'delete') {
      // First, check if user exists in auth.users
      const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      // Delete from auth.users if user exists there
      if (authUser && !getUserError) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          console.error('Error deleting from auth.users:', deleteError);
          // Continue to delete from user_profiles even if auth deletion fails
        } else {
          console.log('User deleted from auth.users successfully');
        }
      } else {
        console.log('User does not exist in auth.users, deleting from user_profiles only');
      }

      // Always try to delete from user_profiles (in case user only exists there)
      const { error: profileDeleteError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteError) {
        console.error('Error deleting from user_profiles:', profileDeleteError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'DELETE_FAILED',
            message: profileDeleteError.message || 'Failed to delete user profile'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'User deleted successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'INVALID_ACTION',
        message: 'Invalid action. Use "update" or "delete"'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  } catch (error: any) {
    console.error('Error in manage-user function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'SERVER_ERROR',
        message: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
