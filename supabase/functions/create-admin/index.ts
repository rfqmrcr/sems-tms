
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create a Supabase client with the Service Role key (admin privileges)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      })
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing environment variables' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Creating admin user with email:', email)
    
    // Create the user with admin privileges
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm the email
    })
    
    if (userError) {
      console.error('Error creating user:', userError)
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${userError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log('User created successfully:', userData.user.id)
    
    // Add the user to the user_roles table with admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([
        { 
          user_id: userData.user.id, 
          role: 'admin'
        }
      ])
    
    if (roleError) {
      console.error("Failed to insert admin role:", roleError)
      
      // Check if it's a duplicate key error (user already has admin role)
      if (roleError.code !== '23505') {
        return new Response(
          JSON.stringify({ 
            error: `User created but failed to add admin role: ${roleError.message}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      } else {
        console.log('User already has admin role, continuing...')
      }
    }
    
    console.log('Admin user setup completed successfully')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully. You can now log in.',
        user_id: userData.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
