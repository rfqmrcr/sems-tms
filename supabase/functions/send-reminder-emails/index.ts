// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { generateTraineeReminderEmailHTML } from "./email-templates/trainee-reminder.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TraineeData {
  id: string;
  full_name: string;
  email: string;
  course_run_id: string;
  course_title: string;
  course_start_date: string;
  course_end_date: string;
  course_location: string;
  course_start_time: string;
  course_end_time: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting reminder email check...");

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate target date (2 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    console.log(`Looking for courses starting on: ${targetDateStr}`);

    // Get course runs starting in 2 days
    const { data: courseRuns, error: courseRunsError } = await supabase
      .from('course_runs')
      .select(`
        id,
        title,
        start_date,
        end_date,
        location,
        start_time,
        end_time,
        course:courses(title)
      `)
      .eq('start_date', targetDateStr);

    if (courseRunsError) {
      console.error("Error fetching course runs:", courseRunsError);
      throw courseRunsError;
    }

    if (!courseRuns || courseRuns.length === 0) {
      console.log("No courses starting in 2 days");
      return new Response(
        JSON.stringify({ message: "No courses starting in 2 days", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${courseRuns.length} courses starting in 2 days`);

    let totalEmailsSent = 0;

    // Process each course run
    for (const courseRun of courseRuns) {
      const course = Array.isArray(courseRun.course) ? courseRun.course[0] : courseRun.course;
      const courseId = (courseRun as any).course_id || course?.id;
      console.log(`Processing course run: ${courseRun.title || course?.title}`);

      // Get trainees for this course run who haven't received reminders yet
      const { data: trainees, error: traineesError } = await supabase
        .from('trainees')
        .select(`
          id,
          full_name,
          email,
          registration:registrations!inner(
            id,
            course_run_id
          )
        `)
        .eq('registration.course_run_id', courseRun.id)
        .not('id', 'in', `(
          SELECT trainee_id 
          FROM email_reminders 
          WHERE course_run_id = '${courseRun.id}' 
          AND reminder_type = 'course_reminder'
        )`);

      if (traineesError) {
        console.error("Error fetching trainees:", traineesError);
        continue;
      }

      if (!trainees || trainees.length === 0) {
        console.log(`No trainees to remind for course: ${courseRun.title || course?.title}`);
        continue;
      }

      console.log(`Found ${trainees.length} trainees to remind for course: ${courseRun.title || course?.title}`);

      // Get email template for reminders
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('trigger_point', 'reminder')
        .eq('is_active', true)
        .or(`course_id.eq.${courseRun.course_id},course_id.is.null`)
        .order('course_id', { ascending: false })
        .limit(1)
        .single();

      if (templateError && templateError.code !== 'PGRST116') {
        console.error("Error fetching email template:", templateError);
        continue;
      }

      const emailSubject = template?.subject || `Course Reminder: ${courseRun.title || courseRun.course?.title} - Starting in 2 Days!`;
      
      const defaultHtmlContent = `
        <h2>Course Reminder</h2>
        <p>Dear {{trainee_name}},</p>
        <p>This is a friendly reminder that your course <strong>{{course_title}}</strong> is starting in 2 days.</p>
        <p><strong>Course Details:</strong></p>
        <ul>
          <li><strong>Course:</strong> {{course_title}}</li>
          <li><strong>Date:</strong> {{start_date}} to {{end_date}}</li>
          <li><strong>Time:</strong> {{start_time}} - {{end_time}}</li>
          <li><strong>Location:</strong> {{location}}</li>
        </ul>
        <p>Please make sure to arrive on time and bring any required materials.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Training Team</p>
      `;

      const htmlContent = template?.html_content || defaultHtmlContent;

      // Send emails to trainees
      for (const trainee of trainees) {
        try {
          // Check if this is an ACLS or PALS course
          const isACLSOrPALS = courseRun.course?.title?.toLowerCase().includes('acls') || 
                              courseRun.course?.title?.toLowerCase().includes('pals') ||
                              courseRun.title?.toLowerCase().includes('acls') ||
                              courseRun.title?.toLowerCase().includes('pals');

          // Generate the HTML email content using the new template
          const emailHTML = generateTraineeReminderEmailHTML({
            courseName: courseRun.course?.title || courseRun.title || 'Course',
            venue: `SEMS Training Centre, Dubai Healthcare City, Dubai, United Arab Emirates (${courseRun.location || 'Training Room'})`,
            venueLink: 'https://maps.app.goo.gl/DubaiHealthcareCity',
            startDate: courseRun.start_date,
            endDate: courseRun.end_date || courseRun.start_date,
            startTime: courseRun.start_time || '09:00',
            endTime: courseRun.end_time || '18:00',
            traineeFullName: trainee.full_name,
            isACLSOrPALS: isACLSOrPALS
          });

          // Use the new template instead of the old one
          const personalizedSubject = emailSubject
            .replace(/{{trainee_name}}/g, trainee.full_name)
            .replace(/{{course_title}}/g, courseRun.title || courseRun.course?.title || 'Course');

          // Send email using Resend
          const emailResponse = await resend.emails.send({
            from: "SEMS Training <contact@sems.ae>",
            to: [trainee.email],
            subject: personalizedSubject,
            html: emailHTML,
          });

          if (emailResponse.error) {
            console.error(`Failed to send email to ${trainee.email}:`, emailResponse.error);
            
            // Log the failed email
            await supabase.from('email_logs').insert({
              email_type: 'reminder',
              recipient_email: trainee.email,
              recipient_name: trainee.full_name,
              subject: personalizedSubject,
              status: 'failed',
              error_message: emailResponse.error?.message || 'Failed to send email',
              course_run_id: courseRun.id,
              trainee_id: trainee.id,
              template_used: template?.name || 'Default Reminder Template',
              metadata: {
                course_title: courseRun.title || courseRun.course?.title,
                start_date: courseRun.start_date,
                location: courseRun.location
              }
            });
            
            continue;
          }

          // Log the successful email
          await supabase.from('email_logs').insert({
            email_type: 'reminder',
            recipient_email: trainee.email,
            recipient_name: trainee.full_name,
            subject: personalizedSubject,
            status: 'sent',
            course_run_id: courseRun.id,
            trainee_id: trainee.id,
            template_used: template?.name || 'Default Reminder Template',
            metadata: {
              course_title: courseRun.title || courseRun.course?.title,
              start_date: courseRun.start_date,
              location: courseRun.location
            }
          });

          console.log(`Email sent successfully to ${trainee.email}`);

          // Record that we sent the reminder
          const { error: reminderError } = await supabase
            .from('email_reminders')
            .insert({
              trainee_id: trainee.id,
              course_run_id: courseRun.id,
              reminder_type: 'course_reminder'
            });

          if (reminderError) {
            console.error("Error recording reminder:", reminderError);
          }

          totalEmailsSent++;

        } catch (emailError) {
          console.error(`Error sending email to ${trainee.email}:`, emailError);
          
          // Log the failed email
          await supabase.from('email_logs').insert({
            email_type: 'reminder',
            recipient_email: trainee.email,
            recipient_name: trainee.full_name,
            subject: personalizedSubject || 'Course Reminder',
            status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
            course_run_id: courseRun.id,
            trainee_id: trainee.id,
            template_used: template?.name || 'Default Reminder Template',
            metadata: {
              course_title: courseRun.title || courseRun.course?.title,
              start_date: courseRun.start_date,
              location: courseRun.location
            }
          });
        }
      }
    }

    console.log(`Reminder email process completed. Total emails sent: ${totalEmailsSent}`);

    return new Response(
      JSON.stringify({ 
        message: "Reminder emails processed successfully", 
        emailsSent: totalEmailsSent,
        coursesProcessed: courseRuns.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-reminder-emails function:", error);
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