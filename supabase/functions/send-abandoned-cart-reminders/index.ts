import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting abandoned cart reminder job...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find abandoned registrations (created more than 24 hours ago, payment status pending/unpaid)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: abandonedRegistrations, error: fetchError } = await supabase
      .from('registrations')
      .select(`
        *,
        course_runs!inner(
          id,
          title,
          start_date,
          end_date,
          start_time,
          end_time,
          location,
          price,
          courses!inner(
            id,
            title
          )
        ),
        organizations!inner(
          id,
          name
        )
      `)
      .in('payment_status', ['pending', 'unpaid'])
      .lt('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching abandoned registrations:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${abandonedRegistrations?.length || 0} potential abandoned registrations`);

    if (!abandonedRegistrations || abandonedRegistrations.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No abandoned registrations found', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const registration of abandonedRegistrations) {
      try {
        // Check if we've already sent an abandoned cart reminder for this registration
        const { data: existingReminder, error: reminderCheckError } = await supabase
          .from('email_logs')
          .select('id')
          .eq('registration_id', registration.id)
          .eq('email_type', 'abandoned_cart')
          .maybeSingle();

        if (reminderCheckError) {
          console.error(`Error checking reminder for registration ${registration.id}:`, reminderCheckError);
          continue;
        }

        if (existingReminder) {
          console.log(`Reminder already sent for registration ${registration.id}, skipping...`);
          remindersSkipped++;
          continue;
        }

        // Create or retrieve payment link
        let paymentLink = '';
        
        // Try to create a new Stripe checkout session
        try {
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
            'stripe-create-checkout',
            {
              body: {
                registrationId: registration.id,
                amount: registration.payment_amount,
                currency: 'myr',
                customerEmail: registration.contact_email,
                metadata: {
                  registrationId: registration.id,
                  courseRunId: registration.course_run_id,
                  organizationId: registration.organization_id,
                },
              },
            }
          );

          if (paymentError) {
            console.error(`Error creating payment link for registration ${registration.id}:`, paymentError);
          } else if (paymentData?.url) {
            paymentLink = paymentData.url;
          }
        } catch (paymentError) {
          console.error(`Exception creating payment link for registration ${registration.id}:`, paymentError);
        }

        // Send abandoned cart reminder email
        const { error: emailError } = await supabase.functions.invoke(
          'send-registration-email',
          {
            body: {
              registration: {
                id: registration.id,
                contact_person: registration.contact_person,
                contact_email: registration.contact_email,
                organization_id: registration.organization_id,
                course_run_id: registration.course_run_id,
                course_id: registration.course_id,
                hrdf_grant: registration.hrdf_grant,
                payment_amount: registration.payment_amount,
                payment_status: registration.payment_status,
                custom_registration_id: registration.custom_registration_id,
              },
              emailType: 'abandoned_cart',
              paymentLink: paymentLink,
            },
          }
        );

        if (emailError) {
          console.error(`Error sending reminder email for registration ${registration.id}:`, emailError);
          continue;
        }

        console.log(`Sent abandoned cart reminder for registration ${registration.id}`);
        remindersSent++;

      } catch (error) {
        console.error(`Error processing registration ${registration.id}:`, error);
        continue;
      }
    }

    const summary = {
      message: 'Abandoned cart reminder job completed',
      totalFound: abandonedRegistrations.length,
      remindersSent,
      remindersSkipped,
    };

    console.log('Job summary:', summary);

    return new Response(
      JSON.stringify(summary),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in abandoned cart reminder job:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
