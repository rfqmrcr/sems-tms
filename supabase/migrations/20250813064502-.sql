-- Create cron job to run reminder emails daily at 10 AM
SELECT cron.schedule(
  'send-course-reminders',
  '0 10 * * *', -- Daily at 10:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://hnoxzvaugjkoydkfxroy.supabase.co/functions/v1/send-reminder-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhub3h6dmF1Z2prb3lka2Z4cm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDEwOTMsImV4cCI6MjA2NTI3NzA5M30.oPmez66G3l4I93UHuwpn4VdSIaJGPh3ocv_mmeRhlTA"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- Insert default email template for course reminders
INSERT INTO public.email_templates (
  name,
  subject,
  html_content,
  trigger_point,
  is_active,
  include_quotation
) VALUES (
  'Course Reminder - 2 Days Before',
  'Course Reminder: {{course_title}} - Starting in 2 Days!',
  '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2563eb;">Course Reminder</h2>
    <p>Dear {{trainee_name}},</p>
    
    <p>This is a friendly reminder that your course <strong>{{course_title}}</strong> is starting in <strong>2 days</strong>.</p>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1e40af; margin-top: 0;">Course Details:</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 8px 0;"><strong>📚 Course:</strong> {{course_title}}</li>
        <li style="margin: 8px 0;"><strong>📅 Date:</strong> {{start_date}} to {{end_date}}</li>
        <li style="margin: 8px 0;"><strong>🕘 Time:</strong> {{start_time}} - {{end_time}}</li>
        <li style="margin: 8px 0;"><strong>📍 Location:</strong> {{location}}</li>
      </ul>
    </div>
    
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h4 style="color: #92400e; margin-top: 0;">Important Reminders:</h4>
      <ul style="margin: 10px 0;">
        <li>Please arrive 15 minutes early for registration</li>
        <li>Bring a valid photo ID</li>
        <li>Bring any required materials or equipment</li>
        <li>Dress appropriately for the training</li>
      </ul>
    </div>
    
    <p>If you have any questions or need to make changes to your registration, please contact us as soon as possible.</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>Training Team</strong>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="font-size: 12px; color: #6b7280;">
      This is an automated reminder email. Please do not reply to this email.
    </p>
  </div>',
  'reminder',
  true,
  false
);