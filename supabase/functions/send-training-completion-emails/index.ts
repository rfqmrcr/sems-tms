// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check if emails should be sent (1 day after training end)
const shouldSendTrainingCompletionEmail = (endDate: string): boolean => {
  const courseEndDate = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  courseEndDate.setHours(0, 0, 0, 0);
  
  // Add 1 day to course end date
  const targetDate = new Date(courseEndDate);
  targetDate.setDate(targetDate.getDate() + 1);
  
  return today.getTime() === targetDate.getTime();
};

const sendTrainingCompletionEmail = async (registrationId: string) => {
  try {
    console.log(`Processing training completion email for registration: ${registrationId}`);
    
    // Fetch registration details with course and organization info
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        organizations (
          name,
          address,
          contact_person,
          contact_email,
          contact_number
        ),
        course_runs (
          id,
          title,
          start_date,
          end_date,
          location,
          courses (
            title,
            description
          )
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('Error fetching registration:', regError);
      return { success: false, error: 'Registration not found' };
    }

    // Check if we should send the email based on the date
    if (!shouldSendTrainingCompletionEmail(registration.course_runs.end_date)) {
      console.log('Not the right date to send training completion email');
      return { success: false, error: 'Not the correct date for training completion email' };
    }

    // Fetch email template for training completion
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('trigger_point', 'training_completion')
      .eq('is_active', true)
      .or(`course_id.is.null,course_id.eq.${registration.course_id}`)
      .order('course_id', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    if (templateError || !template) {
      console.error('No training completion email template found:', templateError);
      return { success: false, error: 'No email template found' };
    }

    // Process template variables
    const courseName = registration.course_runs.title || registration.course_runs.courses.title || 'Course';
    const companyName = registration.organizations.name;
    const contactName = registration.contact_person;
    
    let emailSubject = template.subject;
    let emailContent = template.html_content;

    // Replace variables in subject and content
    const variables = {
      '{contactName}': contactName,
      '{courseName}': courseName,
      '{companyName}': companyName,
      '{courseStartDate}': new Date(registration.course_runs.start_date).toLocaleDateString(),
      '{courseEndDate}': new Date(registration.course_runs.end_date).toLocaleDateString(),
      '{grantId}': registration.grant_id || 'N/A',
    };

    Object.entries(variables).forEach(([key, value]) => {
      emailSubject = emailSubject.replace(new RegExp(key, 'g'), value);
      emailContent = emailContent.replace(new RegExp(key, 'g'), value);
    });

    // Prepare attachments
    const attachments = [];
    
    // Add attendance file if available
    if (registration.attendance_file_url) {
      attachments.push({
        filename: 'attendance_form.pdf',
        path: registration.attendance_file_url,
      });
    }
    
    // Add JD14 form if available
    if (registration.jd14_form_file_url) {
      attachments.push({
        filename: 'jd14_form.pdf',
        path: registration.jd14_form_file_url,
      });
    }

    // Send email using Resend
    const emailData: any = {
      from: 'SEMS Training <contact@sems.ae>',
      to: [registration.contact_email],
      subject: emailSubject,
      html: emailContent,
    };

    // Add CC emails if specified in template
    if (template.cc_emails && template.cc_emails.length > 0) {
      emailData.cc = template.cc_emails;
    }

    // Add attachments if any
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const { data: emailResult, error: emailError } = await resend.emails.send(emailData);

    if (emailError) {
      console.error('Error sending training completion email:', emailError);
      throw emailError;
    }

    console.log('Training completion email sent successfully:', emailResult);

    // Log the email
    await supabase.from('email_logs').insert({
      registration_id: registrationId,
      course_run_id: registration.course_run_id,
      email_type: 'training_completion',
      recipient_email: registration.contact_email,
      recipient_name: contactName,
      subject: emailSubject,
      status: 'sent',
      template_used: template.id,
      metadata: {
        attachments: attachments.map(a => a.filename),
        grant_id: registration.grant_id,
      }
    });

    return { 
      success: true, 
      emailId: emailResult?.id,
      attachmentCount: attachments.length 
    };

  } catch (error) {
    console.error('Error in sendTrainingCompletionEmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId, courseRunIds } = await req.json();
    
    if (registrationId) {
      // Send for specific registration
      const result = await sendTrainingCompletionEmail(registrationId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400,
      });
    } else if (courseRunIds && Array.isArray(courseRunIds)) {
      // Send for all registrations in specified course runs that are due
      const results = [];
      
      for (const courseRunId of courseRunIds) {
        // Fetch all registrations for this course run
        const { data: registrations, error } = await supabase
          .from('registrations')
          .select('id, course_runs!inner(end_date)')
          .eq('course_run_id', courseRunId)
          .eq('status', 'confirmed');

        if (error) {
          console.error('Error fetching registrations for course run:', error);
          continue;
        }

        for (const registration of registrations) {
          const endDate = Array.isArray(registration.course_runs) 
            ? registration.course_runs[0]?.end_date 
            : registration.course_runs?.end_date;
          if (shouldSendTrainingCompletionEmail(endDate)) {
            const result = await sendTrainingCompletionEmail(registration.id);
            results.push({ registrationId: registration.id, result });
          }
        }
      }
      
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      // Fetch all course runs that ended yesterday and send emails
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const { data: courseRuns, error } = await supabase
        .from('course_runs')
        .select('id')
        .eq('end_date', yesterdayStr);

      if (error) {
        throw error;
      }

      const results = [];
      
      for (const courseRun of courseRuns) {
        const { data: registrations, error: regError } = await supabase
          .from('registrations')
          .select('id')
          .eq('course_run_id', courseRun.id)
          .eq('status', 'confirmed');

        if (regError) {
          console.error('Error fetching registrations:', regError);
          continue;
        }

        for (const registration of registrations) {
          const result = await sendTrainingCompletionEmail(registration.id);
          results.push({ registrationId: registration.id, result });
        }
      }

      return new Response(JSON.stringify({ 
        message: 'Training completion emails processed',
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error in send-training-completion-emails:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});