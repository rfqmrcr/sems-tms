import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[WEBHOOK] Function invoked');
    
    const stripeKey = Deno.env.get('STRIPE_API_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('[WEBHOOK] Missing required environment variables');
      throw new Error('Missing required environment variables');
    }

    console.log('[WEBHOOK] Initializing Stripe and Supabase clients');
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('[WEBHOOK] Received webhook with signature:', signature ? 'present' : 'missing');

    // Verify the webhook signature
    let event;
    try {
      if (webhookSecret && signature) {
        console.log('[WEBHOOK] Verifying webhook signature');
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log('[WEBHOOK] Signature verified successfully');
      } else {
        console.warn('[WEBHOOK] No webhook secret configured, parsing event without verification');
        event = JSON.parse(body);
      }
    } catch (err) {
      console.error('[WEBHOOK] Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('[WEBHOOK] Received Stripe event:', event.type);
    console.log('[WEBHOOK] Event ID:', event.id);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const registrationId = session.metadata?.registrationId || session.client_reference_id;

        console.log('Payment successful for registration:', registrationId);

        // Update registration payment status
        const { error: updateError } = await supabase
          .from('registrations')
          .update({ 
            payment_status: 'paid',
            payment_type: 'Online',
            updated_at: new Date().toISOString()
          })
          .eq('id', registrationId);

        if (updateError) {
          console.error('Error updating registration:', updateError);
          throw updateError;
        }

        // Fetch registration details for email
        const { data: registration, error: fetchError } = await supabase
          .from('registrations')
          .select(`
            *,
            course:courses(*),
            course_run:course_runs(*),
            organization:organizations(*),
            trainees(*)
          `)
          .eq('id', registrationId)
          .single();

        if (fetchError) {
          console.error('Error fetching registration:', fetchError);
          throw fetchError;
        }

        // Send confirmation email
        console.log('Sending registration confirmation email...');
        const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
          body: { registration }
        });

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }

        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        const registrationId = session.metadata?.registrationId || session.client_reference_id;

        console.log('Payment failed for registration:', registrationId);

        // Update registration payment status
        const { error: updateError } = await supabase
          .from('registrations')
          .update({ 
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', registrationId);

        if (updateError) {
          console.error('Error updating registration:', updateError);
        }

        // Fetch registration details for payment failed email
        const { data: registration, error: fetchError } = await supabase
          .from('registrations')
          .select(`
            *,
            course:courses(*),
            course_run:course_runs(*),
            organization:organizations(*),
            trainees(*)
          `)
          .eq('id', registrationId)
          .single();

        if (fetchError) {
          console.error('Error fetching registration for failed payment email:', fetchError);
        } else {
          // Send payment failed email
          console.log('Sending payment failed notification email...');
          const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
            body: { 
              registration,
              emailType: 'payment_failed'
            }
          });

          if (emailError) {
            console.error('Error sending payment failed email:', emailError);
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
