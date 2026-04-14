import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[STRIPE] Function invoked');
    
    const stripeKey = Deno.env.get('STRIPE_API_KEY');
    if (!stripeKey) {
      console.error('[STRIPE] API key not found in environment');
      throw new Error('Stripe API key not configured');
    }

    console.log('[STRIPE] API key found, initializing Stripe');
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const requestBody = await req.json();
    console.log('[STRIPE] Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { 
      amount, 
      registrationId, 
      customerEmail, 
      customerName,
      metadata 
    } = requestBody;

    console.log('[STRIPE] Creating checkout session with:', {
      amount,
      registrationId,
      customerEmail,
      customerName,
      metadata
    });

    // Validate required fields
    if (!amount || !registrationId || !customerEmail) {
      console.error('[STRIPE] Missing required fields:', { amount, registrationId, customerEmail });
      throw new Error('Missing required payment information');
    }

    const origin = req.headers.get('origin') || 'https://1ad7837f-bd63-43dd-a5b9-d131482d6569.lovableproject.com';
    console.log('[STRIPE] Using origin:', origin);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            unit_amount: Math.round(amount * 100), // Convert to cents
            product_data: {
              name: 'Course Registration',
              description: metadata?.courseTitle || 'Training Course Registration',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: registrationId,
      metadata: {
        registrationId,
        ...metadata,
      },
      success_url: `${origin}/payment-success?registration=${registrationId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-failed?registration=${registrationId}`,
    });

    console.log('[STRIPE] Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url
    });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[STRIPE] Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[STRIPE] Error message:', errorMessage);
    console.error('[STRIPE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
