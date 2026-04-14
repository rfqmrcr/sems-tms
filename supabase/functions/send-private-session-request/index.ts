import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PrivateSessionRequest {
  name: string;
  email: string;
  mobile: string;
  courseChoice: string;
  numberOfPeople: string;
  message: string;
  requestedSessionDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      name,
      email,
      mobile,
      courseChoice,
      numberOfPeople,
      message,
      requestedSessionDate,
    }: PrivateSessionRequest = await req.json();

    const applicationDateTime = new Date().toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    console.log("Processing private session request:", {
      name,
      email,
      courseChoice,
      numberOfPeople,
      requestedSessionDate,
      applicationDateTime,
    });

    // Email to the user
    const userEmailResponse = await resend.emails.send({
      from: "SEMS Training <contact@sems.ae>",
      to: [email],
      cc: ["contact@sems.ae"],
      subject: "Private Session Request Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your interest, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            We have received your application for a private session. Our team will review your request and get back to you shortly.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Request Details:</h3>
            <p style="margin: 8px 0;"><strong>Application Date & Time:</strong> ${applicationDateTime}</p>
            ${requestedSessionDate ? `<p style="margin: 8px 0;"><strong>Requested Session Date:</strong> ${requestedSessionDate}</p>` : ''}
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Mobile:</strong> ${mobile}</p>
            <p style="margin: 8px 0;"><strong>Course:</strong> ${courseChoice}</p>
            <p style="margin: 8px 0;"><strong>Number of People:</strong> ${numberOfPeople}</p>
            ${message ? `<p style="margin: 8px 0;"><strong>Message:</strong> ${message}</p>` : ''}
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any urgent questions, feel free to contact us at contact@sems.ae.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            <strong>SEMS Training Team</strong>
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Private session request sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-private-session-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
