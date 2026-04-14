-- Insert a trainee confirmation email template
INSERT INTO email_templates (
  name,
  subject,
  html_content,
  course_id,
  registration_type,
  trigger_point,
  is_active,
  include_quotation,
  attachment_urls,
  cc_emails
) VALUES (
  'Trainee Confirmation Email',
  'Course Registration Confirmation - {courseName}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Course Registration Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #1a5490; margin: 0 0 10px 0;">Course Registration Confirmation</h1>
  </div>
  
  <p>Dear {traineeName},</p>
  
  <p>We are pleased to inform you that you have been successfully registered by <strong>{companyName}</strong> for the following course:</p>
  
  <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h2 style="color: #1565c0; margin: 0 0 15px 0;">{courseName}</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📅 Start Date:</td>
        <td style="padding: 8px 0;">{courseStartDate} at {courseStartTime}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📅 End Date:</td>
        <td style="padding: 8px 0;">{courseEndDate} at {courseEndTime}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">📍 Location:</td>
        <td style="padding: 8px 0;">{location}</td>
      </tr>
    </table>
  </div>
  
  <p><strong>Important:</strong> Please ensure you attend all sessions as scheduled. If you have any questions or need to make changes to your registration, please contact your organization''s training coordinator.</p>
  
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
  NULL,
  NULL,
  'trainee_confirmation',
  true,
  false,
  NULL,
  NULL
);