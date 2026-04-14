
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactFormRequest = await req.json();

    // Compose the email to send to contact@sems.ae
    const emailResponse = await resend.emails.send({
      from: "Website Contact Form <contact@sems.ae>",
      to: ["contact@sems.ae"],
      subject: `Contact Form: ${subject}`,
      reply_to: email,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> <a href="mailto:${email}">${email}</a></p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation email to the user as well (optional, can remove if not wanted)
    await resend.emails.send({
      from: "SEMS Training <contact@sems.ae>",
      to: [email],
      subject: "Thank you for contacting 1Accelerate!",
      html: `
        <p>Hi ${name},</p>
        <p>We have received your message:</p>
        <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
        <p>We will get back to you as soon as possible.<br>— 1Accelerate Team</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
