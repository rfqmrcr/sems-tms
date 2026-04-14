import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { trainerId, email, fullName } = await req.json();

    if (!trainerId || !email || !fullName) {
      throw new Error('Missing required fields: trainerId, email, fullName');
    }

    console.log('Creating trainer account for:', email);

    // Generate temporary password (12 characters, mix of letters and numbers)
    const generatePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const temporaryPassword = generatePassword();

    // Create auth user with service role (bypasses email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        requires_password_change: true,
        trainer_id: trainerId,
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    console.log('Auth user created:', authData.user.id);

    // Assign trainer role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'trainer'
      });

    if (roleError) {
      console.error('Error assigning trainer role:', roleError);
      throw roleError;
    }

    console.log('Trainer role assigned');

    // Link trainer profile to auth user
    const { error: linkError } = await supabase
      .from('trainers')
      .update({ user_id: authData.user.id })
      .eq('id', trainerId);

    if (linkError) {
      console.error('Error linking trainer profile:', linkError);
      throw linkError;
    }

    console.log('Trainer profile linked to auth user');

    // Send credentials email
    const loginUrl = `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/auth`;
    
    const html = `<!DOCTYPE html>
      <html>
        <head><meta charSet="utf-8"><title>Trainer Credentials</title></head>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h1>Welcome to SEMS Trainer Portal!</h1>
          <p>Hello ${fullName},</p>
          <p>Your trainer account has been created. Here are your login credentials:</p>
          <div style="background:#f4f4f4;border:1px solid #e0e0e0;border-radius:8px;padding:16px;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
          </div>
          <p>Please change your password after your first login.</p>
          <p>
            <a href="${loginUrl}" style="display:inline-block;padding:12px 16px;background:#5469d4;color:#fff;text-decoration:none;border-radius:6px;">Login to Trainer Portal</a>
          </p>
          <hr />
          <p style="color:#8898aa;font-size:12px;">© ${new Date().getFullYear()} SEMS Training. All rights reserved.</p>
        </body>
      </html>`;

    const { error: emailError } = await resend.emails.send({
      from: 'SEMS Training <onboarding@resend.dev>',
      to: [email],
      subject: 'Your SEMS Trainer Portal Login Credentials',
      html,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      // Don't throw - account was created successfully, email failure is not critical
    } else {
      console.log('Credentials email sent successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        temporaryPassword: temporaryPassword, // Return for admin to see/copy
        message: 'Trainer account created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-trainer-account:', error);
    const message = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Failed to create trainer account';
    return new Response(
      JSON.stringify({
        error: message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
