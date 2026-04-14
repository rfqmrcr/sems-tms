import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';
import { RegistrationData } from './types.ts';
import { generateEmailContent } from './email-template.ts';
import { generateCourseAgenda } from './course-agenda.ts';

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

// Helper function to generate quotation for HRDC registrations
const generateQuotationForHRDC = async (registrationId: string, companyName: string) => {
  try {
    // Get registration details to calculate amounts
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        course_runs!inner(price, title),
        trainees(id)
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      throw new Error(`Failed to fetch registration: ${regError?.message}`);
    }

    // Calculate amounts
    const coursePrice = registration.course_runs?.price || 0;
    const participantCount = registration.trainees?.length || 1;
    const subtotal = coursePrice * participantCount;
    
    // Get tax settings from database
    const { data: taxSettings } = await supabase
      .from('tax_settings')
      .select('tax_rate')
      .eq('is_active', true)
      .single();
    
    const taxRate = taxSettings?.tax_rate || 8;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Generate quotation number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const { data: quotations } = await supabase
      .from('quotations')
      .select('id')
      .gte('created_at', `${year}-${month}-01`)
      .lt('created_at', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`);
      
    const count = (quotations?.length || 0) + 1;
    const quotationNumber = `QUO-${year}${month}-${count.toString().padStart(3, '0')}`;
    
    // Calculate valid until date (30 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    // Create quotation
    const { data: quotation, error } = await supabase
      .from('quotations')
      .insert({
        registration_id: registrationId,
        quotation_number: quotationNumber,
        issue_date: now.toISOString().split('T')[0],
        valid_until: validUntil.toISOString().split('T')[0],
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending',
        notes: `Quotation for ${registration.course_runs?.title || 'course registration'} - HRDC Grant Application`
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quotation: ${error.message}`);
    }

    // Generate quotation PDF content
    const doc = new jsPDF();
    
    // Set up fonts and colors
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', 105, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('1Accelerate Training Sdn Bhd', 105, 35, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Training Provider | HRDC Approved', 105, 42, { align: 'center' });
    
    // Bill To and Quotation Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(companyName, 20, 68);
    
    // Right side - quotation details
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation #:', 130, 60);
    doc.text('Issue Date:', 130, 68);
    doc.text('Valid Until:', 130, 76);
    
    doc.setFont('helvetica', 'normal');
    doc.text(quotationNumber, 160, 60);
    doc.text(now.toLocaleDateString(), 160, 68);
    doc.text(validUntil.toLocaleDateString(), 160, 76);
    
    // Table headers
    const startY = 90;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Draw table border and headers
    doc.rect(20, startY, 170, 10); // Header row
    doc.line(20, startY, 190, startY); // Top border
    doc.line(20, startY + 10, 190, startY + 10); // Bottom of header
    doc.line(20, startY, 20, startY + 50); // Left border
    doc.line(190, startY, 190, startY + 50); // Right border
    
    // Column dividers
    doc.line(100, startY, 100, startY + 50);
    doc.line(130, startY, 130, startY + 50);
    doc.line(160, startY, 160, startY + 50);
    
    // Header text
    doc.text('Description', 22, startY + 7);
    doc.text('Participants', 102, startY + 7);
    doc.text('Unit Price (RM)', 132, startY + 7);
    doc.text('Total (RM)', 162, startY + 7);
    
    // Course data row
    doc.setFont('helvetica', 'normal');
    const courseTitle = registration.course_runs?.title || 'Training Course';
    doc.text(courseTitle.length > 35 ? courseTitle.substring(0, 32) + '...' : courseTitle, 22, startY + 17);
    doc.text(participantCount.toString(), 112, startY + 17);
    doc.text(coursePrice.toFixed(2), 142, startY + 17);
    doc.text(subtotal.toFixed(2), 172, startY + 17);
    
    // Draw row separator
    doc.line(20, startY + 20, 190, startY + 20);
    
    // Subtotal row
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 150, startY + 30);
    doc.text('RM ' + subtotal.toFixed(2), 172, startY + 30);
    
    // Draw row separator
    doc.line(20, startY + 32, 190, startY + 32);
    
    // Tax row
    doc.text(`SST (${taxRate}%):`, 150, startY + 42);
    doc.text('RM ' + taxAmount.toFixed(2), 172, startY + 42);
    
    // Draw row separator
    doc.line(20, startY + 44, 190, startY + 44);
    
    // Total row
    doc.setFontSize(12);
    doc.text('TOTAL:', 150, startY + 54);
    doc.text('RM ' + totalAmount.toFixed(2), 172, startY + 54);
    
    // Bottom border
    doc.line(20, startY + 56, 190, startY + 56);
    
    // Terms & Conditions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, 170);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const terms = [
      '• This quotation is valid for 30 days from the issue date.',
      '• Payment terms: Net 30 days from invoice date.',
      '• This quotation is for HRDC Grant Application purposes.',
      '• All prices are in Dubai Dirham (AED).',
      '• SST registration number: [To be filled]'
    ];
    
    terms.forEach((term, index) => {
      doc.text(term, 20, 180 + (index * 8));
    });
    
    // Convert PDF to base64 for email attachment
    const pdfBuffer = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    return { quotation, quotationPdf: pdfBase64, quotationNumber };
  } catch (error) {
    console.error('Error generating quotation:', error);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Handle registration object format (from webhook)
    let contactName, contactEmail, companyName, courseName, courseStartDate, courseEndDate;
    let participantCount, hrdfGrant, coursePrice, totalAmount, quotationNumber, registrationId, courseId;
    let emailType = 'confirmation';
    let paymentLink;
    
    // If only registrationId is provided, fetch the full registration data
    if (body.registrationId && !body.registration && !body.contactEmail) {
      console.log("Fetching registration data for ID:", body.registrationId);
      
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select(`
          *,
          organizations!inner(name),
          course_runs!inner(
            id,
            title,
            start_date,
            end_date,
            price,
            courses!inner(id, title)
          ),
          trainees(full_name, nric, email)
        `)
        .eq('id', body.registrationId)
        .single();
      
      if (regError || !regData) {
        console.error('Error fetching registration:', regError);
        throw new Error('Registration not found');
      }
      
      contactName = regData.contact_person;
      contactEmail = regData.contact_email;
      companyName = regData.organizations?.name || 'Self Sponsored';
      courseName = regData.course_runs?.title || regData.course_runs?.courses?.title || 'Course';
      courseStartDate = regData.course_runs?.start_date || '';
      courseEndDate = regData.course_runs?.end_date || '';
      participantCount = regData.trainees?.length || 0;
      hrdfGrant = regData.hrdf_grant || false;
      coursePrice = regData.course_runs?.price || 0;
      totalAmount = regData.payment_amount || (coursePrice * participantCount);
      registrationId = regData.id;
      courseId = regData.course_runs?.courses?.id || regData.course_id;
      emailType = body.emailType || 'confirmation';
      paymentLink = body.paymentLink;
      
      console.log("Fetched registration data:", { contactName, contactEmail, companyName, courseName });
    } else if (body.registration) {
      // Parse registration object
      const reg = body.registration;
      const org = reg.organization;
      const course = reg.course;
      const courseRun = reg.course_run;
      
      contactName = reg.contact_person;
      contactEmail = reg.contact_email;
      companyName = org?.name || 'Self Sponsored';
      courseName = courseRun?.title || course?.title || 'Course';
      courseStartDate = courseRun?.start_date || '';
      courseEndDate = courseRun?.end_date || '';
      participantCount = reg.trainees?.length || 0;
      hrdfGrant = reg.hrdf_grant || false;
      coursePrice = courseRun?.price || 0;
      totalAmount = reg.payment_amount || (coursePrice * participantCount);
      quotationNumber = reg.quotation_number || '';
      registrationId = reg.id;
      courseId = reg.course_id;
      emailType = body.emailType || 'confirmation';
      paymentLink = body.paymentLink;
    } else {
      // Parse individual fields format
      ({ 
        contactName, 
        contactEmail, 
        companyName, 
        courseName, 
        courseStartDate, 
        courseEndDate, 
        participantCount,
        hrdfGrant,
        coursePrice,
        totalAmount,
        quotationNumber,
        registrationId,
        courseId,
        emailType = 'confirmation',
        paymentLink
      } = body);
    }

    console.log("Sending registration email to:", contactEmail, "Type:", emailType);
    console.log("Email data:", { contactName, companyName, courseName, participantCount, emailType });

    // Fetch trainee data for this registration
    const { data: traineesData, error: traineesError } = await supabase
      .from('trainees')
      .select('full_name, nric, email')
      .eq('registration_id', registrationId || '');

    if (traineesError) {
      console.error('Error fetching trainees:', traineesError);
    }

    // Determine registration type
    let registrationType = 'individual';
    if (companyName && companyName !== 'Self Sponsored') {
      registrationType = hrdfGrant ? 'hrdf' : 'corporate';
    }

    // Try to get email template
    let emailSubject = emailType === 'reservation'
      ? `🎓 Course Reservation Confirmed - ${courseName}`
      : emailType === 'payment_failed'
      ? `⚠️ Registration Received - Payment Pending for ${courseName}`
      : emailType === 'abandoned_cart'
      ? `⏰ Complete Your Registration for ${courseName}`
      : `✅ Registration Confirmed: ${courseName}`;
      
    let emailHtml = generateEmailContent({
      contactName, 
      contactEmail, 
      companyName, 
      courseName, 
      courseStartDate, 
      courseEndDate, 
      participantCount,
      hrdfGrant,
      coursePrice,
      totalAmount,
      quotationNumber,
      registrationId
    });

    // Add payment failed message to default email if applicable
    if (emailType === 'payment_failed') {
      emailHtml = `
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 20px;">
          <h3 style="color: #92400E; margin: 0 0 8px 0;">⚠️ Payment Not Received</h3>
          <p style="color: #92400E; margin: 0;">
            We have received your registration for <strong>${courseName}</strong>, but your payment could not be processed.
          </p>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0;">Registration Details:</h4>
          <p style="margin: 4px 0;"><strong>Registration ID:</strong> ${registrationId}</p>
          <p style="margin: 4px 0;"><strong>Course:</strong> ${courseName}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${courseStartDate}${courseEndDate ? ' to ' + courseEndDate : ''}</p>
          <p style="margin: 4px 0;"><strong>Participants:</strong> ${participantCount}</p>
          <p style="margin: 4px 0;"><strong>Total Amount:</strong> RM ${(totalAmount || 0).toFixed(2)}</p>
        </div>
        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px;">
          <h4 style="margin: 0 0 8px 0;">What's Next?</h4>
          <p style="margin: 4px 0;">Your registration has been saved, and your spot is reserved. To complete your registration, please:</p>
          <ol style="margin: 8px 0; padding-left: 20px;">
            <li>Contact us to arrange payment</li>
            <li>Or retry payment using the link below</li>
          </ol>
          ${paymentLink ? `<p style="margin: 16px 0;"><a href="${paymentLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Retry Payment</a></p>` : ''}
        </div>
        ${emailHtml}
      `;
    } else if (emailType === 'abandoned_cart') {
      emailHtml = `
        <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 20px;">
          <h3 style="color: #92400E; margin: 0 0 8px 0;">⏰ Complete Your Registration</h3>
          <p style="color: #92400E; margin: 0;">
            Hi ${contactName}, we noticed you started registering for <strong>${courseName}</strong> but didn't complete the process.
          </p>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0;">Course Details:</h4>
          <p style="margin: 4px 0;"><strong>Course:</strong> ${courseName}</p>
          <p style="margin: 4px 0;"><strong>Start Date:</strong> ${courseStartDate}</p>
          ${courseEndDate ? `<p style="margin: 4px 0;"><strong>End Date:</strong> ${courseEndDate}</p>` : ''}
          <p style="margin: 4px 0;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin: 4px 0;"><strong>Participants:</strong> ${participantCount}</p>
          ${totalAmount ? `<p style="margin: 4px 0;"><strong>Total Amount:</strong> RM ${totalAmount.toFixed(2)}</p>` : ''}
        </div>
        <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="font-size: 18px; font-weight: bold; margin: 0 0 12px 0; color: #92400E;">🎯 Your Spot is Waiting!</p>
          <p style="margin: 0 0 16px 0;">Spaces are limited and filling up fast. Complete your registration now to secure your place.</p>
          ${paymentLink ? `<a href="${paymentLink}" style="background-color: #16A34A; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Complete Registration & Payment</a>` : ''}
        </div>
        <div style="margin-top: 20px; padding: 16px; background-color: #F9FAFB; border-radius: 8px;">
          <p style="margin: 0; color: #6B7280; font-size: 14px;">
            If you have any questions or need assistance, please contact us at <a href="mailto:contact@sems.ae" style="color: #2563EB;">contact@sems.ae</a>
          </p>
        </div>
        ${emailHtml}
      `;
    }

    let template = null;
    const triggerPoint = emailType === 'payment_failed' ? 'payment_failed' : emailType === 'abandoned_cart' ? 'abandoned_cart' : 'registration';
    
    try {
      // Fetch email template
      const { data: templates } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .eq('trigger_point', triggerPoint)
        .or(`course_id.eq.${courseId},course_id.is.null`)
        .or(`registration_type.eq.${registrationType},registration_type.is.null`)
        .order('course_id', { ascending: false, nullsFirst: false })
        .order('registration_type', { ascending: false, nullsFirst: false })
        .limit(1);

      if (templates && templates.length > 0) {
        template = templates[0];
        
        // Generate trainee table rows
        const generateTraineeRows = (trainees: any[] = []): string => {
          if (!trainees || trainees.length === 0) {
            return '<tr><td style="border:1px solid #000; padding:6px; text-align:center;" colspan="3">No trainees registered</td></tr>';
          }
          
          return trainees.map((trainee, index) => {
            const email = trainee.email?.trim() || '-';
            const emailCell = email === '-' ? '-' : `<a href="mailto:${email}" style="color:#3498db; text-decoration:none;">${email}</a>`;
            
            return `
            <tr>
              <td style="border:1px solid #000; padding:6px;">${index + 1}</td>
              <td style="border:1px solid #000; padding:6px;">${trainee.full_name || '-'}</td>
              <td style="border:1px solid #000; padding:6px;">${emailCell}</td>
            </tr>
          `;
          }).join('');
        };

        // Process template variables
        const replacements: { [key: string]: string } = {
          '{contactName}': contactName,
          '{contactEmail}': contactEmail,
          '{companyName}': companyName,
          '{courseName}': courseName,
          '{courseStartDate}': courseStartDate || '',
          '{courseEndDate}': courseEndDate || '',
          '{participantCount}': participantCount.toString(),
          '{hrdfGrant}': hrdfGrant ? 'Yes' : 'No',
          '{coursePrice}': `RM ${(coursePrice || 0).toFixed(2)}`,
          '{totalAmount}': `RM ${(totalAmount || 0).toFixed(2)}`,
          '{quotationNumber}': quotationNumber || '',
          '{registrationId}': registrationId || '',
          '{traineeRows}': generateTraineeRows(traineesData || []),
          '{paymentLink}': paymentLink || '',
          '{paymentStatus}': emailType === 'payment_failed' ? 'Payment Failed - Pending' : 'Confirmed',
        };

        emailSubject = template.subject;
        emailHtml = template.html_content;

        // Replace variables
        Object.entries(replacements).forEach(([placeholder, value]) => {
          const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          emailSubject = emailSubject.replace(regex, value);
          emailHtml = emailHtml.replace(regex, value);
        });

        console.log("Using email template:", template.name);
      } else {
        console.log("No template found, using default email");
      }
    } catch (templateError) {
      console.error("Error fetching email template:", templateError);
      console.log("Falling back to default email");
    }

    // Prepare attachments array
    const attachments = [];

    // Generate quotation for HRDC registrations
    if ((hrdfGrant || template?.include_quotation) && registrationId) {
      try {
        console.log("Generating PDF quotation for registration:", registrationId);
        const { quotation, quotationPdf, quotationNumber: generatedQuotationNumber } = await generateQuotationForHRDC(registrationId, companyName);
        
        attachments.push({
          filename: `Quotation_${generatedQuotationNumber}.pdf`,
          content: quotationPdf,
          type: "application/pdf",
        });
        
        // Update email content to mention quotation
        emailHtml += `
          <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-top: 0;">Quotation Attached</h3>
            <p>A quotation (${generatedQuotationNumber}) has been generated and is attached to this email as a PDF.</p>
            ${hrdfGrant ? '<p>Please use this quotation for your HRDC grant application process.</p>' : ''}
          </div>
        `;
        
        console.log("PDF quotation generated successfully:", generatedQuotationNumber);
      } catch (quotationError) {
        console.error("Error generating quotation:", quotationError);
      }
    }

    // Generate course agenda if template requires it
    if (template?.include_course_agenda && courseId && registrationId) {
      try {
        console.log("Generating course agenda for registration:", registrationId);
        const { agendaPdf } = await generateCourseAgenda(
          registrationId, 
          courseId, 
          courseName, 
          courseStartDate, 
          courseEndDate || ''
        );
        
        attachments.push({
          filename: `Course_Agenda_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          content: agendaPdf,
          type: "application/pdf",
        });

        // Update email content to mention agenda
        emailHtml += `
          <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Course Agenda Attached</h3>
            <p>The detailed course agenda with schedules and trainer information is attached to this email as a PDF.</p>
            <p>Please review the agenda and contact us if you have any questions about the course content.</p>
          </div>
        `;
        
        console.log("Course agenda PDF generated successfully");
      } catch (agendaError) {
        console.error("Error generating course agenda:", agendaError);
      }
    }

    // Attach trainer profile if template requires it
    if (template?.include_trainer_profile && registrationId) {
      try {
        // First get the course run to find the trainer
        const { data: courseRunData, error: courseRunError } = await supabase
          .from('course_runs')
          .select('trainer_id')
          .eq('id', (await supabase
            .from('registrations')
            .select('course_run_id')
            .eq('id', registrationId)
            .single()
          ).data?.course_run_id)
          .single();

        if (courseRunError || !courseRunData?.trainer_id) {
          console.log("No trainer found for this course run");
          throw new Error("No trainer assigned to this course run");
        }

        console.log("Fetching trainer profile for trainer:", courseRunData.trainer_id);
        const { data: trainerData, error: trainerError } = await supabase
          .from('trainers')
          .select('full_name, resume_url')
          .eq('id', courseRunData.trainer_id)
          .single();

        if (trainerError) throw trainerError;

        if (trainerData && trainerData.resume_url) {
          // Download the resume file from storage
          const { data: resumeFile, error: downloadError } = await supabase.storage
            .from('trainer-resumes')
            .download(trainerData.resume_url);

          if (downloadError) throw downloadError;

          // Convert file to base64
          const resumeBuffer = await resumeFile.arrayBuffer();
          const resumeBase64 = btoa(String.fromCharCode(...new Uint8Array(resumeBuffer)));

          attachments.push({
            filename: `Trainer_Profile_${trainerData.full_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            content: resumeBase64,
            type: "application/pdf",
          });

          // Update email content to mention trainer profile
          emailHtml += `
            <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Trainer Profile Attached</h3>
              <p>The detailed profile and resume for <strong>${trainerData.full_name}</strong> is attached to this email.</p>
              <p>Please review the trainer's qualifications and experience.</p>
            </div>
          `;
          
        console.log("Trainer profile attached successfully for:", trainerData.full_name);
      }
    } catch (trainerError) {
      console.error("Error attaching trainer profile:", trainerError);
    }
  }

  // Attach course content if template requires it
  if (template?.include_course_content && courseId) {
    try {
      // Get the course to find the course content URL
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('course_content_url, title')
        .eq('id', courseId)
        .single();

      if (courseError || !courseData?.course_content_url) {
        console.log("No course content found for this course");
      } else {
        // Download the course content file from storage
        const { data: courseContentData, error: downloadError } = await supabase.storage
          .from('course-content')
          .download(courseData.course_content_url);

        if (downloadError) {
          console.error("Error downloading course content:", downloadError);
        } else {
          // Convert blob to base64
          const arrayBuffer = await courseContentData.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          attachments.push({
            filename: `Course_Content_${courseData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            content: base64Content,
            type: "application/pdf",
          });

          // Update email content to mention course content
          emailHtml += `
            <div style="margin-top: 30px; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #2196f3;">
              <h3 style="color: #2196f3; margin-top: 0;">Course Content Attached</h3>
              <p>The detailed course content is attached to this email as a PDF for your reference.</p>
              <p>Please review the content and contact us if you have any questions.</p>
            </div>
          `;
          
          console.log("Course content PDF attached successfully");
        }
      }
    } catch (courseContentError) {
      console.error("Error attaching course content:", courseContentError);
    }
  }

    // For reservation emails, add payment information section
    if (emailType === 'reservation' && registrationId) {
      const paymentSection = `
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h2 style="color: #856404; margin-top: 0; font-size: 20px;">⚠️ Payment Required to Confirm Registration</h2>
          <p style="color: #856404; margin-bottom: 15px; font-size: 16px;">Your training slots have been reserved. Please complete payment before the course start date to confirm your registration.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #635BFF; margin-top: 0; font-size: 18px;">💳 Option 1: Online Payment via Stripe</h3>
            ${paymentLink ? `
              <p style="margin: 15px 0;">
                <a href="${paymentLink}" style="display: inline-block; background-color: #635BFF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Pay Now Securely</a>
              </p>
              <p style="color: #666; font-size: 14px; margin: 10px 0;">Or copy this link: <br/><a href="${paymentLink}" style="color: #635BFF; word-break: break-all;">${paymentLink}</a></p>
            ` : '<p style="color: #856404;">Payment link will be provided separately.</p>'}
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #2196f3; margin-top: 0; font-size: 18px;">🏦 Option 2: Bank Transfer</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; font-weight: bold; color: #333;">Bank Name:</td>
                <td style="padding: 10px 0; color: #666;">[Your Bank Name]</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; font-weight: bold; color: #333;">Account Name:</td>
                <td style="padding: 10px 0; color: #666;">SEMS Training</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; font-weight: bold; color: #333;">Account Number:</td>
                <td style="padding: 10px 0; color: #666;">[Your Account Number]</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #333;">Reference Number:</td>
                <td style="padding: 10px 0; color: #635BFF; font-weight: bold;">${registrationId.substring(0, 8).toUpperCase()}</td>
              </tr>
            </table>
            
            <div style="background-color: #e8f4fd; padding: 15px; border-radius: 4px; margin-top: 15px;">
              <p style="color: #0c5460; margin: 0; font-size: 14px;">
                <strong>📧 Important:</strong> After making the bank transfer, please email the bank slip to 
                <a href="mailto:contact@sems.ae" style="color: #0c5460; font-weight: bold;">contact@sems.ae</a> with your registration reference number: <strong>${registrationId.substring(0, 8).toUpperCase()}</strong>
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="color: #721c24; margin: 0; font-size: 14px;">
              <strong>⏰ Note:</strong> Your reservation will be held until 7 days before the course start date. Payment must be received before the course begins to secure your spot.
            </p>
          </div>
        </div>
      `;
      
      // Insert payment section before closing body tag
      emailHtml = emailHtml.replace('</body>', `${paymentSection}</body>`);
    }

    // Prepare email options
    const emailOptions: any = {
      from: "SEMS Training <contact@sems.ae>",
      to: [contactEmail],
      cc: template?.cc_emails || undefined,
      subject: emailSubject,
      html: emailHtml,
    };

    // Add attachments if any were generated
    if (attachments.length > 0) {
      emailOptions.attachments = attachments;
    }

    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Email sent successfully:", emailResponse);

    // Log the email to database
    try {
      await supabase.from('email_logs').insert({
        registration_id: registrationId,
        course_run_id: null, // Will be filled if available
        email_type: emailType || 'registration',
        recipient_email: contactEmail,
        recipient_name: contactName,
        subject: emailSubject,
        status: 'sent',
        template_used: template?.id || null,
        metadata: {
          company_name: companyName,
          course_name: courseName,
          participant_count: participantCount,
          hrdf_grant: hrdfGrant,
          attachments: attachments.map(a => a.filename),
        }
      });
      console.log("Email logged to database successfully");
    } catch (logError) {
      console.error("Error logging email to database:", logError);
      // Don't fail the whole operation just because logging failed
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending enhanced registration email:", error);
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