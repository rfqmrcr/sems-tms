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
    const stripeKey = Deno.env.get('STRIPE_API_KEY');
    if (!stripeKey) {
      throw new Error('Stripe API key not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const { amount, registrationId, customerEmail, courseName, description } = await req.json();

    if (!amount || !registrationId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Stripe Payment Link for:', { registrationId, amount, customerEmail });

    // Create a product for this registration
    const product = await stripe.products.create({
      name: courseName || 'Course Registration',
      description: description || `Registration ID: ${registrationId}`,
      metadata: {
        registrationId: registrationId,
      },
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: 'myr',
    });

    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://fgmpgyigalemroggekzd.lovable.app'}/payment-success?registration_id=${registrationId}`,
        },
      },
      metadata: {
        registrationId: registrationId,
        customerEmail: customerEmail,
      },
      custom_fields: [
        {
          key: 'customer_email',
          label: {
            type: 'custom',
            custom: 'Email',
          },
          type: 'text',
          optional: false,
        },
      ],
    });

    console.log('Payment link created successfully:', paymentLink.id);

    return new Response(
      JSON.stringify({
        paymentLinkId: paymentLink.id,
        paymentLinkUrl: paymentLink.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment link:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create payment link' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
