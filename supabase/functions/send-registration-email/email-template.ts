import { RegistrationData } from './types.ts';
import { inferCourseType, getCourseRequirements, getPreCourseInstructions } from './course-utils.ts';

export function generateEmailContent(data: RegistrationData): string {
  const formattedStartDate = new Date(data.courseStartDate).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  
  const formattedEndDate = data.courseEndDate 
    ? new Date(data.courseEndDate).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })
    : formattedStartDate;

  const courseSchedule = data.courseEndDate && data.courseEndDate !== data.courseStartDate
    ? `${formattedStartDate} to ${formattedEndDate}`
    : formattedStartDate;

  const courseType = inferCourseType(data.courseName);
  const courseRequirements = getCourseRequirements(data.courseName, courseType);
  const preCourseInstructions = getPreCourseInstructions(data.courseName, courseType);
  
  const pricingInfo = generatePricingSection(data);
  const specificInstructions = generateCourseSpecificInstructions(courseType, courseRequirements, preCourseInstructions);

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #3498db;">
        <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎓 Course Registration Confirmed!</h1>
        <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Welcome to your learning journey</p>
      </div>
      
      <div style="padding: 20px 0;">
        <p style="font-size: 16px; color: #2c3e50;">Dear <strong>${data.contactName}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #34495e;">
          Thank you for registering for <strong style="color: #3498db;">${data.courseName}</strong>. 
          We're excited to have you and your team join us for this comprehensive training program!
        </p>
        
        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h2 style="color: #2c3e50; margin-top: 0; font-size: 20px; border-bottom: 1px solid #bdc3c7; padding-bottom: 10px;">📅 Registration Summary</h2>
          <div style="display: grid; gap: 8px;">
            <p style="margin: 5px 0;"><strong>Course:</strong> ${data.courseName}</p>
            <p style="margin: 5px 0;"><strong>Schedule:</strong> ${courseSchedule}</p>
            <p style="margin: 5px 0;"><strong>Organization:</strong> ${data.companyName}</p>
            <p style="margin: 5px 0;"><strong>Participants:</strong> ${data.participantCount}</p>
          </div>
        </div>
        
        ${pricingInfo}
        ${specificInstructions}
        
        <div style="background-color: #e8f6f3; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1abc9c;">
          <h3 style="color: #16a085; margin-top: 0;">💼 Next Steps</h3>
          <ol style="padding-left: 20px; color: #2c3e50;">
            <li>You will receive a detailed quotation within 24 hours</li>
            <li>Course materials and joining instructions will be sent 3 days before the course</li>
            <li>Please confirm your attendance 48 hours before the course date</li>
            <li>Contact us immediately if you need to make any changes</li>
          </ol>
        </div>
        
        <div style="background-color: #fdf2e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e67e22;">
          <h3 style="color: #d35400; margin-top: 0;">📞 Contact Information</h3>
          <p style="color: #8b4513; margin: 0;">
            If you have any questions or need to make changes to your registration, please contact us:
          </p>
          <ul style="color: #8b4513; margin: 10px 0;">
            <li>Email: <a href="mailto:contact@sems.ae" style="color: #3498db;">contact@sems.ae</a></li>
            <li>Phone: +971 4 123 4567</li>
            <li>WhatsApp: +971 54 466 2672</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #ecf0f1; margin-top: 30px;">
          <p style="color: #3498db; font-size: 18px; margin: 0;">We look forward to an excellent training experience!</p>
          <p style="color: #7f8c8d; font-size: 14px; margin: 10px 0 0 0;">Best regards,<br><strong>The Training Team</strong></p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; border-radius: 0 0 8px 8px;">
        This is an automated message. Please do not reply directly to this email.
        <br>For support, please use the contact information provided above.
      </div>
    </div>
  `;
}

function generatePricingSection(data: RegistrationData): string {
  if (!data.coursePrice || !data.totalAmount) return '';
  
  return `
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #495057; margin-top: 0;">Course Investment</h3>
      <p><strong>Price per participant:</strong> AED ${data.coursePrice.toFixed(2)}</p>
      <p><strong>Number of participants:</strong> ${data.participantCount}</p>
      <p><strong>Total amount:</strong> AED ${data.totalAmount.toFixed(2)}</p>
      ${data.quotationNumber ? `<p><strong>Quotation Number:</strong> ${data.quotationNumber}</p>` : ''}
      <p style="font-size: 12px; color: #6c757d;">*Quotation will be sent separately with detailed breakdown</p>
    </div>
  `;
}

function generateCourseSpecificInstructions(courseType: string, courseRequirements: string, preCourseInstructions: string): string {
  switch(courseType) {
    case 'technical':
      return `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h3 style="color: #1565c0; margin-top: 0;">🔧 Technical Course Preparation</h3>
          <div style="white-space: pre-line; font-size: 14px;">${courseRequirements}</div>
        </div>
        <div style="background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #9c27b0;">
          <h3 style="color: #7b1fa2; margin-top: 0;">📋 Pre-Course Instructions</h3>
          <div style="white-space: pre-line; font-size: 14px;">${preCourseInstructions}</div>
        </div>
      `;
    case 'soft-skills':
      return `
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #2e7d32; margin-top: 0;">🌟 Soft Skills Development</h3>
          <div style="white-space: pre-line; font-size: 14px;">${courseRequirements}</div>
        </div>
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <h3 style="color: #ef6c00; margin-top: 0;">🎯 Pre-Course Preparation</h3>
          <div style="white-space: pre-line; font-size: 14px;">${preCourseInstructions}</div>
        </div>
      `;
    case 'compliance':
      return `
        <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;">
          <h3 style="color: #c62828; margin-top: 0;">⚖️ Compliance Training Requirements</h3>
          <div style="white-space: pre-line; font-size: 14px;">${courseRequirements}</div>
        </div>
        <div style="background-color: #fce4ec; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e91e63;">
          <h3 style="color: #ad1457; margin-top: 0;">📝 Important Instructions</h3>
          <div style="white-space: pre-line; font-size: 14px;">${preCourseInstructions}</div>
        </div>
      `;
    default:
      return `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #757575;">
          <h3 style="color: #424242; margin-top: 0;">📚 Course Information</h3>
          <div style="white-space: pre-line; font-size: 14px;">${courseRequirements}</div>
        </div>
        <div style="background-color: #f1f8e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #689f38;">
          <h3 style="color: #558b2f; margin-top: 0;">📋 Preparation Guidelines</h3>
          <div style="white-space: pre-line; font-size: 14px;">${preCourseInstructions}</div>
        </div>
      `;
  }
}
