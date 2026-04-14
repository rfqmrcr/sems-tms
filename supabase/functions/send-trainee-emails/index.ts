import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TraineeEmailRequest {
  registrationId: string;
  courseName: string;
  courseStartDate: string;
  courseEndDate: string;
  courseStartTime: string;
  courseEndTime: string;
  location: string;
  companyName: string;
  courseId: string;
}

// Helper functions
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatTime = (timeStr: string) => {
  // timeStr is in format "HH:MM:SS"
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0);
  return date.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const getEmailTemplate = async (courseId: string, triggerPoint: string = 'trainee_confirmation') => {
  try {
    // First try to find a specific template for the course
    let { data: templates } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .eq('trigger_point', triggerPoint)
      .eq('course_id', courseId);

    if (templates && templates.length > 0) {
      return templates[0];
    }

    // If no course-specific template, try to get a general template
    ({ data: templates } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .eq('trigger_point', triggerPoint)
      .is('course_id', null));

    if (templates && templates.length > 0) {
      return templates[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
};

const processEmailTemplate = (template: any, data: any): { subject: string; html: string } => {
  const replacements: { [key: string]: string } = {
    '{traineeName}': data.traineeName || '',
    '{companyName}': data.companyName || '',
    '{courseName}': data.courseName || '',
    '{courseStartDate}': data.courseStartDate || '',
    '{courseEndDate}': data.courseEndDate || '',
    '{courseStartTime}': data.courseStartTime || '',
    '{courseEndTime}': data.courseEndTime || '',
    '{location}': data.location || 'SEMS Training Centre, Dubai Healthcare City, Dubai, United Arab Emirates',
  };

  let processedSubject = template.subject;
  let processedHtml = template.html_content;

  // Replace all variables in subject and content
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    processedSubject = processedSubject.replace(regex, value);
    processedHtml = processedHtml.replace(regex, value);
  });

  return {
    subject: processedSubject,
    html: processedHtml,
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      registrationId,
      courseName,
      courseStartDate,
      courseEndDate,
      courseStartTime,
      courseEndTime,
      location,
      companyName,
      courseId
    }: TraineeEmailRequest = await req.json();

    console.log("Sending trainee emails for registration:", registrationId);

    // Fetch trainee data for this registration with course run details
    const { data: registrationData, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        course_runs!inner(
          title,
          start_date,
          end_date,
          start_time,
          end_time,
          location,
          courses!inner(title)
        ),
        organizations!inner(name),
        trainees(id, full_name, email)
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registrationData) {
      console.error('Error fetching registration:', regError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch registration details' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const trainees = registrationData.trainees;
    const courseRun = registrationData.course_runs;
    const organization = registrationData.organizations;

    if (!trainees || trainees.length === 0) {
      console.log('No trainees found for registration:', registrationId);
      return new Response(JSON.stringify({ success: true, message: 'No trainees to email' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${trainees.length} trainees to email`);

    // Get email template
    const template = await getEmailTemplate(courseId, 'trainee_confirmation');
    
    if (!template) {
      console.error('No email template found for trainee confirmation');
      return new Response(JSON.stringify({ error: 'No email template configured' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email to each trainee
    const emailPromises = trainees
      .filter((trainee: any) => trainee.email) // Only send to trainees with email addresses
      .map(async (trainee: any) => {
        const templateData = {
          traineeName: trainee.full_name,
          companyName: organization?.name || companyName,
          courseName: courseRun?.title || courseRun?.courses?.title || courseName,
          courseStartDate: formatDate(courseRun?.start_date || courseStartDate),
          courseEndDate: formatDate(courseRun?.end_date || courseEndDate),
          courseStartTime: formatTime(courseRun?.start_time || courseStartTime),
          courseEndTime: formatTime(courseRun?.end_time || courseEndTime),
          location: `SEMS Training Centre, Dubai Healthcare City, Dubai, United Arab Emirates (${courseRun?.location || location || 'Training Room'})`,
        };

        const { subject, html: emailHtml } = processEmailTemplate(template, templateData);

        try {
          const emailResult = await resend.emails.send({
            from: "SEMS Training <contact@sems.ae>",
            to: [trainee.email],
            subject: subject,
            html: emailHtml,
          });

          // Log successful email
          await supabase.from('email_logs').insert({
            registration_id: registrationId,
            trainee_id: trainee.id,
            email_type: 'trainee_confirmation',
            recipient_email: trainee.email,
            recipient_name: trainee.full_name,
            subject: `Course Registration Confirmation - ${courseName}`,
            status: 'sent',
            metadata: {
              company_name: companyName,
              course_name: courseName,
              course_start_date: courseStartDate,
              course_end_date: courseEndDate,
              location: location,
            }
          });

          return emailResult;
        } catch (error) {
          // Log failed email
          await supabase.from('email_logs').insert({
            registration_id: registrationId,
            trainee_id: trainee.id,
            email_type: 'trainee_confirmation',
            recipient_email: trainee.email,
            recipient_name: trainee.full_name,
            subject: `Course Registration Confirmation - ${courseName}`,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              company_name: companyName,
              course_name: courseName,
              course_start_date: courseStartDate,
              course_end_date: courseEndDate,
              location: location,
            }
          });
          throw error;
        }
      });

    const emailResults = await Promise.allSettled(emailPromises);

    // Count successful and failed emails
    const successful = emailResults.filter(result => result.status === 'fulfilled').length;
    const failed = emailResults.filter(result => result.status === 'rejected').length;

    console.log(`Trainee emails sent: ${successful} successful, ${failed} failed`);

    if (failed > 0) {
      const failedEmails = emailResults
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason);
      console.error('Failed email details:', failedEmails);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      totalEmails: trainees.length,
      successful,
      failed
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error sending trainee emails:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);