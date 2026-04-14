import { supabase } from "@/integrations/supabase/client";

export interface TraineeData {
  full_name: string;
  email: string;
}

export interface EmailTemplateData {
  contactName: string;
  contactEmail: string;
  companyName: string;
  courseName: string;
  courseStartDate: string;
  courseEndDate: string;
  participantCount: number;
  hrdfGrant: boolean;
  coursePrice: number;
  totalAmount: number;
  quotationNumber?: string;
  registrationId: string;
  trainees?: TraineeData[];
  websiteUrl?: string;
  registrationUrl?: string;
  paymentLink?: string;
  paymentStatus?: string;
  // Trainee-specific fields
  traineeName?: string;
  courseStartTime?: string;
  courseEndTime?: string;
  location?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  course_id: string | null;
  registration_type: string | null;
  trigger_point: string;
  is_active: boolean;
  include_quotation: boolean;
  attachment_urls: string[] | null;
  cc_emails: string[] | null;
}

export const getEmailTemplate = async (
  courseId: string,
  registrationType: string,
  triggerPoint: string = "registration",
): Promise<EmailTemplate | null> => {
  try {
    // First try to find a specific template for the course and registration type
    let query = supabase.from("email_templates").select("*").eq("is_active", true).eq("trigger_point", triggerPoint);

    // Try to match both course and registration type
    let { data: templates } = await query.eq("course_id", courseId).eq("registration_type", registrationType);

    if (templates && templates.length > 0) {
      return templates[0];
    }

    // If no specific match, try course-specific template (any registration type)
    ({ data: templates } = await query.eq("course_id", courseId).is("registration_type", null));

    if (templates && templates.length > 0) {
      return templates[0];
    }

    // If no course-specific template, try registration type specific (any course)
    ({ data: templates } = await query.is("course_id", null).eq("registration_type", registrationType));

    if (templates && templates.length > 0) {
      return templates[0];
    }

    // Finally, try to get a general template (no course or registration type specified)
    ({ data: templates } = await query.is("course_id", null).is("registration_type", null));

    if (templates && templates.length > 0) {
      return templates[0];
    }

    return null;
  } catch (error) {
    console.error("Error fetching email template:", error);
    return null;
  }
};

export const processEmailTemplate = (
  template: EmailTemplate,
  data: EmailTemplateData,
): { subject: string; html: string } => {
  const generateTraineeRows = (trainees: TraineeData[] = []): string => {
    if (!trainees || trainees.length === 0) {
      return `
      <tr>
        <td style="border:1px solid #000; padding:6px; text-align:center;" colspan="3">
          No trainees registered
        </td>
      </tr>
    `;
    }

    return trainees
      .map((trainee, index) => {
        const name = trainee.full_name?.trim() || "-";
        const email = trainee.email?.trim() || "-";
        const emailCell =
          email === "-" ? "-" : `<a href="mailto:${email}" style="color:#3498db; text-decoration:none;">${email}</a>`;

        return `
        <tr>
          <td style="border:1px solid #000; padding:6px;">${index + 1}</td>
          <td style="border:1px solid #000; padding:6px;">${name}</td>
          <td style="border:1px solid #000; padding:6px;">${emailCell}</td>
        </tr>
      `;
      })
      .join("")
      .trim();
  };

  const replacements: { [key: string]: string } = {
    "{contactName}": data.contactName,
    "{contactEmail}": data.contactEmail,
    "{companyName}": data.companyName,
    "{courseName}": data.courseName,
    "{courseStartDate}": data.courseStartDate,
    "{courseEndDate}": data.courseEndDate,
    "{participantCount}": data.participantCount.toString(),
    "{hrdfGrant}": data.hrdfGrant ? "Yes" : "No",
    "{coursePrice}": data.coursePrice ? `AED ${data.coursePrice.toFixed(2)}` : "",
    "{totalAmount}": data.totalAmount ? `AED ${data.totalAmount.toFixed(2)}` : "",
    "{quotationNumber}": data.quotationNumber || "",
    "{registrationId}": data.registrationId,
    "{traineeRows}": generateTraineeRows(data.trainees),
    "{websiteUrl}": data.websiteUrl || "",
    "{registrationUrl}": data.registrationUrl || "",
    "{paymentLink}": data.paymentLink || "",
    "{paymentStatus}": data.paymentStatus || "Confirmed",
    // Trainee-specific replacements
    "{traineeName}": data.traineeName || "",
    "{courseStartTime}": data.courseStartTime || "",
    "{courseEndTime}": data.courseEndTime || "",
    "{location}": data.location || "SEMS Training Centre, Dubai Healthcare City, Dubai, United Arab Emirates",
  };

  let processedSubject = template.subject;
  let processedHtml = template.html_content;

  // Replace all variables in subject and content
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    processedSubject = processedSubject.replace(regex, value);
    processedHtml = processedHtml.replace(regex, value);
  });

  return {
    subject: processedSubject,
    html: processedHtml,
  };
};
