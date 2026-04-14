-- Create tax_settings table for configurable tax rates
CREATE TABLE public.tax_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_rate numeric NOT NULL DEFAULT 6,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for tax settings
CREATE POLICY "Enable all operations for tax_settings" 
ON public.tax_settings 
FOR ALL 
USING (true);

-- Insert default tax rate
INSERT INTO public.tax_settings (tax_rate, is_active) VALUES (6, true);

-- Update the existing "Trainee Confirmation Email" template to be a proper contact person template
UPDATE public.email_templates 
SET 
  name = 'HRDC Contact Person Confirmation',
  subject = 'Course Registration Confirmation - {courseName} (HRDC)',
  html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Course Registration Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #1a5490; margin: 0 0 10px 0;">Course Registration Confirmation</h1>
  </div>
  
  <p>Dear {contactName},</p>
  
  <p>We are pleased to confirm your HRDC course registration for <strong>{companyName}</strong>. Please find the details below:</p>
  
  <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h2 style="color: #1565c0; margin: 0 0 15px 0;">{courseName}</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📅 Start Date:</td>
        <td style="padding: 8px 0;">{courseStartDate}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📅 End Date:</td>
        <td style="padding: 8px 0;">{courseEndDate}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">👥 Participants:</td>
        <td style="padding: 8px 0;">{participantCount} people</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">💰 Total Amount:</td>
        <td style="padding: 8px 0;">{totalAmount}</td>
      </tr>
    </table>
  </div>

  <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
    <h3 style="color: #856404; margin: 0 0 10px 0;">📋 Registered Participants:</h3>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
      <tr style="background-color: #555; color: white;">
        <th style="border: 1px solid #000; padding: 6px; text-align: left;">No.</th>
        <th style="border: 1px solid #000; padding: 6px; text-align: left;">Name</th>
        <th style="border: 1px solid #000; padding: 6px; text-align: left;">NRIC</th>
        <th style="border: 1px solid #000; padding: 6px; text-align: left;">Email</th>
      </tr>
      {traineeRows}
    </table>
  </div>
  
  <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
    <h3 style="color: #155724; margin: 0 0 10px 0;">📎 HRDC Documentation</h3>
    <p style="margin: 5px 0;">The following HRDC documents are attached to this email:</p>
    <ul style="margin: 10px 0;">
      <li>Course quotation with breakdown</li>
      <li>Course agenda and curriculum</li>
      <li>Trainer profiles and qualifications</li>
      <li>HRDC compliance documentation</li>
    </ul>
  </div>

  <p><strong>Next Steps:</strong></p>
  <ul>
    <li>Review the attached quotation and documentation</li>
    <li>Proceed with payment if everything is satisfactory</li>
    <li>Contact us if you have any questions</li>
  </ul>
  
  <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>1Accelerate Training Team</strong><br>
      Email: contact@1acceleratesb.com<br>
      Registration ID: {registrationId}
    </p>
  </div>
</body>
</html>',
  include_quotation = true,
  include_course_agenda = true,
  include_trainer_profile = true,
  include_course_content = true,
  registration_type = 'corporate',
  trigger_point = 'registration'
WHERE id = '72646342-b92a-4852-9d50-1281e6395189';

-- Create a proper trainee confirmation email template
INSERT INTO public.email_templates (
  name,
  subject,
  html_content,
  registration_type,
  trigger_point,
  include_quotation,
  include_course_agenda,
  include_trainer_profile,
  include_course_content,
  is_active
) VALUES (
  'Trainee Course Confirmation',
  'Welcome to {courseName} - Course Details',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Course Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #1a5490; margin: 0 0 10px 0;">Welcome to Your Course!</h1>
  </div>
  
  <p>Dear {traineeName},</p>
  
  <p>You have been registered by <strong>{companyName}</strong> for the following course:</p>
  
  <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h2 style="color: #1565c0; margin: 0 0 15px 0;">{courseName}</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📅 Start:</td>
        <td style="padding: 8px 0;">{courseStartDate} at {courseStartTime}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📅 End:</td>
        <td style="padding: 8px 0;">{courseEndDate} at {courseEndTime}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📍 Location:</td>
        <td style="padding: 8px 0;">{location}</td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="color: #856404; margin: 0 0 10px 0;">📋 Important Reminders:</h3>
    <ul style="margin: 10px 0;">
      <li>Please arrive 15 minutes early for registration</li>
      <li>Bring a valid photo ID for verification</li>
      <li>Attendance is mandatory for certification</li>
      <li>Contact your HR department for any changes</li>
    </ul>
  </div>
  
  <p>We look forward to seeing you at the training!</p>
  
  <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>1Accelerate Training Team</strong><br>
      Email: contact@1acceleratesb.com
    </p>
  </div>
</body>
</html>',
  'corporate',
  'trainee_confirmation',
  false,
  false,
  false,
  false,
  true
);